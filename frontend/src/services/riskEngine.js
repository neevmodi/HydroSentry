export function calculateRisk(sensor) {
  let score = 0

  // Rainfall
  if (sensor.rainfall > 80) score += 25
  else if (sensor.rainfall > 60) score += 18
  else if (sensor.rainfall > 40) score += 10

  // Water level
  if (sensor.waterLevel > 3.5) score += 30
  else if (sensor.waterLevel > 2.8) score += 22
  else if (sensor.waterLevel > 2.2) score += 12

  // Flow rate
  if (sensor.flowRate > 7) score += 20
  else if (sensor.flowRate > 5) score += 14
  else if (sensor.flowRate > 3) score += 8

  // Soil moisture
  if (sensor.soilMoisture > 90) score += 15
  else if (sensor.soilMoisture > 80) score += 10
  else if (sensor.soilMoisture > 70) score += 5

  score = Math.min(score, 100)

  let level = 'LOW'

  if (score >= 70) level = 'CRITICAL'
  else if (score >= 45) level = 'HIGH'
  else if (score >= 25) level = 'MODERATE'

  return {
    score,
    level,
  }
}