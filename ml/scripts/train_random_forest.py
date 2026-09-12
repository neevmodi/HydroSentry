"""
train_random_forest.py
----------------------
Trains the Random Forest on static terrain/history features.

Input:
    ml/data/static_features.csv

Output:
    ml/models/rf_model.joblib
"""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split


# -------------------------------------------------------------------
# PATHS
# -------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

DATA_PATH = PROJECT_ROOT / "ml" / "data" / "static_features.xlsx"
MODEL_DIR = PROJECT_ROOT / "ml" / "models"
MODEL_PATH = MODEL_DIR / "rf_model.joblib"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# -------------------------------------------------------------------
# LOAD DATA
# -------------------------------------------------------------------

print("Loading static dataset...")

df = pd.read_csv(DATA_PATH)

FEATURES = [
    "slope_angle",
    "soil_type_code",
    "historical_risk_score",
]

X = df[FEATURES]
y = df["label"]


# -------------------------------------------------------------------
# TRAIN / TEST SPLIT
# -------------------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)


# -------------------------------------------------------------------
# TRAIN RANDOM FOREST
# -------------------------------------------------------------------

rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=6,
    random_state=42,
)

rf_model.fit(X_train, y_train)


# -------------------------------------------------------------------
# EVALUATION
# -------------------------------------------------------------------

y_pred = rf_model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print()
print("========================================")
print("Random Forest Evaluation")
print("========================================")
print(f"Accuracy: {accuracy:.3f}")
print()

print(
    classification_report(
        y_test,
        y_pred,
        target_names=["Low/Watch", "Warning/Evacuate"],
    )
)


# -------------------------------------------------------------------
# FEATURE IMPORTANCE
# -------------------------------------------------------------------

importances = (
    pd.Series(
        rf_model.feature_importances_,
        index=FEATURES,
    )
    .sort_values(ascending=False)
)

print("Feature importance:")
print(importances)


# -------------------------------------------------------------------
# SAVE MODEL
# -------------------------------------------------------------------

joblib.dump(rf_model, MODEL_PATH)

print()
print(f"Saved Random Forest model -> {MODEL_PATH}")
print(f"Model size: {MODEL_PATH.stat().st_size:,} bytes")