import { useEffect, useState } from 'react'
import { sensorData } from '../data/sensorData'

function randomChange(value, amount) {
  return value + (Math.random() * amount * 2 - amount)
}

function useLiveSensors() {
  const [sensors, setSensors] = useState(sensorData)

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((currentSensors) =>
        currentSensors.map((sensor) => ({
          ...sensor,

          rainfall: Math.max(
            0,
            Number(randomChange(sensor.rainfall, 2).toFixed(1))
          ),

          waterLevel: Math.max(
            0,
            Number(randomChange(sensor.waterLevel, 0.04).toFixed(2))
          ),

          flowRate: Math.max(
            0,
            Number(randomChange(sensor.flowRate, 0.15).toFixed(2))
          ),

          soilMoisture: Math.min(
            100,
            Math.max(
              0,
              Number(randomChange(sensor.soilMoisture, 1).toFixed(1))
            )
          ),

          temperature: Number(
            randomChange(sensor.temperature, 0.2).toFixed(1)
          ),

          humidity: Math.min(
            100,
            Math.max(
              0,
              Number(randomChange(sensor.humidity, 0.5).toFixed(1))
            )
          ),

          // Simulated ground-tilt telemetry
          tiltDeg: Math.max(
            0,
            Number(randomChange(sensor.tiltDeg, 0.03).toFixed(3))
          ),

          lastUpdate: 'just now',
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return sensors
}

export default useLiveSensors