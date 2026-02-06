import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react'
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
import { createMarkerPopupElement } from './MarkerPopup'
import type { Property } from '../../types/property'
import { districts } from '../../data/dubai_districts_data'
import { createPropertyMarkerIcon } from './markerIcon'
import { createDistrictPopupHTML } from './districtPopup'
import { getProjectDetailRoute, getAreaDetailRoute } from '../../constants/routes'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom cluster icon matching our marker design
const createClusterIcon = (cluster: { getChildCount(): number }) => {
  const count = cluster.getChildCount()
  const size = count < 10 ? 28 : count < 100 ? 32 : 36

  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: #1C1C1E;
      border: 1.5px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.2);
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

interface PropertyMapProps {
  properties: Property[]
  selectedPropertyId?: string
  onPropertyClick?: (propertyId: string) => void
  showDistrictFilter?: boolean
}

export interface PropertyMapRef {
  invalidateSize: () => void
  refreshMap: () => void
}

const PropertyMap = forwardRef<PropertyMapRef, PropertyMapProps>(
  ({ properties, selectedPropertyId, onPropertyClick, showDistrictFilter = true }, ref) => {
    const navigate = useNavigate()
    const mapRef = useRef<L.Map | null>(null)
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
    const districtLayersRef = useRef<L.Polygon[]>([])
    const [showDistricts, setShowDistricts] = useState(false)
    const popupCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isPopupHoveredRef = useRef(false)

    const clearPopupTimeout = useCallback(() => {
      if (popupCloseTimeoutRef.current) {
        clearTimeout(popupCloseTimeoutRef.current)
        popupCloseTimeoutRef.current = null
      }
    }, [])

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

      // Filter out properties without coordinates
      const propertiesWithCoords = properties.filter(p => p.coordinates)

      propertiesWithCoords.forEach(property => {
        const marker = L.marker(property.coordinates!, {
          icon: createPropertyMarkerIcon(),
        })

        const popupElement = createMarkerPopupElement(property, {
          onMouseEnter: () => {
            clearPopupTimeout()
            isPopupHoveredRef.current = true
          },
          onMouseLeave: () => {
            isPopupHoveredRef.current = false
            marker.closePopup()
          },
        })

        marker.on('click', () => {
          onPropertyClick?.(property.id)
          navigate(getProjectDetailRoute(property.id))
        })

        marker.on('mouseover', () => {
          clearPopupTimeout()

          const markerPoint = map.latLngToContainerPoint(property.coordinates!)
          const mapSize = map.getSize()
          const popupWidth = 290
          const popupHeight = 400
          const markerSize = 12
          const gap = 12

          const spaceAbove = markerPoint.y
          const spaceBelow = mapSize.y - markerPoint.y
          const spaceLeft = markerPoint.x
          const spaceRight = mapSize.x - markerPoint.x

          let offsetX = 0
          let offsetY = 0
          let popupDirection = 'top'

          if (spaceAbove > popupHeight + markerSize / 2 + gap) {
            offsetX = 0
            offsetY = -(markerSize / 2 + gap)
            popupDirection = 'top'
          } else if (spaceBelow > popupHeight + markerSize / 2 + gap) {
            offsetX = 0
            offsetY = markerSize / 2 + gap + popupHeight
            popupDirection = 'bottom'
          } else if (spaceRight > popupWidth / 2 + markerSize / 2 + gap) {
            offsetX = markerSize / 2 + gap + popupWidth / 2
            offsetY = popupHeight / 2
            popupDirection = 'right'
          } else if (spaceLeft > popupWidth / 2 + markerSize / 2 + gap) {
            offsetX = -(markerSize / 2 + gap + popupWidth / 2)
            offsetY = popupHeight / 2
            popupDirection = 'left'
          } else {
            offsetX = 0
            offsetY = -(markerSize / 2 + gap)
            popupDirection = 'top'
          }

          const popup = L.popup({
            offset: [offsetX, offsetY],
            className: `marker-popup marker-popup--${popupDirection}`,
            closeButton: false,
            autoPan: false,
            maxWidth: 320,
            minWidth: 280,
          }).setContent(popupElement)

          marker.bindPopup(popup).openPopup()
        })

        marker.on('mouseout', () => {
          popupCloseTimeoutRef.current = setTimeout(() => {
            if (!isPopupHoveredRef.current) {
              marker.closePopup()
            }
          }, 150)
        })

        clusterGroupRef.current?.addLayer(marker)
      })
    }, [properties, onPropertyClick, navigate, clearPopupTimeout])

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
          if (showDistricts) {
            districtLayersRef.current.forEach(layer => layer.remove())
            districtLayersRef.current = []
            districts.forEach(district => {
              const polygon = L.polygon(
                district.geometry.coordinates[0].map(coord => [coord[1], coord[0]]),
                {
                  color: '#9333ea',
                  weight: 2,
                  fillColor: '#9333ea',
                  fillOpacity: 0.2,
                }
              ).addTo(mapRef.current!)

              const popup = L.popup({
                className: 'marker-popup',
                closeButton: false,
                autoPan: true,
              }).setContent(createDistrictPopupHTML(district, properties))

              polygon.on('mouseover', e => {
                polygon.setStyle({ weight: 4 })
                polygon.bindPopup(popup).openPopup(e.latlng)
              })

              polygon.on('mousemove', e => {
                popup.setLatLng(e.latlng)
              })

              polygon.on('mouseout', () => {
                polygon.setStyle({ weight: 2 })
                polygon.closePopup()
              })

              polygon.on('click', () => {
                navigate(getAreaDetailRoute(district.id))
              })

              districtLayersRef.current.push(polygon)
            })
          }
        }
      },
    }))

    const toggleDistricts = useCallback(() => {
      if (!mapRef.current) return

      const map = mapRef.current

      if (showDistricts) {
        districtLayersRef.current.forEach(layer => layer.remove())
        districtLayersRef.current = []
        setShowDistricts(false)
      } else {
        districts.forEach(district => {
          const polygon = L.polygon(
            district.geometry.coordinates[0].map(coord => [coord[1], coord[0]]),
            {
              color: '#9333ea',
              weight: 2,
              fillColor: '#9333ea',
              fillOpacity: 0.2,
            }
          ).addTo(map)

          const popup = L.popup({
            className: 'marker-popup',
            closeButton: false,
            autoPan: true,
          }).setContent(createDistrictPopupHTML(district, properties))

          polygon.on('mouseover', e => {
            polygon.setStyle({ weight: 4 })
            polygon.bindPopup(popup).openPopup(e.latlng)
          })

          polygon.on('mousemove', e => {
            popup.setLatLng(e.latlng)
          })

          polygon.on('mouseout', () => {
            polygon.setStyle({ weight: 2 })
            polygon.closePopup()
          })

          polygon.on('click', () => {
            navigate(getAreaDetailRoute(district.id))
          })

          districtLayersRef.current.push(polygon)
        })
        setShowDistricts(true)
      }
    }, [showDistricts, properties, navigate])

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
        districtLayersRef.current.forEach(layer => layer.remove())
        clearPopupTimeout()
      }
    }, [properties, selectedPropertyId, onPropertyClick, updateMarkers, clearPopupTimeout])

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
        {showDistrictFilter && (
          <button
            className={styles.districtFilterButton}
            onClick={toggleDistricts}
            title={showDistricts ? 'Скрыть районы' : 'Показать районы'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

PropertyMap.displayName = 'PropertyMap'

export default PropertyMap
