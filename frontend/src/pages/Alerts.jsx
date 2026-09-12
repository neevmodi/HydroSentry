import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronRight,
  CircleAlert,
  CloudRain,
  Clock3,
  Droplets,
  Gauge,
  Info,
  Search,
  Sprout,
  Thermometer,
  Wind,
  X,
} from 'lucide-react'

import useLiveSensors from '../hooks/useLiveSensors'
import useSensorPredictions from '../hooks/useSensorPredictions'
import { calculateRisk } from '../services/riskEngine'

const severityConfig = {
  CRITICAL: {
    label: 'Critical',
    icon: CircleAlert,
    text: 'text-red-400',
    border: 'border-red-400/20',
    background: 'bg-red-400/10',
    dot: 'bg-red-400',
  },
  HIGH: {
    label: 'High',
    icon: AlertTriangle,
    text: 'text-orange-400',
    border: 'border-orange-400/20',
    background: 'bg-orange-400/10',
    dot: 'bg-orange-400',
  },
  MEDIUM: {
    label: 'Medium',
    icon: AlertTriangle,
    text: 'text-amber-400',
    border: 'border-amber-400/20',
    background: 'bg-amber-400/10',
    dot: 'bg-amber-400',
  },
  INFO: {
    label: 'Info',
    icon: Info,
    text: 'text-cyan-400',
    border: 'border-cyan-400/20',
    background: 'bg-cyan-400/10',
    dot: 'bg-cyan-400',
  },
}

const statusConfig = {
  Active: 'border-red-400/20 bg-red-400/10 text-red-300',
  Acknowledged: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  Investigating: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  Resolved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
}

const filterOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'INFO', label: 'Info' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RESOLVED', label: 'Resolved' },
]

function normalizeMlSeverity(score) {
  if (score >= 0.75) return 'CRITICAL'
  if (score >= 0.55) return 'HIGH'
  if (score >= 0.35) return 'MEDIUM'
  return 'INFO'
}

function normalizeRiskLabel(level) {
  const labels = {
    low: 'Low',
    watch: 'Watch',
    warning: 'Warning',
    evacuate: 'Evacuate',
  }

  return labels[String(level || '').toLowerCase()] || 'Unavailable'
}

function buildTelemetry(sensor) {
  return [
    { label: 'Rainfall', value: `${sensor.rainfall} mm`, icon: CloudRain },
    { label: 'Water level', value: `${sensor.waterLevel} m`, icon: Droplets },
    { label: 'Flow rate', value: `${sensor.flowRate} m³/s`, icon: Gauge },
    { label: 'Soil moisture', value: `${sensor.soilMoisture}%`, icon: Sprout },
    { label: 'Temperature', value: `${sensor.temperature}°C`, icon: Thermometer },
    { label: 'Humidity', value: `${sensor.humidity}%`, icon: Wind },
  ]
}

function buildAlerts(sensors, predictions) {
  const alerts = []

  sensors.forEach((sensor) => {
    const telemetry = buildTelemetry(sensor)
    const telemetryRisk = calculateRisk(sensor)

    if (sensor.status === 'Critical') {
      alerts.push({
        id: `${sensor.id}-sensor-critical`,
        severity: 'CRITICAL',
        title: 'Critical sensor condition',
        region: sensor.location,
        eventType: 'Sensor Risk',
        detectedAt: sensor.lastUpdate,
        source: 'Sensor Telemetry',
        riskScore: telemetryRisk.score,
        riskScoreLabel: 'Telemetry risk score',
        status: 'Active',
        description: `Sensor ${sensor.id} is currently reporting a Critical telemetry status.`,
        telemetry,
        isDemo: true,
        sensorId: sensor.id,
      })
    }

    if (sensor.status === 'Warning') {
      alerts.push({
        id: `${sensor.id}-sensor-warning`,
        severity: 'HIGH',
        title: 'Warning sensor condition',
        region: sensor.location,
        eventType: 'Sensor Risk',
        detectedAt: sensor.lastUpdate,
        source: 'Sensor Telemetry',
        riskScore: telemetryRisk.score,
        riskScoreLabel: 'Telemetry risk score',
        status: 'Active',
        description: `The sensor network has marked ${sensor.id} as Warning based on its current demo telemetry state.`,
        telemetry,
        isDemo: true,
        sensorId: sensor.id,
      })
    }

    const prediction = predictions[sensor.id]

    if (!prediction) return

    const riskScore = Math.round(prediction.final_score * 100)
    const riskLabel = normalizeRiskLabel(prediction.risk_level)
    const severity = normalizeMlSeverity(prediction.final_score)
    const severityText = severityConfig[severity].label

    alerts.push({
      id: `${sensor.id}-ml-risk`,
      severity,
      title: `${severityText} ML risk assessment`,
      region: sensor.location,
      eventType: 'ML Risk Assessment',
      detectedAt: sensor.lastUpdate,
      source: 'ML Risk Model',
      riskScore,
      status: 'Active',
      description: `The ML risk model produced a ${severityText}-risk assessment from the available terrain and six-step telemetry inputs.`,
      telemetry,
      prediction: {
        rfScore: Math.round(prediction.rf_score * 100),
        lstmScore: Math.round(prediction.lstm_score * 100),
        fusionScore: riskScore,
        riskLabel,
      },
      isDemo: true,
      sensorId: sensor.id,
    })
  })

  return alerts
}

