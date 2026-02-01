import * as L from 'leaflet'

const MARKER_SIZE = 12

export const createPropertyMarkerIcon = () => {
  // Solid dot marker: dark fill with white outline and halo for satellite map visibility
  return L.divIcon({
    className: '',
    html: `<div style="width: ${MARKER_SIZE}px; height: ${MARKER_SIZE}px; background: #1C1C1E; border: 1.5px solid rgba(255, 255, 255, 0.85); border-radius: 50%; box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.2); cursor: pointer;"></div>`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
  })
}

export const getMarkerConfig = () => {
  return { size: MARKER_SIZE, isSolid: true }
}
