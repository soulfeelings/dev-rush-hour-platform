import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'

// Extend L namespace with markercluster types
declare module 'leaflet' {
  interface MarkerCluster extends L.Marker {
    getChildCount(): number
    getAllChildMarkers(): L.Marker[]
  }
  interface MarkerClusterGroupOptions extends L.LayerOptions {
    maxClusterRadius?: number | ((zoom: number) => number)
    iconCreateFunction?: (cluster: MarkerCluster) => L.Icon<L.IconOptions> | L.DivIcon
    spiderfyOnMaxZoom?: boolean
    showCoverageOnHover?: boolean
    zoomToBoundsOnClick?: boolean
    disableClusteringAtZoom?: number
  }
  interface MarkerClusterGroup extends L.FeatureGroup {
    clearLayers(): this
    addLayer(layer: L.Layer): this
  }
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}
import styles from './PropertyMap.module.scss'
import { createMarkerPopupElement, type MarkerPopupHandle } from './MarkerPopup'
import type { Property } from '../../types/property'
import { createPropertyMarkerIcon } from './markerIcon'
import { createClusterIcon } from './clusterIcon'
import { getProjectDetailRoute } from '../../constants/routes'

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
  showDistrictFilter?: boolean
}

export interface PropertyMapRef {
  invalidateSize: () => void
  refreshMap: () => void
}

const PropertyMap = forwardRef<PropertyMapRef, PropertyMapProps>(
  ({ properties, selectedPropertyId }, ref) => {
    const navigate = useNavigate()
    const mapRef = useRef<L.Map | null>(null)
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
    const popupHandlesRef = useRef<MarkerPopupHandle[]>([])

    const updateMarkers = useCallback(() => {
      if (!mapRef.current) return

      const map = mapRef.current

      // Clear existing cluster group
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers()
      } else {
        // Create cluster group with custom icon
        clusterGroupRef.current = L.markerClusterGroup({
          iconCreateFunction: createClusterIcon,
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          disableClusteringAtZoom: 15,
        })
        map.addLayer(clusterGroupRef.current)
      }

      // Cleanup previous popup handles
      popupHandlesRef.current.forEach(h => h.cleanup())
      popupHandlesRef.current = []

      // Filter out properties without coordinates
      const propertiesWithCoords = properties.filter(p => p.coordinates)

      propertiesWithCoords.forEach(property => {
        const marker = L.marker(property.coordinates!, {
          icon: createPropertyMarkerIcon(),
        })

        const popupHandle = createMarkerPopupElement(property)
        popupHandle.setDirection('top')
        popupHandlesRef.current.push(popupHandle)

        const markerSize = 12
        const gap = 12

        const popup = L.popup({
          offset: [0, -(markerSize / 2 + gap)],
          className: 'marker-popup marker-popup--top',
          closeButton: false,
          autoPan: false,
          maxWidth: 320,
          minWidth: 280,
        }).setContent(popupHandle.element)

        marker.bindPopup(popup)

        // Simple hover tooltip with image, name & price
        const price = property.priceFrom
          ? `from ${(property.priceFrom / 1000000).toFixed(1)}M ${property.currency || ''}`
          : ''
        const tooltipHtml = `<div class="mp-tooltip">
          <span class="mp-tooltip-name">${property.title}</span>
          ${price ? `<span class="mp-tooltip-price">${price}</span>` : ''}
        </div>`

        marker.bindTooltip(tooltipHtml, {
          direction: 'top',
          offset: L.point(0, -(markerSize / 2 + 4)),
          opacity: 1,
          className: 'marker-tooltip',
        })

        marker.on('click', () => {
          // Offset the center so the marker sits below middle, leaving room for the popup above
          const targetPoint = map.project(property.coordinates!, map.getZoom())
          const offset = map.getSize().y * 0.15
          const centerLatLng = map.unproject(
            L.point(targetPoint.x, targetPoint.y - offset),
            map.getZoom()
          )
          map.flyTo(centerLatLng, map.getZoom(), {
            animate: true,
            duration: 0.3,
          })
        })

        marker.on('popupopen', () => {
          // Navigate on popup card click, not on marker click
          const el = popupHandle.element
          const card = el.querySelector('.mp-card') as HTMLElement | null
          if (card) {
            card.onclick = () => navigate(getProjectDetailRoute(property.id))
          }
        })

        clusterGroupRef.current?.addLayer(marker)
      })
    }, [properties, navigate])

    useImperativeHandle(ref, () => ({
      invalidateSize: () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
        }
      },
      refreshMap: () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
          updateMarkers()
        }
      },
    }))

    useEffect(() => {
      if (!mapRef.current) {
        mapRef.current = L.map('property-map', {
          center: [25.2048, 55.2708],
          zoom: 11,
          zoomControl: true,
          attributionControl: true,
        })

        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Thanks for the amazing satellite imagery provided by Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
            maxZoom: 19,
          }
        ).addTo(mapRef.current)
      }

      updateMarkers()

      const propertiesWithCoords = properties.filter(p => p.coordinates)
      if (propertiesWithCoords.length > 0 && mapRef.current) {
        const bounds = L.latLngBounds(propertiesWithCoords.map(p => p.coordinates!))
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }

      return () => {
        if (clusterGroupRef.current) {
          clusterGroupRef.current.clearLayers()
        }
        popupHandlesRef.current.forEach(h => h.cleanup())
        popupHandlesRef.current = []
      }
    }, [properties, selectedPropertyId, updateMarkers])

    useEffect(() => {
      if (!mapRef.current || !selectedPropertyId) return

      const selectedProperty = properties.find(p => p.id === selectedPropertyId)
      if (selectedProperty?.coordinates) {
        mapRef.current.setView(selectedProperty.coordinates, 14, {
          animate: true,
          duration: 0.5,
        })
      }
    }, [selectedPropertyId, properties])

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div id="property-map" className={styles.map} />
      </div>
    )
  }
)

PropertyMap.displayName = 'PropertyMap'

export default PropertyMap
