import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './PropertyMap.module.scss'
import { createMarkerPopupHTML } from './MarkerPopup'
import './MarkerPopup/MarkerPopup.module.scss'
import type { Property } from '../../data/mockProperties'
import { developerLogos } from '../../data/mockProperties'

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

/**
 * Конфигурация порогов зума и соответствующих размеров
 */
const ZOOM_THRESHOLDS = {
  SMALL: 13,
  MEDIUM: 15,
}

const getMarkerConfig = (isRecommended: boolean, zoom: number, isSelected: boolean) => {
  if (isSelected) {
    return {
      size: 52,
      isSolid: false,
    }
  }

  if (isRecommended) {
    return {
      size: 52,
      isSolid: false,
    }
  }

  if (zoom < ZOOM_THRESHOLDS.SMALL) {
    return { size: 20, isSolid: true }
  }

  if (zoom < ZOOM_THRESHOLDS.MEDIUM) {
    return { size: 30, isSolid: false }
  }

  return { size: 45, isSolid: false }
}

const getStatusColor = (status: Property['status'], isSelected: boolean) => {
  if (isSelected) {
    return '#dc2626'
  }

  switch (status) {
    case 'в продаже':
      return '#2563eb'
    case 'старт продаж':
      return '#e5a732'
    case 'анонс продаж':
      return '#ef4444'
    default:
      return '#2563eb'
  }
}

const createIcon = (
  isRecommended: boolean,
  status: Property['status'],
  logoUrl: string | undefined,
  zoom: number,
  isSelected: boolean = false
) => {
  const { size, isSolid } = getMarkerConfig(isRecommended, zoom, isSelected)
  const borderRadius = isRecommended ? '50%' : '2px'
  const color = getStatusColor(status, isSelected)

  const backgroundStyle = isSolid
    ? `background: ${color};`
    : logoUrl
      ? `background-image: url('${logoUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: #ffffff;`
      : 'background: #ffffff;'

  const borderWidth = 4

  return L.divIcon({
    className: '',
    html: `<div style="width: ${size}px; height: ${size}px; ${backgroundStyle} border: ${borderWidth}px solid ${color}; border-radius: ${borderRadius}; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); cursor: pointer; overflow: hidden;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function PropertyMap({
  properties,
  selectedPropertyId,
  onPropertyClick,
}: PropertyMapProps) {
  const navigate = useNavigate()
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current
    const currentZoom = map.getZoom()

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    properties.forEach(property => {
      const isRecommended = property.isRecommended || false
      const isSelected = property.id === selectedPropertyId
      const logoUrl = property.logoUrl || developerLogos[property.developer]
      const { size } = getMarkerConfig(isRecommended, currentZoom, isSelected)

      const marker = L.marker(property.coordinates, {
        icon: createIcon(isRecommended, property.status, logoUrl, currentZoom, isSelected),
      }).addTo(map)

      const popup = L.popup({
        offset: [0, -(size / 2 + 10)],
        className: 'marker-popup',
        closeButton: false,
        autoPan: true,
        autoPanPadding: [20, 20],
      }).setContent(createMarkerPopupHTML(property))

      marker.on('click', () => {
        onPropertyClick?.(property.id)
        navigate(`/project/${property.id}`)
      })

      marker.on('mouseover', () => {
        marker.bindPopup(popup).openPopup()
      })

      marker.on('mouseout', () => {
        marker.closePopup()
      })

      markersRef.current.push(marker)
    })
  }, [properties, selectedPropertyId, onPropertyClick, navigate])

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

      mapRef.current.on('zoomend', updateMarkers)
    }

    const map = mapRef.current

    updateMarkers()

    if (properties.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(properties.map(p => p.coordinates))
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('zoomend', updateMarkers)
      }
      markersRef.current.forEach(marker => marker.remove())
    }
  }, [properties, selectedPropertyId, onPropertyClick, updateMarkers])

  useEffect(() => {
    if (!mapRef.current || !selectedPropertyId) return

    const selectedProperty = properties.find(p => p.id === selectedPropertyId)
    if (selectedProperty) {
      mapRef.current.setView(selectedProperty.coordinates, 14, {
        animate: true,
        duration: 0.5,
      })
    }
  }, [selectedPropertyId, properties])

  return <div id="property-map" className={styles.map} />
}
