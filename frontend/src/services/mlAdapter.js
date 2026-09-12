export function buildMLPayload({
  slopeAngle = 32.5,
  soilTypeCode = 2,
  historicalRiskScore = 0.5,
  timeseries,
}) {
  if (!Array.isArray(timeseries) || timeseries.length !== 6) {
    throw new Error('ML prediction requires exactly 6 time-series readings')
  }

  return {
    slope_angle: slopeAngle,
    soil_type_code: soilTypeCode,
    historical_risk_score: historicalRiskScore,

    timeseries: timeseries.map((reading) => ({
      rainfall_mm: Number(reading.rainfall_mm),
      soil_moisture_pct: Number(reading.soil_moisture_pct),
      tilt_deg: Number(reading.tilt_deg),
      river_level_cm: Number(reading.river_level_cm),
    })),
  }
}