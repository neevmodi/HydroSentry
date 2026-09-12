"""
HydroSentry ML Risk API
-----------------------
Flask API for flood / landslide risk inference.

Models:
- Random Forest -> static/background risk
- LSTM -> dynamic/time-series risk
- Late fusion -> final risk score

Run from the project root:
    python backend/app.py

API:
    GET  /
    GET  /health
    POST /predict
"""

from pathlib import Path

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from tensorflow.keras.models import load_model


# -------------------------------------------------------------------
# APP CONFIGURATION
# -------------------------------------------------------------------

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "ml" / "models"

RF_MODEL_PATH = MODEL_DIR / "rf_model.joblib"
LSTM_MODEL_PATH = MODEL_DIR / "lstm_model.keras"
LSTM_SCALER_PATH = MODEL_DIR / "lstm_scaler.joblib"


# -------------------------------------------------------------------
# LOAD MODELS
# -------------------------------------------------------------------

print("Loading HydroSentry ML models...")

rf_model = joblib.load(RF_MODEL_PATH)
lstm_model = load_model(LSTM_MODEL_PATH)
lstm_scaler = joblib.load(LSTM_SCALER_PATH)

print("Random Forest loaded.")
print("LSTM model loaded.")
print("LSTM scaler loaded.")
print("HydroSentry ML API ready.")


# -------------------------------------------------------------------
# MODEL CONFIGURATION
# -------------------------------------------------------------------

RF_WEIGHT = 0.5
LSTM_WEIGHT = 0.5

EXPECTED_TIMESTEPS = 6
TIME_SERIES_FEATURES = 4


# -------------------------------------------------------------------
# RISK CLASSIFICATION
# -------------------------------------------------------------------

def risk_level_from_score(score):
    if score < 0.30:
        return "Low"
    elif score < 0.55:
        return "Watch"
    elif score < 0.80:
        return "Warning"
    else:
        return "Evacuate"


# -------------------------------------------------------------------
# HEALTH ENDPOINT
# -------------------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "ok",
        "service": "HydroSentry ML Risk API"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "models": {
            "random_forest": "loaded",
            "lstm": "loaded",
            "lstm_scaler": "loaded"
        }
    })


# -------------------------------------------------------------------
# PREDICTION ENDPOINT
# -------------------------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body must contain valid JSON."
        }), 400

    # ---------------------------------------------------------------
    # Validate static features
    # ---------------------------------------------------------------

    required_static = [
        "slope_angle",
        "soil_type_code",
        "historical_risk_score",
    ]

    missing_static = [
        field for field in required_static
        if field not in data
    ]

    if missing_static:
        return jsonify({
            "error": "Missing static feature(s).",
            "missing": missing_static
        }), 400

    # ---------------------------------------------------------------
    # Validate time-series data
    # ---------------------------------------------------------------

    if "timeseries" not in data:
        return jsonify({
            "error": "Missing 'timeseries' data."
        }), 400

    ts = data["timeseries"]

    if not isinstance(ts, list):
        return jsonify({
            "error": "'timeseries' must be a list."
        }), 400

    if len(ts) != EXPECTED_TIMESTEPS:
        return jsonify({
            "error": f"Exactly {EXPECTED_TIMESTEPS} timesteps are required.",
            "received": len(ts)
        }), 400

    required_ts = [
        "rainfall_mm",
        "soil_moisture_pct",
        "tilt_deg",
        "river_level_cm",
    ]

    for index, row in enumerate(ts):

        if not isinstance(row, dict):
            return jsonify({
                "error": f"Timestep {index} must be an object."
            }), 400

        missing = [
            field for field in required_ts
            if field not in row
        ]

        if missing:
            return jsonify({
                "error": f"Missing feature(s) in timestep {index}.",
                "missing": missing
            }), 400

    try:

        # -----------------------------------------------------------
        # Random Forest
        # -----------------------------------------------------------

        static_X = np.array([[
            float(data["slope_angle"]),
            float(data["soil_type_code"]),
            float(data["historical_risk_score"]),
        ]])

        rf_score = float(
            rf_model.predict_proba(static_X)[0][1]
        )

        # -----------------------------------------------------------
        # LSTM
        # -----------------------------------------------------------

        ts_array = np.array([
            [
                float(row["rainfall_mm"]),
                float(row["soil_moisture_pct"]),
                float(row["tilt_deg"]),
                float(row["river_level_cm"]),
            ]
            for row in ts
        ])

        ts_scaled = lstm_scaler.transform(ts_array)

        ts_input = ts_scaled.reshape(
            1,
            EXPECTED_TIMESTEPS,
            TIME_SERIES_FEATURES
        )

        lstm_score = float(
            lstm_model.predict(
                ts_input,
                verbose=0
            )[0][0]
        )

        # -----------------------------------------------------------
        # Late Fusion
        # -----------------------------------------------------------

        final_score = (
            RF_WEIGHT * rf_score
            + LSTM_WEIGHT * lstm_score
        )

        final_score = float(
            np.clip(final_score, 0.0, 1.0)
        )

        risk_level = risk_level_from_score(final_score)

        # -----------------------------------------------------------
        # Response
        # -----------------------------------------------------------

        return jsonify({
            "rf_score": round(rf_score, 3),
            "lstm_score": round(lstm_score, 3),
            "final_score": round(final_score, 3),
            "risk_level": risk_level,
            "model": {
                "random_forest_weight": RF_WEIGHT,
                "lstm_weight": LSTM_WEIGHT
            }
        })

    except (ValueError, TypeError) as error:

        return jsonify({
            "error": "Invalid numeric input.",
            "details": str(error)
        }), 400

    except Exception as error:

        app.logger.exception("Prediction failed.")

        return jsonify({
            "error": "Prediction failed.",
            "details": str(error)
        }), 500


# -------------------------------------------------------------------
# START SERVER
# -------------------------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )