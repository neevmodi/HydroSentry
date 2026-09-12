import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  BarChart3,
  CloudRain,
  Droplets,
  Gauge,
  Info,
  Radio,
  Sprout,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wind,
} from 'lucide-react'

import useLiveSensors from '../hooks/useLiveSensors'
import useSensorPredictions from '../hooks/useSensorPredictions'

const MAX_SESSION_SAMPLES = 120

const metricConfig = {
  rainfall: {
    label: 'Rainfall',
    unit: 'mm',
    color: '#F0A315',
    icon: CloudRain,
    getValue: (sensor) => sensor.rainfall,
  },
  waterLevel: {
    label: 'Water Level',
    unit: 'm',
    color: '#216083',
    icon: Droplets,
    getValue: (sensor) => sensor.waterLevel,
  },
  flowRate: {
    label: 'Flow Rate',
    unit: 'm³/s',
    color: '#DA6D09',
    icon: Gauge,
    getValue: (sensor) => sensor.flowRate,
  },
  soilMoisture: {
    label: 'Soil Moisture',
    unit: '%',
    color: '#216083',
    icon: Sprout,
    getValue: (sensor) => sensor.soilMoisture,
  },
  temperature: {
    label: 'Temperature',
    unit: '°C',
    color: '#F0A315',
    icon: Thermometer,
    getValue: (sensor) => sensor.temperature,
  },
  humidity: {
    label: 'Humidity',
    unit: '%',
    color: '#216083',
    icon: Wind,
    getValue: (sensor) => sensor.humidity,
  },
  riskScore: {
    label: 'Risk Score',
    unit: '%',
    color: '#DA6D09',
    icon: Activity,
    getValue: () => null,
  },
}

const rangeOptions = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
]

const telemetryTrendMetrics = [
  'rainfall',
  'waterLevel',
  'flowRate',
  'soilMoisture',
]

function formatValue(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Collecting'
  }

  return Number(value).toFixed(decimals)
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getRangeSamples(samples, rangeMinutes) {
  if (samples.length === 0) return []

  const cutoff = Date.now() - rangeMinutes * 60 * 1000
  return samples.filter((sample) => sample.timestamp >= cutoff)
}

function getTrend(samples, key) {
  if (samples.length < 2) return null

  const first = Number(samples[0][key])
  const latest = Number(samples[samples.length - 1][key])
  const delta = latest - first
  const threshold = Math.max(Math.abs(first) * 0.02, 0.01)

  if (Math.abs(delta) <= threshold) {
    return { direction: 'stable', label: 'Relatively stable', delta }
  }

  return {
    direction: delta > 0 ? 'up' : 'down',
    label: delta > 0 ? 'Increased' : 'Decreased',
    delta,
  }
}

function getSensorSamples(history, sensorId) {
  if (!sensorId) return []
  return history[sensorId] || []
}

