import { useParams, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createPropertyMarkerIcon } from '../../components/PropertyMap/markerIcon'
import { developerLogos } from '../../data/mockProperties'
import Model3DViewer from '../../components/Model3DViewer'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { useGetProject, useListLots } from '../../api'
import type { Project, Lot, Developer, Area } from '../../api'
import styles from './ProjectDetail.module.scss'

const MAP_ZOOM_DEFAULT = 13

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Расширенный тип Project с вложенными developer и area (возвращаются бэкендом, но не в типах)
type ProjectWithRelations = Project & {
  developer?: Developer
  area?: Area
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useGetProject(slug || '', undefined, {
    query: {
      enabled: !!slug,
    },
  })

  const { data: lotsData, isLoading: lotsLoading } = useListLots(
    { project: slug || '' },
    {
      query: {
        enabled: !!slug,
      },
    }
  )

  const project = (projectData as ProjectWithRelations | undefined) || null
  const lots: Lot[] = lotsData?.items || []
  const loading = projectLoading || lotsLoading
  const error =
    projectError instanceof Error
      ? projectError.message
      : (projectError as { error?: { message?: string } })?.error?.message || null
  const hasCoordinates =
    project?.lat !== undefined &&
    project?.lng !== undefined &&
    project.lat !== null &&
    project.lng !== null

  useEffect(() => {
    if (
      !project ||
      !hasCoordinates ||
      !mapContainerRef.current ||
      project.lat === undefined ||
      project.lng === undefined
    )
      return

    const coordinates: [number, number] = [project.lat, project.lng]
    const isRecommended = Boolean(
      (project.data as { isRecommended?: boolean } | undefined)?.isRecommended
    )
    const saleStatus = project.sale || 'unknown'
    const developerData = project.developer?.data as { logoUrl?: string } | undefined
    const logoFromApi = developerData?.logoUrl
    const logoFallbackKey = project.developer?.name || project.developerId || ''
    const logoUrl = logoFromApi || developerLogos[logoFallbackKey]

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: coordinates,
        zoom: MAP_ZOOM_DEFAULT,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    const map = mapRef.current
    map.setView(coordinates, Math.max(map.getZoom(), MAP_ZOOM_DEFAULT))

    const applyMarkerIcon = () => {
      const icon = createPropertyMarkerIcon(isRecommended, saleStatus, logoUrl, map.getZoom())

      if (!markerRef.current) {
        markerRef.current = L.marker(coordinates, { icon }).addTo(map)
      } else {
        markerRef.current.setLatLng(coordinates)
        markerRef.current.setIcon(icon)
      }
    }

    applyMarkerIcon()

    const handleZoomEnd = () => {
      if (!markerRef.current) return
      markerRef.current.setIcon(
        createPropertyMarkerIcon(isRecommended, saleStatus, logoUrl, map.getZoom())
      )
    }

    map.on('zoomend', handleZoomEnd)

    const resizeTimeout = setTimeout(() => {
      map.invalidateSize()
    }, 0)

    return () => {
      clearTimeout(resizeTimeout)
      map.off('zoomend', handleZoomEnd)
    }
  }, [hasCoordinates, project])

  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Property Not Found</h1>
          <p>{error || `Property "${slug}" does not exist.`}</p>
          <Link to="/catalog" className={styles.backLink}>
            Return to Catalog
          </Link>
        </div>
      </div>
    )
  }

  const getSaleText = (sale: string | undefined) => {
    if (!sale) return 'Unknown'
    switch (sale) {
      case 'sale':
        return 'On Sale'
      case 'start of sales':
        return 'Start of Sales'
      case 'sales announcement':
        return 'Sales Announcement'
      default:
        return sale
    }
  }

  const getLotStatusText = (status: string | undefined) => {
    if (!status) return 'Unknown'
    switch (status) {
      case 'active':
        return 'Available'
      case 'hidden':
        return 'Hidden'
      case 'reserved':
        return 'Reserved'
      case 'sold':
        return 'Sold'
      default:
        return status
    }
  }

  const allImages = [
    ...(project.data?.media?.cover?.url ? [project.data.media.cover.url] : []),
    ...(project.data?.media?.gallery
      ?.map(img => img.url)
      .filter((url): url is string => Boolean(url)) || []),
  ]

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/catalog" className={styles.backLink}>
          ← Back to Catalog
        </Link>
        <h1 className={styles.title}>{project.name}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            {allImages.length > 0 ? (
              <>
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${project.name} - image ${currentImageIndex + 1}`}
                  className={styles.projectImage}
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      className={`${styles.navButton} ${styles.prevButton}`}
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      className={`${styles.navButton} ${styles.nextButton}`}
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                    <div className={styles.imageCounter}>
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>Project Image</span>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className={styles.thumbnailCarousel}>
              {allImages.map((url, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumbnailWrapper} ${
                    idx === currentImageIndex ? styles.activeThumbnail : ''
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className={styles.thumbnailImage} />
                </div>
              ))}
            </div>
          )}

          {hasCoordinates && (
            <div className={styles.mapCard}>
              <div className={styles.mapHeader}>
                <div>
                  <h3 className={styles.mapTitle}>Location on Map</h3>
                  <p className={styles.mapSubtitle}>Coordinates from database</p>
                </div>
                <span className={styles.coordinates}>
                  {project.lat !== undefined && project.lng !== undefined
                    ? `${project.lat.toFixed(4)}, ${project.lng.toFixed(4)}`
                    : '-'}
                </span>
              </div>
              <div ref={mapContainerRef} className={styles.map} />
            </div>
          )}
        </div>
        <div className={styles.infoSection}>
          <div className={styles.viewApartmentsButton}>
            <Button onClick={() => setIs3DModalOpen(true)} variant="primary" size="lg">
              View Apartments
            </Button>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardHeader}>
              <h2>Property Information</h2>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{project.area?.name || 'Dubai'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Developer:</span>
              <span className={styles.value}>{project.developer?.name || 'Not specified'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Price from:</span>
              <span className={styles.value}>
                {(() => {
                  const specs = project.data?.specs as
                    | { priceFrom?: number; currency?: string }
                    | undefined
                  const priceFrom = specs?.priceFrom
                  const currency = specs?.currency || 'AED'
                  if (priceFrom !== undefined && typeof priceFrom === 'number') {
                    return `${(priceFrom / 1000000).toFixed(1)}M ${currency}`
                  }
                  return '-'
                })()}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Sale Status:</span>
              <span className={styles.value}>{getSaleText(project.sale)}</span>
            </div>
            {project.data?.description && (
              <div className={styles.description}>
                <h3>Description</h3>
                <p>
                  {typeof project.data.description === 'string'
                    ? project.data.description
                    : JSON.stringify(project.data.description)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lots.length > 0 && (
        <div className={styles.unitsSection}>
          <h2>Available Units</h2>
          <div className={styles.unitsTable}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Bedrooms</th>
                  <th>Area</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot, index) => (
                  <tr key={lot.id || index}>
                    <td>{lot.type || '-'}</td>
                    <td>{lot.bedrooms ?? '-'}</td>
                    <td>{lot.areaSqm !== undefined ? `${lot.areaSqm} sqm` : '-'}</td>
                    <td>
                      {lot.priceAmount !== undefined && typeof lot.priceAmount === 'number'
                        ? `${(lot.priceAmount / 1000000).toFixed(1)}M ${lot.priceCurrency || 'AED'}`
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`${styles.unitStatus} ${lot.status ? styles[`unitStatus${lot.status}`] : ''}`}
                      >
                        {getLotStatusText(lot.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        title="3D Apartment Model"
        className="wide transparent minimal"
      >
        <Model3DViewer embedded />
      </Modal>
    </div>
  )
}
