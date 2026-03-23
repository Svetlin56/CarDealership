from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)
model = joblib.load("artifacts/car_price_pipeline.pkl")

@app.route("/")
def home():
    return "ML Service is running"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        df = pd.DataFrame([data])

        model_features = [
            "Year",
            "Engine_Size",
            "Fuel_Type",
            "Transmission",
            "Mileage",
            "Doors",
            "Owner_Count",
            "Brand",
            "Model"
        ]

        df = df.reindex(columns=model_features, fill_value=0)

        prediction = model.predict(df)[0]

        return jsonify({
            "predicted_price": round(float(prediction), 2)
        })

    except Exception as e:
        print("PREDICT ERROR:", str(e))
        return jsonify({"error": str(e)}), 400


def calculate_score(row):
    score = 0
    score += (row["Year"] - 2000) * 0.5
    score += max(0, 200000 - row["Mileage"]) / 10000
    score += (5 - row["Owner_Count"]) * 2
    return score


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        print("RAW DATA:", data)

        df = pd.DataFrame(data)

        model_features = [
            "Year",
            "Engine_Size",
            "Fuel_Type",
            "Transmission",
            "Mileage",
            "Doors",
            "Owner_Count",
            "Brand",
            "Model"
        ]

        for col in model_features:
            if col not in df.columns:
                df[col] = 0

        df_model = df[model_features].fillna(0)

        print("DF MODEL:", df_model.columns.tolist())

        df["predicted_price"] = model.predict(df_model)

        df["score"] = df.apply(calculate_score, axis=1)

        if "price" in df.columns:
            df["good_deal"] = df["predicted_price"] > df["price"]
        else:
            df["good_deal"] = False

        df["value_score"] = df["score"] + (df["predicted_price"] / 10000)

        df = df.sort_values(by="value_score", ascending=False)

        result = df.head(5).to_dict(orient="records")

        return jsonify(result)

    except Exception as e:
        print("RECOMMEND ERROR:", str(e))
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)