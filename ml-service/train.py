import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "cars.csv")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "car_price_pipeline.pkl")


def main():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    df = pd.read_csv(DATA_PATH)

    expected_columns = [
        "make",
        "model",
        "year",
        "mileage",
        "price"
    ]

    missing = [c for c in expected_columns if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")

    df = df[expected_columns].copy()
    df = df.dropna(subset=["price"])

    x = df[["make", "model", "year", "mileage"]]
    y = df["price"]

    categorical_features = ["make", "model"]
    numeric_features = ["year", "mileage"]

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median"))
    ])

    preprocessor = ColumnTransformer([
        ("cat", categorical_pipeline, categorical_features),
        ("num", numeric_pipeline, numeric_features)
    ])

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            n_jobs=-1
        ))
    ])

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42
    )

    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    mae = mean_absolute_error(y_test, predictions)
    rise = mean_squared_error(y_test, predictions) ** 0.5
    r2 = r2_score(y_test, predictions)

    print("Training completed")
    print(f"MAE:  {mae:.2f}")
    print(f"RISE: {rise:.2f}")
    print(f"R2:   {r2:.4f}")

    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")


if __name__ == "__main__":
    main()