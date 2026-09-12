import { useEffect, useRef, useState } from 'react'
import { predictRisk } from '../services/mlApi'

function buildReading(sensor) {
  return {
    rainfall_mm: sensor.rainfall,
    soil_moisture_pct: sensor.soilMoisture,
    tilt_deg: sensor.tiltDeg,
    river_level_cm: Number((sensor.waterLevel * 100).toFixed(2)),
  }
}

function useSensorPredictions(sensors) {
  const historyRef = useRef({})
  const requestVersionRef = useRef(0)

  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!sensors || sensors.length === 0) {
      return
    }

    const requestVersion = ++requestVersionRef.current

    async function runPredictions() {
      const nextPredictions = {}
      const nextLoading = {}
      const nextErrors = {}

      for (const sensor of sensors) {
        const reading = buildReading(sensor)

        const existingHistory = historyRef.current[sensor.id] || []

        const updatedHistory = [
          ...existingHistory,
          reading,
        ].slice(-6)

        historyRef.current[sensor.id] = updatedHistory

        if (updatedHistory.length < 6) {
          continue
        }

        nextLoading[sensor.id] = true

        try {
          const result = await predictRisk({
            slope_angle: sensor.slopeAngle,
            soil_type_code: sensor.soilTypeCode,
            historical_risk_score: sensor.historicalRiskScore,
            timeseries: updatedHistory,
          })

          if (requestVersion !== requestVersionRef.current) {
            return
          }

          nextPredictions[sensor.id] = result
        } catch (error) {
          if (requestVersion !== requestVersionRef.current) {
            return
          }

          nextErrors[sensor.id] =
            error instanceof Error
              ? error.message
              : 'ML prediction failed'
        } finally {
          nextLoading[sensor.id] = false
        }
      }

      if (requestVersion !== requestVersionRef.current) {
        return
      }

      setPredictions((current) => ({
        ...current,
        ...nextPredictions,
      }))

      setLoading((current) => ({
        ...current,
        ...nextLoading,
      }))

      setErrors((current) => ({
        ...current,
        ...nextErrors,
      }))
    }

    runPredictions()
  }, [sensors])

  function getHistory(sensorId) {
    return historyRef.current[sensorId] || []
  }

  return {
    predictions,
    loading,
    errors,
    getHistory,
  }
}

export default useSensorPredictions