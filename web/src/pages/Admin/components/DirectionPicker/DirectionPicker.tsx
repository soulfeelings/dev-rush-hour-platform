import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './DirectionPicker.module.scss'

const DIRECTIONS = [
  { key: 'North', label: 'N', angle: 0 },
  { key: 'North-East', label: 'NE', angle: 45 },
  { key: 'East', label: 'E', angle: 90 },
  { key: 'South-East', label: 'SE', angle: 135 },
  { key: 'South', label: 'S', angle: 180 },
  { key: 'South-West', label: 'SW', angle: 225 },
  { key: 'West', label: 'W', angle: 270 },
  { key: 'North-West', label: 'NW', angle: 315 },
] as const

type DirectionPickerProps = {
  value: string
  onChange: (direction: string) => void
  lat?: number
  lng?: number
}

// Helper function to create a sector cone shape
function createSectorCone(
  center: L.LatLng,
  angleInDegrees: number,
  radiusInMeters: number = 300,
  arcAngle: number = 60
): L.LatLng[] {
  const points: L.LatLng[] = [center]
  const steps = 20 // Number of points to draw smooth arc

  const startAngle = angleInDegrees - arcAngle / 2
  const endAngle = angleInDegrees + arcAngle / 2

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps)
    const angleRad = (angle * Math.PI) / 180

    // Calculate offset in meters and convert to lat/lng
    const latOffset = (radiusInMeters * Math.cos(angleRad)) / 111320
    const lngOffset = (radiusInMeters * Math.sin(angleRad)) / (111320 * Math.cos(center.lat * Math.PI / 180))

    points.push(L.latLng(center.lat + latOffset, center.lng + lngOffset))
  }

  points.push(center)
  return points
}

export function DirectionPicker({ value, onChange, lat, lng }: DirectionPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const sectorRef = useRef<L.Polygon | null>(null)

  const hasCoordinates = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)

  useEffect(() => {
    if (!mapContainerRef.current || !hasCoordinates) return

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: true,
      })

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(mapRef.current)

      // Add center marker
      L.circleMarker([lat, lng], {
        radius: 5,
        fillColor: '#fff',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(mapRef.current)
    } else {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lat, lng, hasCoordinates])

  // Update sector cone when orientation changes
  useEffect(() => {
    if (!mapRef.current || !hasCoordinates || !value) {
      // Remove sector if no value selected
      if (sectorRef.current && mapRef.current) {
        sectorRef.current.remove()
        sectorRef.current = null
      }
      return
    }

    const selectedDirection = DIRECTIONS.find(d => d.key === value)
    if (!selectedDirection) return

    const center = L.latLng(lat, lng)
    const sectorPoints = createSectorCone(center, selectedDirection.angle)

    // Remove old sector if exists
    if (sectorRef.current) {
      sectorRef.current.remove()
    }

    // Create new sector with translucent fill
    sectorRef.current = L.polygon(sectorPoints, {
      color: '#007bff',
      fillColor: '#007bff',
      fillOpacity: 0.3,
      weight: 2,
      opacity: 0.7,
    }).addTo(mapRef.current)
  }, [value, lat, lng, hasCoordinates])

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Orientation</label>
      {value ? (
        <div className={styles.container}>
          {hasCoordinates && <div ref={mapContainerRef} className={styles.map} />}
          {!hasCoordinates && <div className={styles.mapPlaceholder} />}
          <div className={styles.compass}>
            {DIRECTIONS.map(dir => {
              const isSelected = value === dir.key
              const rad = ((dir.angle - 90) * Math.PI) / 180
              const radius = 42
              const x = 50 + radius * Math.cos(rad)
              const y = 50 + radius * Math.sin(rad)

              return (
                <button
                  key={dir.key}
                  type="button"
                  className={`${styles.segment} ${isSelected ? styles.selected : ''}`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  onClick={() => onChange(isSelected ? '' : dir.key)}
                  title={dir.key}
                >
                  {dir.label}
                </button>
              )
            })}
            <div className={styles.center} />
          </div>
          <span className={styles.value}>{value}</span>
        </div>
      ) : (
        <div className={styles.selectPrompt}>
          <p>Select orientation to view on map</p>
          <div className={styles.directionButtons}>
            {DIRECTIONS.map(dir => (
              <button
                key={dir.key}
                type="button"
                className={styles.directionButton}
                onClick={() => onChange(dir.key)}
                title={dir.key}
              >
                {dir.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
