from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout


# ============================================================
# PATHS
# ============================================================

# Project root:
# C:\Users\modin\SIH-Flood-Intelligence
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = PROJECT_ROOT / "ml" / "data" / "timeseries_features.xlsx"
MODEL_DIR = PROJECT_ROOT / "ml" / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

LSTM_MODEL_PATH = MODEL_DIR / "lstm_model.keras"
SCALER_PATH = MODEL_DIR / "lstm_scaler.joblib"


print("=" * 50)
print("HydroSentry LSTM Training")
print("=" * 50)

print(f"Dataset: {DATA_PATH}")
print(f"Model output: {LSTM_MODEL_PATH}")
print(f"Scaler output: {SCALER_PATH}")


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading time-series dataset...")

# File has CSV content despite the .xlsx extension
df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "rainfall_mm",
    "soil_moisture_pct",
    "tilt_deg",
    "river_level_cm",
]

N_TIMESTEPS = 6


# ============================================================
# BUILD SEQUENCES
# ============================================================

event_ids = df["event_id"].unique()

X = []
y = []

for event_id in event_ids:

    event = (
        df[df["event_id"] == event_id]
        .sort_values("timestep")
    )

    if len(event) != N_TIMESTEPS:
        print(
            f"Skipping event {event_id}: "
            f"expected {N_TIMESTEPS} timesteps, got {len(event)}"
        )
        continue

    X.append(event[FEATURES].values)
    y.append(event["label"].iloc[0])


X = np.array(X)
y = np.array(y)

print(f"\nSequence shape: {X.shape}")
print(f"Labels shape: {y.shape}")

print("\nClass distribution:")
print(pd.Series(y).value_counts().sort_index())


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)


# ============================================================
# SCALE DATA
# ============================================================

n_train, n_timesteps, n_features = X_train.shape

scaler = StandardScaler()

X_train_reshaped = X_train.reshape(-1, n_features)
X_test_reshaped = X_test.reshape(-1, n_features)

scaler.fit(X_train_reshaped)

X_train_scaled = scaler.transform(
    X_train_reshaped
).reshape(n_train, n_timesteps, n_features)

X_test_scaled = scaler.transform(
    X_test_reshaped
).reshape(X_test.shape[0], n_timesteps, n_features)


# ============================================================
# BUILD LSTM
# ============================================================

print("\nBuilding LSTM model...")

model = Sequential([
    LSTM(
        32,
        input_shape=(N_TIMESTEPS, n_features),
        return_sequences=False,
    ),
    Dropout(0.2),
    Dense(16, activation="relu"),
    Dense(1, activation="sigmoid"),
])

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"],
)


# ============================================================
# TRAIN
# ============================================================

print("\nTraining LSTM...")

history = model.fit(
    X_train_scaled,
    y_train,
    validation_data=(X_test_scaled, y_test),
    epochs=30,
    batch_size=16,
    verbose=1,
)


# ============================================================
# EVALUATE
# ============================================================

print("\nEvaluating model...")

loss, accuracy = model.evaluate(
    X_test_scaled,
    y_test,
    verbose=0,
)

print(f"LSTM test accuracy: {accuracy:.3f}")


# ============================================================
# SAVE MODEL
# ============================================================

print("\nSaving model...")

model.save(LSTM_MODEL_PATH)

print(f"Saved LSTM model -> {LSTM_MODEL_PATH}")


# ============================================================
# SAVE SCALER
# ============================================================

print("\nSaving scaler...")

joblib.dump(
    scaler,
    SCALER_PATH,
)

print(f"Saved scaler -> {SCALER_PATH}")


# ============================================================
# VERIFY FILES
# ============================================================

print("\nVerifying output files...")

if LSTM_MODEL_PATH.exists():
    print(
        f"LSTM model size: "
        f"{LSTM_MODEL_PATH.stat().st_size:,} bytes"
    )
else:
    print("ERROR: LSTM model was not created!")

if SCALER_PATH.exists():
    print(
        f"Scaler size: "
        f"{SCALER_PATH.stat().st_size:,} bytes"
    )
else:
    print("ERROR: Scaler was not created!")


print("\n" + "=" * 50)
print("LSTM TRAINING COMPLETE")
print("=" * 50)