function SeverityBadge({ severity }) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${config.border} ${config.background} ${config.text}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${statusConfig[status]}`}
    >
      {status}
    </span>
  )
}

function SummaryCard({ label, value, tone, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>

      <p className={`mt-3 text-2xl font-semibold ${tone}`}>
        {value}
      </p>
    </div>
  )
}

function AlertRow({ alert, selected, onSelect, status }) {
  const config = severityConfig[alert.severity]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border-b border-white/5 p-4 text-left transition last:border-b-0 hover:bg-white/[0.04] ${
        selected ? 'bg-cyan-400/[0.06]' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${config.dot}`} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {alert.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {alert.region} · {alert.eventType}
              </p>
            </div>

            <SeverityBadge severity={alert.severity} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-wider text-slate-500">
            <span>{alert.source}</span>
            {alert.riskScore !== undefined && (
              <span className="text-slate-300">
                Risk {alert.riskScore}%
              </span>
            )}
            <StatusBadge status={status} />
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {alert.detectedAt}
            </span>
          </div>
        </div>

        <ChevronRight
          className={`mt-1 h-4 w-4 shrink-0 ${selected ? 'text-cyan-400' : 'text-slate-600'}`}
        />
      </div>
    </button>
  )
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  )
}

function AlertDetails({ alert, status, onStatusChange, mlStatusMessage }) {
  if (!alert) {
    return (
      <div className="flex min-h-[360px] items-center justify-center p-8 text-center">
        <div>
          <Bell className="mx-auto h-7 w-7 text-slate-600" />
          <p className="mt-4 text-sm text-slate-300">
            Select an alert to inspect its details.
          </p>
        </div>
      </div>
    )
  }

  const actions = {
    Active: [
      ['Acknowledged', 'Acknowledge'],
      ['Investigating', 'Mark investigating'],
      ['Resolved', 'Resolve'],
    ],
    Acknowledged: [
      ['Investigating', 'Mark investigating'],
      ['Resolved', 'Resolve'],
    ],
    Investigating: [['Resolved', 'Resolve']],
    Resolved: [['Active', 'Reopen']],
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Alert detail
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-100">
            {alert.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {alert.region} · {alert.eventType}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SeverityBadge severity={alert.severity} />
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <DetailMetric label="Alert ID" value={alert.id} />
        <DetailMetric label="Source" value={alert.source} />
        <DetailMetric label="Observed" value={alert.detectedAt} />
        <DetailMetric label="Region" value={alert.region} />
        <DetailMetric
          label={alert.riskScoreLabel || 'Risk score'}
          value={alert.riskScore === undefined ? 'Unavailable' : `${alert.riskScore}%`}
        />
        <DetailMetric label="Record type" value="Demo alert" />
      </div>

      <div className="mt-6 border-t border-white/5 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Why this alert was raised
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {alert.description}
        </p>
      </div>

      {alert.telemetry && (
        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Demo telemetry
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {alert.telemetry.map((metric) => {
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
        </div>
      )}

      {alert.prediction && (
        <div className="mt-6 border-t border-white/5 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Synthetic model output
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <DetailMetric label="Random Forest" value={`${alert.prediction.rfScore}%`} />
            <DetailMetric label="LSTM" value={`${alert.prediction.lstmScore}%`} />
            <DetailMetric label="Fusion" value={`${alert.prediction.fusionScore}%`} />
          </div>
        </div>
      )}

      {mlStatusMessage && !alert.prediction && (
        <p className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs leading-5 text-amber-300">
          {mlStatusMessage} Sensor telemetry remains available.
        </p>
      )}

      <div className="mt-6 border-t border-white/5 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operator actions
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Demo operator workflow · local state only
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {actions[status].map(([nextStatus, label]) => (
              <button
                key={nextStatus}
                type="button"
                onClick={() => onStatusChange(nextStatus)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Alerts() {
  const sensors = useLiveSensors()
  const {
    predictions,
    loading,
    errors,
    getHistory,
  } = useSensorPredictions(sensors)
  const [selectedAlertId, setSelectedAlertId] = useState(null)
  const [statusById, setStatusById] = useState({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const alerts = useMemo(
    () => buildAlerts(sensors, predictions),
    [sensors, predictions],
  )

  const alertsWithStatus = useMemo(
    () => alerts.map((alert) => ({
      ...alert,
      currentStatus: statusById[alert.id] || alert.status,
    })),
    [alerts, statusById],
  )

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return alertsWithStatus.filter((alert) => {
      const matchesFilter =
        filter === 'ALL' ||
        (filter === 'ACTIVE' && alert.currentStatus !== 'Resolved') ||
        (filter === 'RESOLVED' && alert.currentStatus === 'Resolved') ||
        alert.severity === filter

      const searchableText = [
        alert.id,
        alert.title,
        alert.region,
        alert.eventType,
        alert.source,
      ]
        .join(' ')
        .toLowerCase()

      return matchesFilter && searchableText.includes(query)
    })
  }, [alertsWithStatus, filter, search])

  const effectiveSelectedAlertId = filteredAlerts.some(
    (alert) => alert.id === selectedAlertId,
  )
    ? selectedAlertId
    : filteredAlerts[0]?.id || null

  const selectedAlert = alertsWithStatus.find(
    (alert) => alert.id === effectiveSelectedAlertId,
  )

  const hasIncompleteHistory = sensors.some(
    (sensor) => getHistory(sensor.id).length < 6,
  )
  const hasLoadingPrediction = Object.values(loading).some(Boolean)
  const hasPredictionError = Object.keys(errors).length > 0
  const mlUnavailable =
    hasIncompleteHistory || hasLoadingPrediction || hasPredictionError
  const mlStatusMessage = hasPredictionError
    ? 'ML assessment is currently unavailable.'
    : hasIncompleteHistory
      ? 'ML assessment awaiting six telemetry readings.'
      : hasLoadingPrediction
        ? 'ML assessment in progress.'
        : null

  const activeAlerts = alertsWithStatus.filter(
    (alert) => alert.currentStatus !== 'Resolved',
  )
  const criticalAlerts = activeAlerts.filter(
    (alert) => alert.severity === 'CRITICAL',
  )
  const highAlerts = activeAlerts.filter(
    (alert) => alert.severity === 'HIGH',
  )
  const monitoringAlerts = activeAlerts.filter(
    (alert) => alert.severity === 'INFO',
  )

  function updateAlertStatus(alertId, nextStatus) {
    setStatusById((current) => ({
      ...current,
      [alertId]: nextStatus,
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Incident Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
            Alerts &amp; Events
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Monitor active risk signals and investigate conditions requiring attention.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-cyan-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Live demo monitoring
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p className="text-xs leading-5 text-amber-200/80">
          Demo incident data — not an official emergency warning.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active" value={activeAlerts.length} tone="text-cyan-400" icon={Bell} />
        <SummaryCard label="Critical" value={criticalAlerts.length} tone="text-red-400" icon={CircleAlert} />
        <SummaryCard label="High Priority" value={highAlerts.length} tone="text-orange-400" icon={AlertTriangle} />
        <SummaryCard label="Monitoring" value={monitoringAlerts.length} tone="text-slate-300" icon={Activity} />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search alerts, regions, or event types..."
              className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  filter === option.value
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                    : 'border-white/10 bg-white/[0.02] text-slate-500 hover:bg-white/[0.05] hover:text-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {mlUnavailable && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-300/80">
            {hasPredictionError ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Clock3 className="h-3.5 w-3.5" />
            )}
            {mlStatusMessage} Sensor telemetry remains usable.
          </div>
        )}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active incident stream
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {filteredAlerts.length} demo record{filteredAlerts.length === 1 ? '' : 's'} shown
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Simulated
            </span>
          </div>

          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                selected={alert.id === effectiveSelectedAlertId}
                status={alert.currentStatus}
                onSelect={() => setSelectedAlertId(alert.id)}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <Search className="mx-auto h-6 w-6 text-slate-600" />
              <p className="mt-3 text-sm text-slate-300">
                {alerts.length === 0
                  ? 'All monitored conditions are currently within the configured demo thresholds.'
                  : 'No alerts match your current search or filters.'}
              </p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <AlertDetails
            alert={selectedAlert}
            status={selectedAlert?.currentStatus}
            onStatusChange={(nextStatus) =>
              updateAlertStatus(selectedAlert.id, nextStatus)
            }
            mlStatusMessage={mlStatusMessage}
          />
        </section>
      </div>
    </div>
  )
}

export default Alerts