function InlineLineChart({ samples, valueKey, unit, color, label, emptyMessage }) {
  const width = 800
  const height = 280
  const padding = { top: 22, right: 24, bottom: 38, left: 48 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const values = samples
    .map((sample) => Number(sample[valueKey]))
    .filter((value) => Number.isFinite(value))

  if (values.length < 2) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10 px-6 text-center">
        <div>
          <BarChart3 className="mx-auto h-6 w-6 text-slate-600" />
          <p className="mt-3 text-sm text-slate-400">
            {values.length === 0 ? emptyMessage : 'More readings are required to display a meaningful trend.'}
          </p>
        </div>
      </div>
    )
  }

  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const spread = maximum - minimum || Math.max(Math.abs(maximum) * 0.08, 1)
  const domainMin = minimum - spread * 0.12
  const domainMax = maximum + spread * 0.12
  const scaleY = (value) =>
    padding.top + ((domainMax - value) / (domainMax - domainMin)) * chartHeight
  const scaleX = (index) =>
    padding.left + (index / (samples.length - 1)) * chartWidth
  const points = samples
    .map((sample, index) => ({
      x: scaleX(index),
      y: scaleY(Number(sample[valueKey])),
      value: Number(sample[valueKey]),
    }))
    .filter((point) => Number.isFinite(point.value))
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')
  const latest = points[points.length - 1]
  const gridValues = [domainMax, domainMin + (domainMax - domainMin) / 2, domainMin]

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-black/10 p-2 sm:p-4">
      <svg
        className="h-auto w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label} session telemetry trend in ${unit}`}
      >
        {gridValues.map((gridValue) => {
          const y = scaleY(gridValue)

          return (
            <g key={gridValue}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="rgba(254, 246, 231, 0.14)"
                strokeDasharray="4 6"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="rgba(254, 246, 231, 0.58)"
                fontSize="11"
              >
                {formatValue(gridValue)}
              </text>
            </g>
          )
        })}

        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="rgba(254, 246, 231, 0.25)"
        />
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          stroke="rgba(254, 246, 231, 0.25)"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.length <= 24 && points.map((point, index) => (
          <circle
            key={`${point.x}-${index}`}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#062540"
            stroke={color}
            strokeWidth="2"
          />
        ))}

        <text
          x={padding.left}
          y={height - 12}
          fill="rgba(254, 246, 231, 0.58)"
          fontSize="11"
        >
          {formatTimestamp(samples[0].timestamp)}
        </text>
        <text
          x={width - padding.right}
          y={height - 12}
          textAnchor="end"
          fill="rgba(254, 246, 231, 0.58)"
          fontSize="11"
        >
          {formatTimestamp(samples[samples.length - 1].timestamp)}
        </text>
        <circle cx={latest.x} cy={latest.y} r="5" fill={color} />
      </svg>
    </div>
  )
}

