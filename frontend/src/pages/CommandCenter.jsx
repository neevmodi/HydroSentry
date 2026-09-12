import RiskMap from '../components/RiskMap'
import { useState } from 'react'

function CommandCenter() {
  const [selectedRegion, setSelectedRegion] = useState('Chamoli')

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Friday, 11 September 2026
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Regional Overview
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Real-time flood intelligence across monitored hilly regions.
        </p>
      </div>

      {/* Risk Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Regions Monitored */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Regions Monitored
            </p>

            <span className="text-xs text-slate-600">AREA</span>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <p className="text-3xl font-semibold tracking-tight text-white">
              12
            </p>

            <p className="mb-1 text-xs text-emerald-400">Active</p>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Hilly regions under surveillance
          </p>
        </div>

        {/* Satellite Coverage */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Satellite Coverage
            </p>

            <span className="text-xs text-slate-600">SAR</span>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <p className="text-3xl font-semibold tracking-tight text-white">
              94%
            </p>

            <p className="mb-1 text-xs text-emerald-400">Good</p>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Sentinel-1 monitoring coverage
          </p>
        </div>

        {/* High Risk Zones */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              High Risk Zones
            </p>

            <span className="text-xs text-slate-600">RISK</span>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <p className="text-3xl font-semibold tracking-tight text-white">
              03
            </p>

            <p className="mb-1 text-xs text-amber-400">Monitor</p>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Areas requiring attention
          </p>
        </div>

        {/* Data Status */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Data Status
            </p>

            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              LIVE
            </span>
          </div>

          <div className="mt-3">
            <p className="text-3xl font-semibold tracking-tight text-white">
              06:42
            </p>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Latest monitoring update
          </p>
        </div>
      </div>

      {/* Monitoring Region Selector */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Monitoring Region
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Select a region to focus monitoring
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[240px]">
          <label
            htmlFor="region-select"
            className="text-xs font-medium text-slate-500"
          >
            Active Region
          </label>

          <select
            id="region-select"
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/20"
          >
            <option value="Chamoli">Chamoli</option>
            <option value="Rudraprayag">Rudraprayag</option>
            <option value="Uttarkashi">Uttarkashi</option>
            <option value="Pithoragarh">Pithoragarh</option>
          </select>
        </div>
      </div>

      {/* Selected Region */}
      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-xs text-slate-500">
          Active monitoring area
        </p>

        <p className="text-xs font-medium text-white">
          {selectedRegion}
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Left Column */}
        <div className="min-h-[420px] rounded-2xl border border-white/10 bg-white/[0.025] p-6 xl:col-span-2">
          {/* Sentinel-1 Map */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Live Intelligence
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Regional Risk Map
              </h2>
            </div>

            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
              LIVE
            </span>
          </div>

          <div className="mt-6">
            {/* Sentinel-1 SAR Status */}
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Sentinel-1 SAR Monitoring
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Synthetic Aperture Radar imagery for regional observation
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-xs font-medium text-emerald-400">
                  DATA AVAILABLE
                </span>
              </div>
            </div>

            <RiskMap selectedRegion={selectedRegion} />

            {/* Sentinel-1 Metadata */}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Source
                </p>

                <p className="mt-1 text-xs font-medium text-slate-300">
                  Copernicus Sentinel-1
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Sensor
                </p>

                <p className="mt-1 text-xs font-medium text-slate-300">
                  SAR
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Mode
                </p>

                <p className="mt-1 text-xs font-medium text-slate-300">
                  IW / VV
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Region
                </p>

                <p className="mt-1 text-xs font-medium text-white">
                  {selectedRegion}
                </p>
              </div>
            </div>
          </div>

          {/* Regional Monitoring */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Regional Monitoring
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current monitoring status across selected regions
                </p>
              </div>

              <span className="text-xs uppercase tracking-wider text-slate-600">
                Sentinel-1
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Region
                    </th>

                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Risk Level
                    </th>

                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                      SAR Coverage
                    </th>

                    <th className="px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* Chamoli */}
                  <tr
                    onClick={() => setSelectedRegion('Chamoli')}
                    className={`cursor-pointer border-b border-white/5 transition ${
                      selectedRegion === 'Chamoli'
                        ? 'bg-white/[0.03]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">
                        Chamoli
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Northern Uttarakhand
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-400">
                        HIGH
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-emerald-400">
                      Available
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-xs text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Monitor
                      </span>
                    </td>
                  </tr>

                  {/* Rudraprayag */}
                  <tr
                    onClick={() => setSelectedRegion('Rudraprayag')}
                    className={`cursor-pointer border-b border-white/5 transition ${
                      selectedRegion === 'Rudraprayag'
                        ? 'bg-white/[0.03]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">
                        Rudraprayag
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Central Uttarakhand
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                        MODERATE
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-emerald-400">
                      Available
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-xs text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Stable
                      </span>
                    </td>
                  </tr>

                  {/* Uttarkashi */}
                  <tr
                    onClick={() => setSelectedRegion('Uttarkashi')}
                    className={`cursor-pointer border-b border-white/5 transition ${
                      selectedRegion === 'Uttarkashi'
                        ? 'bg-white/[0.03]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">
                        Uttarkashi
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Western Uttarakhand
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        LOW
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-emerald-400">
                      Available
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-xs text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Normal
                      </span>
                    </td>
                  </tr>

                  {/* Pithoragarh */}
                  <tr
                    onClick={() => setSelectedRegion('Pithoragarh')}
                    className={`cursor-pointer transition ${
                      selectedRegion === 'Pithoragarh'
                        ? 'bg-white/[0.03]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">
                        Pithoragarh
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Eastern Uttarakhand
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-400">
                        HIGH
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-emerald-400">
                      Available
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-xs text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Monitor
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts & Events */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Alerts & Events
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Recent monitoring events requiring attention
                </p>
              </div>

              <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-xs font-medium text-amber-400">
                2 ACTIVE
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {/* Alert 1 */}
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-red-400" />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Elevated risk detected
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Chamoli · Regional monitoring
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-400">
                    HIGH
                  </span>

                  <span className="text-xs text-slate-600">
                    12 min ago
                  </span>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-amber-400" />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Increased monitoring required
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Pithoragarh · Satellite observation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                    MEDIUM
                  </span>

                  <span className="text-xs text-slate-600">
                    28 min ago
                  </span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Sentinel-1 observation available
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Uttarkashi · New SAR observation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    INFO
                  </span>

                  <span className="text-xs text-slate-600">
                    41 min ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flood Risk Forecast */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Prediction
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Flood Risk Forecast
          </h2>

          <div className="mt-8">
            <p className="text-5xl font-semibold tracking-tight text-white">
              78<span className="text-2xl text-slate-500">%</span>
            </p>

            <p className="mt-2 text-sm text-amber-400">
              High risk
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <PredictionRow time="30 min" value="82%" />
            <PredictionRow time="60 min" value="89%" />
            <PredictionRow time="120 min" value="94%" />
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-600">
          HydroSentry monitoring console
        </p>

        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Monitoring interface operational
        </div>
      </div>
    </div>
  )
}

function PredictionRow({ time, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        {time}
      </span>

      <span className="text-sm font-semibold text-slate-200">
        {value}
      </span>
    </div>
  )
}

export default CommandCenter