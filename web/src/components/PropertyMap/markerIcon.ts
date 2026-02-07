import * as L from 'leaflet'

const MARKER_SIZE = 24
const MARKER_COLOR = '#FFD400'
const MARKER_BORDER_COLOR = 'transparent'
const MARKER_BORDER_WIDTH = 1.5
const MARKER_BORDER_RADIUS = '50%'
const MARKER_BORDER_SHADOW = '0 0 6px 2px rgba(255, 255, 255, 0.2)'

export const createPropertyMarkerIcon = () => {
  // Solid dot marker: dark fill with white outline and halo for satellite map visibility
  return L.divIcon({
    className: '',
    html: `<div style="
    width: ${MARKER_SIZE}px; height: ${MARKER_SIZE}px; 
    background: ${MARKER_COLOR}; 
    border: ${MARKER_BORDER_WIDTH}px solid ${MARKER_BORDER_COLOR}; 
    border-radius: ${MARKER_BORDER_RADIUS}; 
    box-shadow: ${MARKER_BORDER_SHADOW}; 
    cursor: pointer;
    ">`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
  })
}

export const getMarkerConfig = () => {
  return { size: MARKER_SIZE, isSolid: true }
}
