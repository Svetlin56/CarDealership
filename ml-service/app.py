from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

model = joblib.load("artifacts/car_price_pipeline.pkl")

@app.route("/")
def home():
    return """
    <h1>Car Price Prediction API</h1>
    <p>Endpoints:</p>
    <ul>
        <li>POST /predict</li>
        <li>POST /recommend</li>
    </ul>
    """

@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "GET":
        return "Send POST request with JSON data"

    try:
        data = request.get_json()
        df = pd.DataFrame([data])

        prediction = model.predict(df)[0]

        return jsonify({
            "predicted_price": round(float(prediction), 2)
        })

    except Exception as e:
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
        df = pd.DataFrame(data)

        df["predicted_price"] = model.predict(df)

        df["score"] = df.apply(calculate_score, axis=1)

        df["value_score"] = df["score"] + (df["predicted_price"] / 10000)

        df["good_deal"] = df["predicted_price"] > df["predicted_price"].mean()

        df = df.sort_values(by="value_score", ascending=False)

        result = df.head(5).to_dict(orient="records")

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)