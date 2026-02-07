import * as L from 'leaflet'

// Custom cluster icon matching our marker design
export const createClusterIcon = (cluster: { getChildCount(): number }) => {
  const count = cluster.getChildCount()
  const size = count < 10 ? 28 : count < 100 ? 32 : 36

  return L.divIcon({
    html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background: #FFD400;
        border-radius: 50%;
        box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.2);
        border: 1.5px solid rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        font-family: system-ui, -apple-system, sans-serif;
        cursor: pointer;
      ">${count}</div>`,
    className: '',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  })
}
