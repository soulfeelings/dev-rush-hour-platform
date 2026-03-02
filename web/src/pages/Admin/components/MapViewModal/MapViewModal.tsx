import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Modal, ModalBody, ModalFooter, Button } from '../../../../ui'
import type { Area } from '../../../../api/generated/schemas/area'
import styles from './MapViewModal.module.scss'

type MapViewModalProps = {
  area: Area
  onClose: () => void
}

function MapView({ area }: { area: Area }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const defaultCenter: [number, number] = [25.2048, 55.2708]

    mapRef.current = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(mapRef.current)

    const map = mapRef.current

    // Try to draw the boundary polygon from GeoJSON (coordinates are [lng, lat])
    const rawCoords = area.data?.boundary?.coordinates?.[0]
    if (rawCoords && rawCoords.length >= 3) {
      // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
      const points: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng])

      L.polygon(points, {
        color: '#3182ce',
        fillColor: '#3182ce',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map)

      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    }

    // Invalidate after modal open animation (200ms) finishes
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
    }
  }, [area])

  return <div ref={mapContainerRef} className={styles.map} />
}

export function MapViewModal({ area, onClose }: MapViewModalProps) {
  return (
    <Modal open onClose={onClose} title={area.name || 'Location'}>
      <ModalBody>
        <MapView area={area} />
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
