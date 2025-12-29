import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './PropertyMap.module.scss'
import type { Property } from '../../data/mockProperties'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface PropertyMapProps {
  properties: Property[]
  selectedPropertyId?: string
  onPropertyClick?: (propertyId: string) => void
}

const createIcon = (isRecommended: boolean) => {
  const size = isRecommended ? 24 : 20
  const color = isRecommended ? '#e5a732' : '#2563eb'
  return L.divIcon({
    className: '',
    html: `<div style="width: ${size}px; height: ${size}px; background: ${color}; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); cursor: pointer;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function PropertyMap({
  properties,
  selectedPropertyId: _selectedPropertyId,
  onPropertyClick,
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('property-map', {
        center: [25.2048, 55.2708],
        zoom: 11,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    properties.forEach(property => {
      const marker = L.marker(property.coordinates, {
        icon: createIcon(property.isRecommended || false),
      }).addTo(map)

      marker.on('click', () => {
        onPropertyClick?.(property.id)
      })

      markersRef.current.push(marker)
    })

    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map(p => p.coordinates))
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove())
    }
  }, [properties, onPropertyClick])

  return <div id="property-map" className={styles.map} />
}
