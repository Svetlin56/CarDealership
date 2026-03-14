import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "artifacts", "car_price_pipeline.pkl")

app = Flask(__name__)
pipeline = joblib.load(MODEL_PATH)


@app.post("/predict")
def predict():
    payload = request.get_json()

    required_fields = ["make", "model", "year", "mileage"]
    missing = [field for field in required_fields if field not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    input_df = pd.DataFrame([{
        "make": payload["make"],
        "model": payload["model"],
        "year": payload["year"],
        "mileage": payload["mileage"]
    }])

    predicted_price = pipeline.predict(input_df)[0]

    return jsonify({
        "predictedPrice": round(float(predicted_price), 2)
    })


@app.get("/health")
def health():
    return jsonify({"status": "UP"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)