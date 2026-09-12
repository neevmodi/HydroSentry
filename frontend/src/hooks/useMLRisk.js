import { useEffect, useState } from 'react'
import { predictRisk } from '../services/mlApi'

export function useMLRisk(payload) {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!payload) return

    let cancelled = false

    async function runPrediction() {
      setLoading(true)
      setError(null)

      try {
        const result = await predictRisk(payload)

        if (!cancelled) {
          setPrediction(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    runPrediction()

    return () => {
      cancelled = true
    }
  }, [payload])

  return {
    prediction,
    loading,
    error,
  }
}