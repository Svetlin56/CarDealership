from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)
model = joblib.load("artifacts/car_price_pipeline.pkl")


def get_anomaly_data(real_price, predicted_price):
    if real_price is None or predicted_price is None or predicted_price == 0:
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
    model = str(row["Model"]).lower()
    brand = str(row["Brand"]).lower()

    if any(x in model for x in ["gtr", "m3", "m5", "amg", "rs", "mustang"]):
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

    return ", ".join(reasons)


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        df = pd.DataFrame(data)

        model_features = [
            "Year", "Engine_Size", "Fuel_Type", "Transmission",
            "Mileage", "Doors", "Owner_Count", "Brand", "Model"
        ]

        for col in model_features:
            if col not in df.columns:
                df[col] = 0

        df["Brand"] = df["Brand"].astype(str).str.upper()
        df["Model"] = df["Model"].astype(str).str.upper()
        df["Fuel_Type"] = df["Fuel_Type"].astype(str).str.upper()
        df["Transmission"] = df["Transmission"].astype(str).str.upper()

        df_model = df[model_features].fillna(0)

        df["predicted_price"] = model.predict(df_model).round(2)

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

        df["confidence"] = (1 - abs(df["anomaly_ratio"])).round(2)

        df["car_type"] = df.apply(classify_car, axis=1)

        df["explanation"] = df.apply(explain, axis=1)

        df = df.sort_values(by="value_score", ascending=False)

        result = df.to_dict(orient="records")

        for r in result:
            for k, v in r.items():
                if isinstance(v, (np.float32, np.float64)):
                    r[k] = float(v)
                elif isinstance(v, (np.int32, np.int64)):
                    r[k] = int(v)

        return jsonify(result)

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)