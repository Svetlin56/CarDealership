import json
import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA_PATH = "data/cars.csv"
ARTIFACT_DIR = "artifacts"
ARTIFACT_PATH = os.path.join(ARTIFACT_DIR, "car_price_pipeline.pkl")
METADATA_PATH = os.path.join(ARTIFACT_DIR, "model_metadata.json")

MODEL_FEATURES = [
    "Brand",
    "Model",
    "Year",
    "Engine_Size",
    "Fuel_Type",
    "Transmission",
    "Mileage",
    "Doors",
    "Owner_Count",
]

TARGET_COLUMN = "Price"
MODEL_VERSION = "1.2.0"
SCHEMA_VERSION = "2"


def main():
    df = pd.read_csv(DATA_PATH)

    x = df[MODEL_FEATURES]
    y = df[TARGET_COLUMN]

    categorical = ["Brand", "Model", "Fuel_Type", "Transmission"]
    numerical = ["Year", "Engine_Size", "Mileage", "Doors", "Owner_Count"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("num", "passthrough", numerical),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42
    )

    pipeline = Pipeline([
        ("preprocess", preprocessor),
        ("model", model)
    ])

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42
    )

    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    mae = float(mean_absolute_error(y_test, predictions))
    rmse = float(mean_squared_error(y_test, predictions) ** 0.5)
    r2 = float(r2_score(y_test, predictions))

    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    joblib.dump(pipeline, ARTIFACT_PATH)

    metadata = {
        "model_version": MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "target_column": TARGET_COLUMN,
        "model_features": MODEL_FEATURES,
        "metrics": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4)
        }
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("Model trained successfully.")
    print(f"Saved model to: {ARTIFACT_PATH}")
    print(f"Saved metadata to: {METADATA_PATH}")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R^2: {r2:.4f}")


if __name__ == "__main__":
    main()