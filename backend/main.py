from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

# =========================
# Load model & threshold
# =========================
model = joblib.load("model/fraud_model.pkl")
fraud_threshold = joblib.load("model/fraud_threshold.pkl")

# =========================
# FastAPI app
# =========================
app = FastAPI(title="Fraud Detection API")

# =========================
# CORS (for React)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Input schema
# =========================
class Transaction(BaseModel):
    distance_from_home: float
    distance_from_last_transaction: float
    ratio_to_median_purchase_price: float
    repeat_retailer: int
    used_chip: int
    used_pin_number: int
    online_order: int

# =========================
# Health check
# =========================
@app.get("/")
def root():
    return {"message": "Fraud Detection API is running"}

# =========================
# Prediction endpoint
# =========================
@app.post("/predict")
def predict(transaction: Transaction):

    # ⚠️ SAME FEATURE ORDER AS TRAINING
    features = np.array([[
        transaction.distance_from_home,
        transaction.distance_from_last_transaction,
        transaction.ratio_to_median_purchase_price,
        transaction.repeat_retailer,
        transaction.used_chip,
        transaction.used_pin_number,
        transaction.online_order
    ]])

    prob = model.predict_proba(features)[0][1]
    is_fraud = int(prob >= fraud_threshold)

    return {
        "fraud_probability": round(prob, 4),
        "fraud_threshold": round(float(fraud_threshold), 4),
        "is_fraud": is_fraud
    }
