import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

df = pd.read_csv("data/cars.csv")

X = df[[
    "Year",
    "Mileage",
    "Fuel_Type",
    "Transmission",
    "Engine",
    "Power",
    "Seats"
]]

y = df["Selling_Price"]

categorical = ["Fuel_Type", "Transmission"]

numerical = ["Year", "Mileage", "Engine", "Power", "Seats"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", "passthrough", numerical)
    ]
)

model = RandomForestRegressor(n_estimators=200, random_state=42)

pipeline = Pipeline([
    ("preprocess", preprocessor),
    ("model", model)
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

pipeline.fit(X_train, y_train)

joblib.dump(pipeline, "artifacts/car_price_pipeline.pkl")

print("Model trained and saved.")