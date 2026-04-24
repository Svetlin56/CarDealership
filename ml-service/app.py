from flask import Flask, request, jsonify
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "car_price_pipeline.pkl"
METADATA_PATH = ARTIFACT_DIR / "model_metadata.json"

DEFAULT_MODEL_FEATURES = [
    "Year",
    "Engine_Size",
    "Fuel_Type",
    "Transmission",
    "Mileage",
    "Doors",
    "Owner_Count",
]


def load_metadata():
    if not METADATA_PATH.exists():
        return {
            "model_version": "missing",
            "schema_version": "missing",
            "model_features": DEFAULT_MODEL_FEATURES,
            "metrics": {},
            "artifact_status": "missing_metadata"
        }

    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model artifact was not found at '{MODEL_PATH}'. "
            "Run `python train.py` from the ml-service directory first."
        )

    return joblib.load(MODEL_PATH)


MODEL_METADATA = load_metadata()
MODEL_FEATURES = MODEL_METADATA.get("model_features", DEFAULT_MODEL_FEATURES)
model = load_model()


def get_anomaly_data(real_price, predicted_price):
    if real_price is None or predicted_price is None or float(predicted_price) == 0:
        return {"anomaly_ratio": 0.0, "anomaly_label": "UNKNOWN"}

    ratio = (float(real_price) - float(predicted_price)) / float(predicted_price)

    if ratio > 0.25:
        label = "OVERPRICED"
    elif ratio < -0.25:
        label = "UNDERVALUED"
    else:
        label = "FAIR"

    return {
        "anomaly_ratio": round(ratio, 4),
        "anomaly_label": label
    }


def calculate_score(row):
    score = 0
    score += (row["Year"] - 2000) * 0.5
    score += max(0, 200000 - row["Mileage"]) / 10000
    score += (5 - row["Owner_Count"]) * 2
    return score


def classify_car(row):
    model_name = str(row.get("Model", "")).lower()
    brand = str(row.get("Brand", "")).lower()

    if any(x in model_name for x in ["gtr", "m3", "m5", "amg", "rs", "mustang"]):
        return "SPORT"

    if brand in ["bmw", "audi", "mercedes"] and row["Year"] > 2016:
        return "LUXURY"

    if row["Doors"] >= 4:
        return "FAMILY"

    return "CITY"


def explain(row):
    reasons = []

    if row["Mileage"] < 60000:
        reasons.append("Low mileage")

    if row["Year"] > 2018:
        reasons.append("Newer car")

    if row["predicted_price"] > row["price"]:
        reasons.append("Good price vs market")

    if not reasons:
        reasons.append("Balanced overall characteristics")

    return ", ".join(reasons)


def validate_record(record):
    year = int(record.get("Year", 2018))
    mileage = int(record.get("Mileage", 100000))
    doors = int(record.get("Doors", 4))
    owners = int(record.get("Owner_Count", 1))
    engine_size = float(record.get("Engine_Size", 2.0))
    price = float(record.get("price", 0.0))

    if year < 1945 or year > 2100:
        raise ValueError("Year must be between 1945 and 2100.")
    if mileage < 0 or mileage > 2_000_000:
        raise ValueError("Mileage must be between 0 and 2000000.")
    if doors < 2 or doors > 6:
        raise ValueError("Doors must be between 2 and 6.")
    if owners < 0 or owners > 20:
        raise ValueError("Owner_Count must be between 0 and 20.")
    if engine_size <= 0 or engine_size > 10:
        raise ValueError("Engine_Size must be greater than 0 and at most 10.")
    if price < 0:
        raise ValueError("price cannot be negative.")


def sanitize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    if "Brand" not in df.columns:
        df["Brand"] = "UNKNOWN"
    if "Model" not in df.columns:
        df["Model"] = "UNKNOWN"
    if "price" not in df.columns:
        df["price"] = 0.0

    defaults = {
        "Year": 2018,
        "Engine_Size": 2.0,
        "Fuel_Type": "Petrol",
        "Transmission": "Automatic",
        "Mileage": 100000,
        "Doors": 4,
        "Owner_Count": 1,
    }

    for col, default_value in defaults.items():
        if col not in df.columns:
            df[col] = default_value

    df["Brand"] = df["Brand"].astype(str).str.strip().str.upper()
    df["Model"] = df["Model"].astype(str).str.strip().str.upper()
    df["Fuel_Type"] = df["Fuel_Type"].astype(str).str.strip().str.title()
    df["Transmission"] = df["Transmission"].astype(str).str.strip().str.title()

    numeric_cols = ["Year", "Engine_Size", "Mileage", "Doors", "Owner_Count", "price"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(defaults.get(col, 0))

    records = df.to_dict(orient="records")
    for record in records:
        validate_record(record)

    return pd.DataFrame(records)


def to_native_types(records):
    for record in records:
        for key, value in record.items():
            if isinstance(value, (np.float32, np.float64)):
                record[key] = float(value)
            elif isinstance(value, (np.int32, np.int64)):
                record[key] = int(value)
    return records


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not isinstance(data, dict):
            return jsonify({"error": "Expected a single JSON object"}), 400

        df = pd.DataFrame([data])
        df = sanitize_dataframe(df)

        predicted_price = model.predict(df[MODEL_FEATURES])[0]

        return jsonify({
            "predicted_price": round(float(predicted_price), 2)
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.exception("Prediction failed")
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()

        if not isinstance(data, list):
            return jsonify({"error": "Expected a JSON array"}), 400

        df = pd.DataFrame(data)
        df = sanitize_dataframe(df)

        df["predicted_price"] = model.predict(df[MODEL_FEATURES]).round(2)
        df["score"] = df.apply(calculate_score, axis=1)

        df["value_score"] = (
                (df["predicted_price"] - df["price"]) * 0.7 +
                df["score"] * 0.3
        )

        anomaly = df.apply(
            lambda r: pd.Series(get_anomaly_data(r["price"], r["predicted_price"])),
            axis=1
        )

        df["anomaly_ratio"] = anomaly["anomaly_ratio"]
        df["anomaly_label"] = anomaly["anomaly_label"]
        df["good_deal"] = df["predicted_price"] > df["price"]
        df["confidence"] = (1 - abs(df["anomaly_ratio"])).clip(lower=0, upper=1).round(2)
        df["car_type"] = df.apply(classify_car, axis=1)
        df["explanation"] = df.apply(explain, axis=1)

        df = df.sort_values(by="value_score", ascending=False)

        result = df.to_dict(orient="records")
        result = to_native_types(result)

        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.exception("Recommendation failed")
        return jsonify({"error": "Recommendation failed", "details": str(e)}), 500


@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify(MODEL_METADATA)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "UP",
        "model_loaded": model is not None,
        "model_version": MODEL_METADATA.get("model_version"),
        "schema_version": MODEL_METADATA.get("schema_version")
    })


if __name__ == "__main__":
    app.run(debug=False, port=5000)