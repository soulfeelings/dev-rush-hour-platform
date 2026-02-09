import * as L from 'leaflet'

const MARKER_COLOR = '#FFD400'
const MARKER_STROKE = '#D4A900'

// Custom cluster icon — teardrop pin with count
export const createClusterIcon = (cluster: { getChildCount(): number }) => {
  const count = cluster.getChildCount()
  const scale = count < 10 ? 1 : count < 100 ? 1.15 : 1.3
  const w = Math.round(30 * scale)
  const h = Math.round(42 * scale)
  const fontSize = Math.round(count < 10 ? 11 : count < 100 ? 10 : 9)

  return L.divIcon({
    html: `<svg width="${w}" height="${h}" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cluster-shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.716 23.284 0 15 0z"
        fill="${MARKER_COLOR}" stroke="${MARKER_STROKE}" stroke-width="1" filter="url(#cluster-shadow)"/>
      <circle cx="15" cy="15" r="11" fill="rgba(0,0,0,0.12)"/>
      <text x="15" y="15" text-anchor="middle" dominant-baseline="central"
        fill="#1C1C1E" font-size="${fontSize}px" font-weight="700" font-family="system-ui, -apple-system, sans-serif">${count}</text>
    </svg>`,
    className: '',
    iconSize: L.point(w, h),
    iconAnchor: L.point(w / 2, h),
  })
}
