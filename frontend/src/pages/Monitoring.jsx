import {
  Activity,
  Droplets,
  Gauge,
  CloudRain,
  Thermometer,
  Wind,
  Sprout,
  Clock,
} from 'lucide-react'

import useLiveSensors from '../hooks/useLiveSensors'
import useSensorPredictions from '../hooks/useSensorPredictions'
import { calculateRisk } from '../services/riskEngine'

function normalizeRiskLevel(level) {
  const normalized = String(level || '').toLowerCase()

  const mapping = {
    low: 'LOW',
    watch: 'MODERATE',
    warning: 'HIGH',
    evacuate: 'CRITICAL',
  }

  return mapping[normalized] || 'LOW'
}

function StatusBadge({ status }) {
  const styles = {
    Online: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    Warning: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    Critical: 'bg-red-400/10 text-red-400 border-red-400/20',
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
        styles[status]
      }`}
    >
      {status}
    </span>
  )
}

function SensorCard({ sensor, mlPrediction }) {
  const fallbackRisk = calculateRisk(sensor)

  const risk = mlPrediction
    ? {
        score: Math.round(mlPrediction.final_score * 100),
        level: normalizeRiskLevel(mlPrediction.risk_level),
      }
    : fallbackRisk

  const metrics = [
    {
      label: 'Rainfall',
      value: `${sensor.rainfall} mm`,
      icon: CloudRain,
    },
    {
      label: 'Water Level',
      value: `${sensor.waterLevel} m`,
      icon: Droplets,
    },
    {
      label: 'Flow Rate',
      value: `${sensor.flowRate} m³/s`,
      icon: Gauge,
    },
    {
      label: 'Soil Moisture',
      value: `${sensor.soilMoisture}%`,
      icon: Sprout,
    },
    {
      label: 'Temperature',
      value: `${sensor.temperature}°C`,
      icon: Thermometer,
    },
    {
      label: 'Humidity',
      value: `${sensor.humidity}%`,
      icon: Wind,
    },
  ]

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-white/15 hover:bg-white/[0.04]">

      {/* Sensor Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />

            <h2 className="text-sm font-semibold text-slate-100">
              {sensor.id}
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {sensor.location}
          </p>
        </div>

        <StatusBadge status={sensor.status} />
      </div>

      {/* Flood Risk */}
      <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Flood Risk
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-100">
              {risk.score}%
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider ${
              risk.level === 'CRITICAL'
                ? 'bg-red-400/10 text-red-400'
                : risk.level === 'HIGH'
                  ? 'bg-orange-400/10 text-orange-400'
                  : risk.level === 'MODERATE'
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'bg-emerald-400/10 text-emerald-400'
            }`}
          >
            {risk.level}
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-current transition-all duration-700"
            style={{ width: `${risk.score}%` }}
          />
        </div>

        {mlPrediction && (
          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              ML inference active
            </span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <div
              key={metric.label}
              className="rounded-xl border border-white/5 bg-black/20 p-3"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-slate-500" />

                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {metric.label}
                </p>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-200">
                {metric.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
        <Clock className="h-3.5 w-3.5 text-slate-600" />

        <p className="text-[11px] text-slate-500">
          Last update: {sensor.lastUpdate}
        </p>
      </div>
    </div>
  )
}

function Monitoring() {
  const liveSensors = useLiveSensors()

  const {
    predictions: mlPredictions,
    loading: mlLoading,
    errors: mlErrors,
  } = useSensorPredictions(liveSensors)

  const onlineCount = liveSensors.filter(
    (sensor) => sensor.status === 'Online'
  ).length

  const warningCount = liveSensors.filter(
    (sensor) => sensor.status === 'Warning'
  ).length

  const criticalCount = liveSensors.filter(
    (sensor) => sensor.status === 'Critical'
  ).length

  return (
    <div>
      {/* Page Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Real-Time Telemetry
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
              Live Monitoring
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Real-time environmental telemetry from deployed sensor nodes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Live data stream
          </div>
        </div>
      </div>

      {/* Network Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Online Nodes
          </p>

          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            {onlineCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Warning Nodes
          </p>

          <p className="mt-2 text-2xl font-semibold text-amber-400">
            {warningCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Critical Nodes
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-400">
            {criticalCount}
          </p>
        </div>
      </div>

      {/* Sensor List */}
      <div className="mt-8 space-y-4">
        {liveSensors.map((sensor) => (
          <SensorCard
            key={sensor.id}
            sensor={sensor}
            mlPrediction={mlPredictions[sensor.id]}
          />
        ))}
      </div>
    </div>
  )
}

export default Monitoring