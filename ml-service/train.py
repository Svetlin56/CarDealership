import os
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA_PATH = "data/cars.csv"
ARTIFACT_DIR = "artifacts"
ARTIFACT_PATH = os.path.join(ARTIFACT_DIR, "car_price_pipeline.pkl")

MODEL_FEATURES = [
    "Year",
    "Engine_Size",
    "Fuel_Type",
    "Transmission",
    "Mileage",
    "Doors",
    "Owner_Count",
]

TARGET_COLUMN = "Price"


def main():
    df = pd.read_csv(DATA_PATH)

    x = df[MODEL_FEATURES]
    y = df[TARGET_COLUMN]

    categorical = ["Fuel_Type", "Transmission"]
    numerical = ["Year", "Engine_Size", "Mileage", "Doors", "Owner_Count"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("num", "passthrough", numerical),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=200,
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

    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    joblib.dump(pipeline, ARTIFACT_PATH)

    score = pipeline.score(x_test, y_test)

    print("Model trained successfully.")
    print(f"Saved to: {ARTIFACT_PATH}")
    print(f"R^2 on test set: {score:.4f}")


if __name__ == "__main__":
    main()