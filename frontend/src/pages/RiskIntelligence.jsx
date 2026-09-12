import {
  BrainCircuit,
  TrendingUp,
  CloudRain,
  Droplets,
  Sprout,
  Waves,
  ShieldCheck,
} from 'lucide-react'

function RiskIntelligence() {
  const forecast = [
    { time: 'Now', risk: 78 },
    { time: '30 min', risk: 82 },
    { time: '60 min', risk: 89 },
    { time: '120 min', risk: 94 },
  ]

  const factors = [
    {
      label: 'Rainfall intensity',
      value: '+24%',
      icon: CloudRain,
    },
    {
      label: 'Water level',
      value: '+21%',
      icon: Droplets,
    },
    {
      label: 'Soil saturation',
      value: '+16%',
      icon: Sprout,
    },
    {
      label: 'Flow rate',
      value: '+12%',
      icon: Waves,
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          AI Risk Engine
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
              Risk Intelligence
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              AI-driven flood probability and near-term risk forecasting.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <BrainCircuit className="h-4 w-4" />
            AI engine active
          </div>
        </div>
      </div>

      {/* Current Risk */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                Current Flood Risk
              </p>

              <p className="mt-4 text-6xl font-semibold tracking-tight text-slate-100">
                78<span className="text-3xl text-slate-500">%</span>
              </p>

              <p className="mt-2 text-sm font-medium text-orange-400">
                HIGH RISK
              </p>
            </div>

            <div className="rounded-xl bg-orange-400/10 p-3">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-[10px] uppercase tracking-wider">
              <span className="text-slate-500">Risk score</span>
              <span className="text-slate-400">78 / 100</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-orange-400 transition-all duration-700"
                style={{ width: '78%' }}
              />
            </div>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Model Confidence
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-100">
                91%
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            Prediction generated from real-time environmental telemetry and
            recent sensor trends.
          </p>

          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Model status
            </p>

            <p className="mt-2 text-xs font-medium text-emerald-400">
              ● Prediction engine operational
            </p>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
            Near-Term Forecast
          </p>

          <h2 className="mt-2 text-lg font-semibold text-slate-100">
            Flood risk trajectory
          </h2>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {forecast.map((item) => (
            <div
              key={item.time}
              className="rounded-xl border border-white/5 bg-black/20 p-4"
            >
              <p className="text-xs text-slate-500">
                {item.time}
              </p>

              <p className="mt-3 text-2xl font-semibold text-slate-100">
                {item.risk}%
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-orange-400">
                {item.risk >= 90 ? 'Critical' : 'High'}
              </p>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-orange-400"
                  style={{ width: `${item.risk}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
            Explainable Risk Factors
          </p>

          <h2 className="mt-2 text-lg font-semibold text-slate-100">
            Why is the risk increasing?
          </h2>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {factors.map((factor) => {
            const Icon = factor.icon

            return (
              <div
                key={factor.label}
                className="rounded-xl border border-white/5 bg-black/20 p-4"
              >
                <Icon className="h-4 w-4 text-slate-500" />

                <p className="mt-4 text-xs text-slate-400">
                  {factor.label}
                </p>

                <p className="mt-1 text-lg font-semibold text-orange-400">
                  {factor.value}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RiskIntelligence