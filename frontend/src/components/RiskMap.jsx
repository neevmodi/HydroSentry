import { useEffect } from 'react'
import { MapContainer, TileLayer, WMSTileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const regions = {
  Chamoli: {
    center: [30.4, 79.3],
    zoom: 10,
  },

  Rudraprayag: {
    center: [30.3, 78.98],
    zoom: 10,
  },

  Uttarkashi: {
    center: [30.73, 78.45],
    zoom: 10,
  },

  Pithoragarh: {
    center: [29.58, 80.22],
    zoom: 10,
  },
}

function MapController({ selectedRegion }) {
  const map = useMap()

  useEffect(() => {
    const region = regions[selectedRegion]

    if (!region) return

    map.flyTo(region.center, region.zoom, {
      duration: 1.2,
    })
  }, [selectedRegion, map])

  return null
}

function RiskMap({ selectedRegion }) {
  const sentinelWmsUrl =
    'https://sh.dataspace.copernicus.eu/ogc/wms/22a6570e-dc59-468b-a0c9-70f5f1f53e2d'

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-white/10">
      <MapContainer
        center={[30.0668, 79.0193]}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapController selectedRegion={selectedRegion} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <WMSTileLayer
          url={sentinelWmsUrl}
          layers="IW_VV_DB"
          format="image/png"
          transparent={true}
          version="1.3.0"
          opacity={0.65}
        />

        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000]">
          <div className="rounded-xl border border-white/10 bg-slate-950/90 p-4 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">
              Map Legend
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-slate-500" />
                <span className="text-xs text-slate-400">
                  Sentinel-1 SAR
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-slate-300" />
                <span className="text-xs text-slate-400">
                  OpenStreetMap
                </span>
              </div>
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  )
}

export default RiskMap