function InlineMlChart({ samples }) {
  const width = 800
  const height = 260
  const padding = { top: 20, right: 24, bottom: 38, left: 48 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  if (samples.length < 2) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10 px-6 text-center">
        <div>
          <Activity className="mx-auto h-6 w-6 text-slate-600" />
          <p className="mt-3 text-sm text-slate-400">
            {samples.length === 0
              ? 'Collecting ML inference history...'
              : 'More prediction samples are required to display a meaningful trend.'}
          </p>
        </div>
      </div>
    )
  }

  const scaleX = (index) =>
    padding.left + (index / (samples.length - 1)) * chartWidth
  const scaleY = (value) => padding.top + (1 - value / 100) * chartHeight
  const lines = [
    { key: 'rfScore', label: 'Random Forest', color: '#F0A315' },
    { key: 'lstmScore', label: 'LSTM', color: '#216083' },
    { key: 'fusionScore', label: 'Fusion', color: '#DA6D09' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-black/10 p-2 sm:p-4">
      <svg
        className="h-auto w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="ML inference trend for Random Forest, LSTM, and Fusion scores"
      >
        {[0, 50, 100].map((value) => {
          const y = scaleY(value)

          return (
            <g key={value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="rgba(254, 246, 231, 0.14)"
                strokeDasharray="4 6"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="rgba(254, 246, 231, 0.58)"
                fontSize="11"
              >
                {value}%
              </text>
            </g>
          )
        })}

        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="rgba(254, 246, 231, 0.25)"
        />
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          stroke="rgba(254, 246, 231, 0.25)"
        />

        {lines.map((line) => {
          const points = samples
            .map((sample, index) => `${scaleX(index)},${scaleY(sample[line.key])}`)
            .join(' ')

          return (
            <polyline
              key={line.key}
              points={points}
              fill="none"
              stroke={line.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        })}

        <text x={padding.left} y={height - 12} fill="rgba(254, 246, 231, 0.58)" fontSize="11">
          {formatTimestamp(samples[0].timestamp)}
        </text>
        <text
          x={width - padding.right}
          y={height - 12}
          textAnchor="end"
          fill="rgba(254, 246, 231, 0.58)"
          fontSize="11"
        >
          {formatTimestamp(samples[samples.length - 1].timestamp)}
        </text>
      </svg>

      <div className="flex flex-wrap gap-4 px-2 pb-2 pt-1">
        {lines.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function MetricTrendCard({ metricKey, samples, currentValue }) {
  const config = metricConfig[metricKey]
  const trend = getTrend(samples, metricKey)
  const Icon = config.icon
  const TrendIcon = trend?.direction === 'down'
    ? TrendingDown
    : trend?.direction === 'up'
      ? TrendingUp
      : Activity

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: config.color }} />
          <p className="text-xs font-medium text-slate-300">{config.label}</p>
        </div>
        <TrendIcon className="h-4 w-4 text-slate-500" />
      </div>

      <p className="mt-4 text-xl font-semibold text-slate-100">
        {currentValue === null ? 'Collecting' : `${formatValue(currentValue)} ${config.unit}`}
      </p>

      <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">
        {trend?.label || 'Collecting'}
      </p>
    </div>
  )
}

function Analytics() {
  const sensors = useLiveSensors()
  const {
    predictions,
    errors,
  } = useSensorPredictions(sensors)
  const [telemetryHistory, setTelemetryHistory] = useState({})
  const [predictionHistory, setPredictionHistory] = useState({})
  const lastTelemetrySignatureRef = useRef({})
  const [selectedSensorId, setSelectedSensorId] = useState('ALL')
  const [selectedMetric, setSelectedMetric] = useState('rainfall')
  const [rangeMinutes, setRangeMinutes] = useState(15)

  useEffect(() => {
    async function appendTelemetrySamples() {
      await Promise.resolve()

      setTelemetryHistory((currentHistory) => {
        const nextHistory = { ...currentHistory }

        sensors.forEach((sensor) => {
          const sample = {
            timestamp: Date.now(),
            rainfall: sensor.rainfall,
            waterLevel: sensor.waterLevel,
            flowRate: sensor.flowRate,
            soilMoisture: sensor.soilMoisture,
            temperature: sensor.temperature,
            humidity: sensor.humidity,
          }
          const signature = JSON.stringify(sample)

          if (lastTelemetrySignatureRef.current[sensor.id] === signature) return

          lastTelemetrySignatureRef.current[sensor.id] = signature
          nextHistory[sensor.id] = [
            ...(currentHistory[sensor.id] || []),
            sample,
          ].slice(-MAX_SESSION_SAMPLES)
        })

        return nextHistory
      })
    }

    appendTelemetrySamples()
  }, [sensors])

  useEffect(() => {
    async function appendPredictionSamples() {
      await Promise.resolve()

      setPredictionHistory((currentHistory) => {
        const nextHistory = { ...currentHistory }

        Object.entries(predictions).forEach(([sensorId, prediction]) => {
          if (!prediction) return

          nextHistory[sensorId] = [
            ...(currentHistory[sensorId] || []),
            {
              timestamp: Date.now(),
              rfScore: prediction.rf_score * 100,
              lstmScore: prediction.lstm_score * 100,
              fusionScore: prediction.final_score * 100,
            },
          ].slice(-MAX_SESSION_SAMPLES)
        })

        return nextHistory
      })
    }

    appendPredictionSamples()
  }, [predictions])

  const sensorOptions = useMemo(
    () => [{ id: 'ALL', location: 'All Sensors' }, ...sensors],
    [sensors],
  )
  const selectedSensor = sensors.find((sensor) => sensor.id === selectedSensorId)
  const selectedSensorSamples = getRangeSamples(
    getSensorSamples(telemetryHistory, selectedSensorId),
    rangeMinutes,
  )
  const selectedPredictionSamples = getRangeSamples(
    getSensorSamples(predictionHistory, selectedSensorId),
    rangeMinutes,
  )
  const selectedMetricConfig = metricConfig[selectedMetric]
  const selectedMetricSamples = selectedMetric === 'riskScore'
    ? selectedPredictionSamples
    : selectedSensorSamples
  const selectedMetricValueKey = selectedMetric === 'riskScore'
    ? 'fusionScore'
    : selectedMetric
  const selectedMetricLatest = selectedMetricSamples.length > 0
    ? selectedMetricSamples[selectedMetricSamples.length - 1][selectedMetricValueKey]
    : null
  const selectedSensors = selectedSensorId === 'ALL'
    ? sensors
    : selectedSensor
      ? [selectedSensor]
      : []
  const currentRiskValues = selectedSensors
    .map((sensor) => predictions[sensor.id]?.final_score)
    .filter((value) => Number.isFinite(value))
  const averageRainfall = selectedSensors.length > 0
    ? selectedSensors.reduce((sum, sensor) => sum + sensor.rainfall, 0) / selectedSensors.length
    : null
  const averageWaterLevel = selectedSensors.length > 0
    ? selectedSensors.reduce((sum, sensor) => sum + sensor.waterLevel, 0) / selectedSensors.length
    : null
  const averageRisk = currentRiskValues.length > 0
    ? currentRiskValues.reduce((sum, value) => sum + value, 0) / currentRiskValues.length
    : null
  const telemetryForCards = selectedSensorId === 'ALL' ? [] : selectedSensorSamples
  const mlError = Object.keys(errors).length > 0
  const selectedHistoryAvailable = selectedSensorId !== 'ALL' && selectedSensor
  const CurrentMetricIcon = selectedMetricConfig.icon

  const insights = (() => {
    if (!selectedHistoryAvailable || selectedSensorSamples.length < 2) return []

    const messages = []
    const descriptors = [
      ['rainfall', 'Rainfall'],
      ['waterLevel', 'Water level'],
      ['flowRate', 'Flow rate'],
    ]

    descriptors.forEach(([key, label]) => {
      const trend = getTrend(selectedSensorSamples, key)
      if (!trend || trend.direction === 'stable') return
      messages.push(`${label} has ${trend.direction === 'up' ? 'increased' : 'decreased'} during the current session.`)
    })

    const soilLatest = selectedSensorSamples[selectedSensorSamples.length - 1].soilMoisture
    const soilTrend = getTrend(selectedSensorSamples, 'soilMoisture')

    if (soilTrend && soilTrend.direction !== 'stable') {
      messages.push(`Soil moisture has ${soilTrend.direction === 'up' ? 'increased' : 'decreased'} during the current session.`)
    }

    if (soilLatest >= 80) {
      messages.push('Soil moisture is currently elevated in the selected session stream.')
    }

    return messages
  })()

  function handleSensorChange(event) {
    const nextSensorId = event.target.value
    setSelectedSensorId(nextSensorId)

    if (nextSensorId === 'ALL' && selectedMetric === 'riskScore') {
      setSelectedMetric('rainfall')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Historical Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Explore telemetry trends and model signals across the monitored network.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-cyan-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          SESSION ACTIVE
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
        <p className="text-xs leading-5 text-cyan-100/75">
          Demo analytics — telemetry is simulated and model data is synthetic.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active Nodes" value={selectedSensors.filter((sensor) => sensor.status !== 'Offline').length} unit="nodes" icon={Radio} />
        <SummaryCard label="Average Rainfall" value={averageRainfall === null ? 'Collecting' : formatValue(averageRainfall)} unit={averageRainfall === null ? '' : 'mm'} icon={CloudRain} />
        <SummaryCard label="Average Water Level" value={averageWaterLevel === null ? 'Collecting' : formatValue(averageWaterLevel, 2)} unit={averageWaterLevel === null ? '' : 'm'} icon={Droplets} />
        <SummaryCard label="Current Risk" value={averageRisk === null ? 'Collecting' : formatValue(averageRisk * 100)} unit={averageRisk === null ? '' : '% fusion'} icon={Activity} />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Sensor
            </span>
            <select
              value={selectedSensorId}
              onChange={handleSensorChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-400/40"
            >
              {sensorOptions.map((sensor) => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.location}{sensor.id === 'ALL' ? '' : ` · ${sensor.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Metric
            </span>
            <select
              value={selectedMetric}
              onChange={(event) => setSelectedMetric(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-400/40"
            >
              {Object.entries(metricConfig).map(([key, config]) => (
                <option key={key} value={key} disabled={key === 'riskScore' && selectedSensorId === 'ALL'}>
                  {config.label}{key === 'riskScore' && selectedSensorId === 'ALL' ? ' · select a sensor' : ''}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Session range
            </span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-black/20 p-1">
              {rangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRangeMinutes(option.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    rangeMinutes === option.value
                      ? 'bg-cyan-400/10 text-cyan-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Session Telemetry
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-100">
                {selectedHistoryAvailable ? selectedMetricConfig.label : 'Select a sensor'}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {selectedHistoryAvailable
                  ? `${selectedSensor.id} · Collected while this page is open`
                  : 'Select a sensor to explore its session trend.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-right">
              <CurrentMetricIcon className="h-4 w-4" style={{ color: selectedMetricConfig.color }} />
              <div>
                <p className="text-2xl font-semibold text-slate-100">
                  {selectedMetricLatest === null ? 'Collecting' : `${formatValue(selectedMetricLatest)} ${selectedMetricConfig.unit}`}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Latest value
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {selectedHistoryAvailable ? (
              <InlineLineChart
                samples={selectedMetricSamples}
                valueKey={selectedMetricValueKey}
                unit={selectedMetricConfig.unit}
                color={selectedMetricConfig.color}
                label={selectedMetricConfig.label}
                emptyMessage={selectedMetric === 'riskScore' ? 'ML trend unavailable until predictions are returned.' : 'Collecting telemetry...'}
              />
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10 px-6 text-center">
                <p className="text-sm text-slate-400">
                  Select a sensor to explore its session trend.
                </p>
              </div>
            )}
          </div>

          {selectedMetricSamples.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-500">
              <span>Range: {formatValue(Math.min(...selectedMetricSamples.map((sample) => sample[selectedMetricValueKey])))}–{formatValue(Math.max(...selectedMetricSamples.map((sample) => sample[selectedMetricValueKey])))} {selectedMetricConfig.unit}</span>
              <span>{selectedMetricSamples.length} collected samples</span>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl sm:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Session Insights
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-100">
            Transparent observations
          </h2>

          {insights.length > 0 ? (
            <div className="mt-5 space-y-3">
              {insights.map((insight) => (
                <div key={insight} className="flex gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <p className="text-sm leading-5 text-slate-300">{insight}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-slate-500">
              {selectedHistoryAvailable
                ? 'More readings are required to display a meaningful trend.'
                : 'Select a sensor to explore its session trend.'}
            </p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {telemetryTrendMetrics.map((metricKey) => {
          const latest = selectedSensor
            ? selectedSensor[metricKey]
            : null

          return (
            <MetricTrendCard
              key={metricKey}
              metricKey={metricKey}
              samples={telemetryForCards}
              currentValue={latest}
            />
          )
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              ML Intelligence
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">
              ML Inference Trend
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Prediction samples returned by the current risk model.
            </p>
          </div>

          {mlError && (
            <p className="text-xs text-amber-300">
              ML trend unavailable until predictions are returned.
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Random Forest', 'rfScore', '#F0A315'],
            ['LSTM', 'lstmScore', '#216083'],
            ['Fusion', 'fusionScore', '#DA6D09'],
          ].map(([label, key, color]) => {
            const latest = selectedPredictionSamples[selectedPredictionSamples.length - 1]?.[key]

            return (
              <div key={key} className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-semibold" style={{ color }}>
                  {latest === undefined ? 'Collecting' : `${formatValue(latest)}%`}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-5">
          {selectedSensorId === 'ALL' ? (
            <p className="rounded-xl border border-dashed border-white/10 bg-black/10 p-6 text-center text-sm text-slate-500">
              Select a sensor to explore its ML inference trend.
            </p>
          ) : (
            <InlineMlChart samples={selectedPredictionSamples} />
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-cyan-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Observation Context
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">
              Sentinel-1 Observation Context
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          This describes the currently configured observation layer. It is not a historical satellite observation record.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ContextItem label="Source" value="Copernicus Sentinel-1" />
          <ContextItem label="Sensor" value="SAR" />
          <ContextItem label="Mode" value="IW / VV" />
          <ContextItem label="Status" value="Configured" />
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ label, value, unit, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-100">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>}
      </p>
    </div>
  )
}

function ContextItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  )
}

export default Analytics