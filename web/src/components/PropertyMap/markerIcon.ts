import * as L from 'leaflet'

const PIN_WIDTH = 30
const PIN_HEIGHT = 42
const MARKER_COLOR = '#FFD400'
const MARKER_STROKE = '#D4A900'
const ICON_COLOR = '#1C1C1E'

// Lucide Building2 icon paths (positioned inside the circle part of the pin)
const BUILDING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" x="8" y="5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${ICON_COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`

export const createPropertyMarkerIcon = () => {
  return L.divIcon({
    className: '',
    html: `<svg width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 ${PIN_WIDTH} ${PIN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="pin-shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.716 23.284 0 15 0z"
        fill="${MARKER_COLOR}" stroke="${MARKER_STROKE}" stroke-width="1" filter="url(#pin-shadow)"/>
      ${BUILDING_SVG}
    </svg>`,
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT],
  })
}

export const getMarkerConfig = () => {
  return { size: PIN_HEIGHT, isSolid: true }
}
