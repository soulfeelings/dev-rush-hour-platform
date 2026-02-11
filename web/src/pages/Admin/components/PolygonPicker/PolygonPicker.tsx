import { useEffect, useRef, useCallback } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './PolygonPicker.module.scss'

type PolygonPickerProps = {
  points: [number, number][]
  onPointsChange: (points: [number, number][]) => void
  center?: [number, number]
}

export function PolygonPicker({
  points = [],
  onPointsChange,
  center = [25.2048, 55.2708],
}: PolygonPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const polygonLayerRef = useRef<L.Polygon | null>(null)
  const polylineLayerRef = useRef<L.Polyline | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const pointsRef = useRef<[number, number][]>(points)

  useEffect(() => {
    pointsRef.current = points
  }, [points])

  const redrawLayers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const currentPoints = pointsRef.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove()
      polygonLayerRef.current = null
    }
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove()
      polylineLayerRef.current = null
    }

    if (currentPoints.length === 0) return

    currentPoints.forEach((pt, idx) => {
      const pinIcon = L.divIcon({
        className: styles.pinIcon,
        html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
          <filter id="shadow${idx}" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
          </filter>
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z"
            fill="#e53e3e" stroke="#c53030" stroke-width="1" filter="url(#shadow${idx})"/>
          <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.9"/>
        </svg>`,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
      })

      const marker = L.marker(pt, { icon: pinIcon }).addTo(map)

      marker.bindTooltip(`Point ${idx + 1} (right-click to remove)`, {
        direction: 'top',
        offset: [0, -40],
      })
      ;(marker as L.Marker & { _pointIndex: number })._pointIndex = idx

      marker.on('mousedown', (e: L.LeafletMouseEvent) => {
        if (e.originalEvent.button === 2) return
        e.originalEvent.preventDefault()
        e.originalEvent.stopPropagation()
        map.dragging.disable()

        const onMouseMove = (moveEvt: L.LeafletMouseEvent) => {
          const newLatLng = moveEvt.latlng
          marker.setLatLng(newLatLng)
          const updated = [...pointsRef.current]
          updated[idx] = [newLatLng.lat, newLatLng.lng]
          pointsRef.current = updated

          if (polygonLayerRef.current) {
            polygonLayerRef.current.setLatLngs(updated)
          }
          if (polylineLayerRef.current) {
            polylineLayerRef.current.setLatLngs(updated)
          }
        }

        const onMouseUp = () => {
          map.off('mousemove', onMouseMove)
          map.off('mouseup', onMouseUp)
          map.dragging.enable()
          onPointsChange([...pointsRef.current])
        }

        map.on('mousemove', onMouseMove)
        map.on('mouseup', onMouseUp)
      })

      marker.on('contextmenu', (e: L.LeafletMouseEvent) => {
        e.originalEvent.preventDefault()
        const updated = pointsRef.current.filter((_, i) => i !== idx)
        onPointsChange(updated)
      })

      markersRef.current.push(marker)
    })

    if (currentPoints.length >= 3) {
      polygonLayerRef.current = L.polygon(currentPoints, {
        color: '#3182ce',
        fillColor: '#3182ce',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map)
    } else if (currentPoints.length >= 2) {
      polylineLayerRef.current = L.polyline(currentPoints, {
        color: '#3182ce',
        weight: 2,
      }).addTo(map)
    }
  }, [onPointsChange])

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center,
        zoom: 11,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(mapRef.current)

      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]
        onPointsChange([...pointsRef.current, newPoint])
      })

      mapRef.current.on('contextmenu', (e: L.LeafletMouseEvent) => {
        e.originalEvent.preventDefault()
      })
    }

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      if (polygonLayerRef.current) {
        polygonLayerRef.current.remove()
        polygonLayerRef.current = null
      }
      if (polylineLayerRef.current) {
        polylineLayerRef.current.remove()
        polylineLayerRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    redrawLayers()
  }, [points, redrawLayers])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <label className={styles.label}>
          Boundary polygon ({points.length} point{points.length !== 1 ? 's' : ''})
        </label>
        {points.length > 0 && (
          <button type="button" className={styles.clearButton} onClick={() => onPointsChange([])}>
            Clear
          </button>
        )}
      </div>
      <div ref={mapContainerRef} className={styles.map} />
      <span className={styles.hint}>
        Click to add points. Right-click a point to remove. Drag points to adjust.
      </span>
    </div>
  )
}
