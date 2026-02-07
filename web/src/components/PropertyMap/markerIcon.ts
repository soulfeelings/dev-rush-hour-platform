import * as L from 'leaflet'

const MARKER_SIZE = 24
const MARKER_COLOR = '#FFD400'
const MARKER_BORDER_COLOR = 'transparent'
const MARKER_BORDER_WIDTH = 1.5
const MARKER_BORDER_RADIUS = '50%'
const MARKER_BORDER_SHADOW = '0 0 6px 2px rgba(255, 255, 255, 0.2)'

const ICON_SIZE = 14
const ICON_COLOR = '#1C1C1E'

// Lucide Building2 icon paths
const BUILDING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="${ICON_COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`

export const createPropertyMarkerIcon = () => {
  return L.divIcon({
    className: '',
    html: `<div style="
    width: ${MARKER_SIZE}px; height: ${MARKER_SIZE}px;
    background: ${MARKER_COLOR};
    border: ${MARKER_BORDER_WIDTH}px solid ${MARKER_BORDER_COLOR};
    border-radius: ${MARKER_BORDER_RADIUS};
    box-shadow: ${MARKER_BORDER_SHADOW};
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    ">${BUILDING_SVG}</div>`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
  })
}

export const getMarkerConfig = () => {
  return { size: MARKER_SIZE, isSolid: true }
}
