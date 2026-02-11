import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import i18n from '../../i18n'
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
    unspiderfy(): void
  }
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup
}
import styles from './PropertyMap.module.scss'
import { createMarkerPopupElement } from './MarkerPopup'
import type { Property } from '../../types/property'
import { createPropertyMarkerIcon } from './markerIcon'
import { createClusterIcon } from './clusterIcon'

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
    const spiderfiedMarkersRef = useRef<Set<L.Marker>>(new Set())

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

        clusterGroupRef.current.on('spiderfied', (e: unknown) => {
          const evt = e as { cluster: L.MarkerCluster }
          spiderfiedMarkersRef.current = new Set(evt.cluster.getAllChildMarkers())
        })
        clusterGroupRef.current.on('unspiderfied', () => {
          spiderfiedMarkersRef.current.clear()
        })

        map.addLayer(clusterGroupRef.current)
      }

      // Filter out properties without coordinates
      const propertiesWithCoords = properties.filter(p => p.coordinates)

      propertiesWithCoords.forEach(property => {
        const marker = L.marker(property.coordinates!, {
          icon: createPropertyMarkerIcon(),
        })

        const popupElement = createMarkerPopupElement(property)

        const popup = L.popup({
          offset: [0, -42],
          className: 'marker-popup marker-popup--top',
          closeButton: false,
          autoPan: false,
          maxWidth: 320,
          minWidth: 280,
        }).setContent(popupElement)

        // Simple hover tooltip with image, name & price
        const price = property.priceFrom
          ? `${i18n.t('map.from')} ${(property.priceFrom / 1000000).toFixed(1)}M ${property.currency || ''}`
          : ''
        const tooltipHtml = `<div class="mp-tooltip">
          <span class="mp-tooltip-name">${property.title}</span>
          ${price ? `<span class="mp-tooltip-price">${price}</span>` : ''}
        </div>`

        const bindTooltipToMarker = () => {
          marker.bindTooltip(tooltipHtml, {
            direction: 'top',
            offset: L.point(0, -42),
            opacity: 1,
            className: 'marker-tooltip',
          })
        }

        bindTooltipToMarker()

        marker.on('click', () => {
          const isSpiderfied = spiderfiedMarkersRef.current.has(marker)

          if (isSpiderfied) {
            // In spiderfy mode: zoom to this marker, collapse the spider
            clusterGroupRef.current?.unspiderfy()
            map.flyTo(property.coordinates!, Math.max(map.getZoom() + 2, 16), {
              animate: true,
              duration: 0.5,
            })
            return
          }

          // Standalone marker: offset center and open popup
          const targetPoint = map.project(property.coordinates!, map.getZoom())
          const pinHeightOffset = 21
          const mapOffset = map.getSize().y * 0.15
          const centerLatLng = map.unproject(
            L.point(targetPoint.x, targetPoint.y - mapOffset - pinHeightOffset),
            map.getZoom()
          )
          map.flyTo(centerLatLng, map.getZoom(), {
            animate: true,
            duration: 0.3,
          })

          marker.closeTooltip()
          marker.unbindTooltip()
          marker.bindPopup(popup).openPopup()
        })

        marker.on('popupopen', () => {
          const iconEl = marker.getElement()
          if (iconEl) iconEl.style.pointerEvents = 'none'
        })

        marker.on('popupclose', () => {
          marker.unbindPopup()
          const iconEl = marker.getElement()
          if (iconEl) iconEl.style.pointerEvents = ''
          bindTooltipToMarker()
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
