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
import type { Project } from '../../api/generated/schemas/project'
import { getProjectSlug, getCoordinates } from '../../utils/project'
import { createPropertyMarkerIcon } from './markerIcon'
import { createClusterIcon } from './clusterIcon'
import { useSettings } from '../../features/Settings/Settings'
import { getProjectDetailRoute } from '../../constants/routes'

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface PropertyMapProps {
  projects: Project[]
  selectedProjectId?: string
  showDistrictFilter?: boolean
}

export interface PropertyMapRef {
  invalidateSize: () => void
  refreshMap: () => void
}

const PropertyMap = forwardRef<PropertyMapRef, PropertyMapProps>(
  ({ projects, selectedProjectId }, ref) => {
    const navigate = useNavigate()
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<L.Map | null>(null)
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
    const spiderfiedMarkersRef = useRef<Set<L.Marker>>(new Set())
    // Cache markers by property id to avoid recreating them on every render
    const markerCacheRef = useRef<Map<string, L.Marker>>(new Map())

    const createMarker = useCallback(
      (property: Property): L.Marker => {
        const map = mapRef.current!
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

        const price = property.priceFrom
          ? `${i18n.t('map.from')} ${(property.priceFrom / 1000000).toFixed(1)}M ${property.currency || ''}`
          : ''
        const tooltipHtml = `<div class="mp-tooltip">
          <span class="mp-tooltip-name">${project.name}</span>
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
            clusterGroupRef.current?.unspiderfy()
            map.flyTo(coordinates, Math.max(map.getZoom() + 2, 16), {
              animate: true,
              duration: 0.5,
            })
            return
          }

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

        return marker
      },
      [navigate]
    )

    const updateMarkers = useCallback(() => {
      if (!mapRef.current) return

      const map = mapRef.current

      // Ensure cluster group exists
      if (!clusterGroupRef.current) {
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

      const propertiesWithCoords = properties.filter(p => p.coordinates)
      const newIds = new Set(propertiesWithCoords.map(p => p.id))
      const cache = markerCacheRef.current

      // Remove markers that are no longer in the list
      for (const [id, marker] of cache) {
        if (!newIds.has(id)) {
          clusterGroupRef.current.removeLayer(marker)
          cache.delete(id)
        }
      }

      // Add markers that are new
      for (const property of propertiesWithCoords) {
        if (!cache.has(property.id)) {
          const marker = createMarker(property)
          cache.set(property.id, marker)
          clusterGroupRef.current.addLayer(marker)
        }
      }
    }, [properties, createMarker])

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

    // Initialize map once
    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return

      mapRef.current = L.map(mapContainerRef.current, {
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

      return () => {
        mapRef.current?.remove()
        mapRef.current = null
        clusterGroupRef.current = null
        markerCacheRef.current.clear()
      }
    }, [])

    // Update markers when properties change
    useEffect(() => {
      if (!mapRef.current) return

      updateMarkers()

      const projectsWithCoords = projects
        .map(p => getCoordinates(p))
        .filter((c): c is [number, number] => c !== undefined)
      if (projectsWithCoords.length > 0 && mapRef.current) {
        const bounds = L.latLngBounds(projectsWithCoords)
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }

      return () => {
        if (clusterGroupRef.current) {
          clusterGroupRef.current.clearLayers()
        }
      }
    }, [projects, selectedProjectId, updateMarkers])

    useEffect(() => {
      if (!mapRef.current || !selectedProjectId) return

      const selectedProject = projects.find(
        p => getProjectSlug(p) === selectedProjectId
      )
      const coords = selectedProject ? getCoordinates(selectedProject) : undefined
      if (coords) {
        mapRef.current.setView(coords, 14, {
          animate: true,
          duration: 0.5,
        })
      }
    }, [selectedProjectId, projects])

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div ref={mapContainerRef} className={styles.map} />
      </div>
    )
  }
)

PropertyMap.displayName = 'PropertyMap'

export default PropertyMap
