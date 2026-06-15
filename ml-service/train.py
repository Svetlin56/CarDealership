import json
import os

import joblib
import numpy as np
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
MODEL_VERSION = "1.2.1"
SCHEMA_VERSION = "2"


def calculate_mape(y_true, y_pred):
    y_true_array = np.asarray(y_true, dtype=float)
    y_pred_array = np.asarray(y_pred, dtype=float)

    non_zero_mask = y_true_array != 0

    if not np.any(non_zero_mask):
        return None

    return float(
        np.mean(
            np.abs(
                (y_true_array[non_zero_mask] - y_pred_array[non_zero_mask])
                / y_true_array[non_zero_mask]
            )
        ) * 100
    )


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
    mape = calculate_mape(y_test, predictions)

    approximate_accuracy = None
    if mape is not None:
        approximate_accuracy = max(0.0, 100.0 - mape)

    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    joblib.dump(pipeline, ARTIFACT_PATH)

    metrics = {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "mape": round(mape, 4) if mape is not None else None,
        "approximate_accuracy": round(approximate_accuracy, 4) if approximate_accuracy is not None else None
    }

    metadata = {
        "model_version": MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "target_column": TARGET_COLUMN,
        "model_features": MODEL_FEATURES,
        "metrics": metrics
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("Model trained successfully.")
    print(f"Saved model to: {ARTIFACT_PATH}")
    print(f"Saved metadata to: {METADATA_PATH}")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R^2: {r2:.4f}")

    if mape is not None and approximate_accuracy is not None:
        print(f"MAPE: {mape:.2f}%")
        print(f"Approximate accuracy: {approximate_accuracy:.2f}%")
    else:
        print("MAPE: N/A")
        print("Approximate accuracy: N/A")


if __name__ == "__main__":
    main()