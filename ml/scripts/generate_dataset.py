"""
generate_dataset.py
--------------------
Creates a synthetic (but realistic-pattern) dataset for the flash-flood /
landslide hybrid model, since real sensor data isn't available yet.

Produces two files:
  static_features.csv     -> for Random Forest (one row per village-event)
  timeseries_features.csv -> for LSTM (long format: 6 timesteps per event)

Both share the same `event_id` and `label` so they can be joined later
when training the fusion step.
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N_EVENTS = 800          # number of village-events (rows)
N_TIMESTEPS = 6          # 6 hourly readings leading up to each event

rows_static = []
rows_ts = []

for event_id in range(N_EVENTS):
    # ---- STATIC (fixed) features: terrain / history ----
    slope_angle = np.random.uniform(10, 45)                 # degrees
    soil_type_code = np.random.randint(0, 4)                # 0=rocky 1=sandy 2=loamy 3=clay
    historical_risk_score = np.random.uniform(0, 1)         # from GSI-style susceptibility zoning

    # normalize slope into 0-1 for combining
    slope_norm = (slope_angle - 10) / (45 - 10)
    static_risk = 0.4 * slope_norm + 0.6 * historical_risk_score

    # ---- Decide if this event has a "building" dynamic trend ----
    is_rising_trend = np.random.rand() < 0.35   # ~35% of events show worsening conditions

    rainfall, soil_moisture, tilt, river_level = [], [], [], []
    base_rain = np.random.uniform(2, 8)
    base_soil = np.random.uniform(20, 40)
    base_tilt = np.random.uniform(0, 0.5)
    base_river = np.random.uniform(50, 100)

    for t in range(N_TIMESTEPS):
        if is_rising_trend:
            rainfall.append(base_rain + t * np.random.uniform(3, 7) + np.random.normal(0, 1))
            soil_moisture.append(min(100, base_soil + t * np.random.uniform(4, 9) + np.random.normal(0, 1)))
            tilt.append(base_tilt + t * np.random.uniform(0.15, 0.4) + np.random.normal(0, 0.02))
            river_level.append(base_river + t * np.random.uniform(10, 25) + np.random.normal(0, 2))
        else:
            rainfall.append(max(0, base_rain + np.random.normal(0, 1.5)))
            soil_moisture.append(base_soil + np.random.normal(0, 2))
            tilt.append(base_tilt + np.random.normal(0, 0.03))
            river_level.append(base_river + np.random.normal(0, 3))

    # ---- Dynamic severity score from the trend just generated ----
    rain_rise = rainfall[-1] - rainfall[0]
    soil_rise = soil_moisture[-1] - soil_moisture[0]
    tilt_rise = tilt[-1] - tilt[0]
    river_rise = river_level[-1] - river_level[0]

    dynamic_severity = (
        0.35 * np.clip(rain_rise / 30, 0, 1) +
        0.25 * np.clip(soil_rise / 40, 0, 1) +
        0.20 * np.clip(tilt_rise / 2, 0, 1) +
        0.20 * np.clip(river_rise / 120, 0, 1)
    )

    # ---- Combine static + dynamic into final combined score + label ----
    combined_score = 0.5 * static_risk + 0.5 * dynamic_severity + np.random.normal(0, 0.03)
    label = 1 if combined_score > 0.55 else 0   # 1 = high risk event, 0 = low risk

    rows_static.append({
        "event_id": event_id,
        "slope_angle": round(slope_angle, 2),
        "soil_type_code": soil_type_code,
        "historical_risk_score": round(historical_risk_score, 3),
        "label": label
    })

    for t in range(N_TIMESTEPS):
        rows_ts.append({
            "event_id": event_id,
            "timestep": t,
            "rainfall_mm": round(rainfall[t], 2),
            "soil_moisture_pct": round(soil_moisture[t], 2),
            "tilt_deg": round(tilt[t], 3),
            "river_level_cm": round(river_level[t], 2),
            "label": label
        })

df_static = pd.DataFrame(rows_static)
df_ts = pd.DataFrame(rows_ts)

df_static.to_csv("static_features.csv", index=False)
df_ts.to_csv("timeseries_features.csv", index=False)

print("Static dataset:", df_static.shape, "| Positive rate:", df_static.label.mean().round(3))
print("Timeseries dataset:", df_ts.shape)
print(df_static.head())
print(df_ts.head(8))
