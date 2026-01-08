import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createPropertyMarkerIcon } from '../../components/PropertyMap/markerIcon'
import { developerLogos } from '../../data/mockProperties'
import ProjectFeatures from '../../components/ProjectFeatures'
import Model3DViewer from '../../components/Model3DViewer'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { useGetLot, useGetProject } from '../../api'
import type { Project, Developer, Area } from '../../api'
import { IconBed, IconBath, IconFloor, IconArea, getViewIcon } from '../../components/icons'
import styles from './LotDetail.module.scss'
import { saveCatalogViewMode } from '../../utils/catalogViewMode'

const MAP_ZOOM_DEFAULT = 13

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function LotDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [mapContainerEl, setMapContainerEl] = useState<HTMLDivElement | null>(null)

  const {
    data: lotData,
    isLoading: lotLoading,
    error: lotError,
  } = useGetLot(id || '', {
    query: {
      enabled: !!id,
    },
  })

  const lot = (lotData as any) || null
  
  // Отладка данных
  useEffect(() => {
    if (lot) {
      console.log('Lot data received:', lot)
      console.log('Lot.project:', lot.project)
      console.log('Lot.developer:', lot.developer)
      console.log('Lot.area:', lot.area)
    }
  }, [lot])

  useEffect(() => {
    saveCatalogViewMode('lots')
  }, [])

  // Используем вложенный project, если он есть, иначе пытаемся загрузить по ID
  const project = lot?.project || null
  const projectId = !project ? lot?.projectId : null

  const {
    data: projectData,
    isLoading: projectLoading,
  } = useGetProject(projectId || '', undefined, {
    query: {
      enabled: !!projectId, // Загружать только если нет вложенного проекта
    },
  })

  // Используем данные из projectData только если не было вложенного проекта
  const projectFromApi = projectId && projectData ? (projectData as Project & { developer?: Developer; area?: Area }) : null
  const finalProject = project || projectFromApi
  const loading = lotLoading || projectLoading
  const error =
    lotError instanceof Error
      ? lotError.message
      : (lotError as { error?: { message?: string } })?.error?.message || null

  // Используем координаты проекта для карты
  const hasCoordinates =
    finalProject?.lat !== undefined &&
    finalProject?.lng !== undefined &&
    finalProject.lat !== null &&
    finalProject.lng !== null

  // Инициализация карты: контейнер карты появляется только когда есть координаты,
  // поэтому нельзя использовать [] зависимости (иначе при первом заходе карта не создастся).
  useEffect(() => {
    if (!hasCoordinates || !mapContainerEl || mapRef.current) return

    const defaultCoordinates: [number, number] = [25.1972, 55.2744]
    mapRef.current = L.map(mapContainerEl, {
      center: defaultCoordinates,
      zoom: MAP_ZOOM_DEFAULT,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 0)
  }, [hasCoordinates, mapContainerEl])

  // Обновление карты и маркера когда данные проекта загрузились
  // Важно: зависим от mapContainerEl, иначе маркер может не добавиться,
  // если карта создаётся позже (когда ref-контейнер смонтировался).
  useEffect(() => {
    if (!mapRef.current || !finalProject || !hasCoordinates) return

    // Проверяем, что координаты определены
    if (finalProject.lat === undefined || finalProject.lng === undefined) return

    const coordinates: [number, number] = [finalProject.lat, finalProject.lng]
    const isRecommended = Boolean(
      (finalProject.data as { isRecommended?: boolean } | undefined)?.isRecommended
    )
    const saleStatus = finalProject.sale || 'unknown'

    // Логика получения логотипа: сначала из finalProject.developer, затем из lot.developer
    const developerForLogo = finalProject.developer || lot?.developer
    const developerData = developerForLogo?.data as { logoUrl?: string } | undefined
    const logoFromApi = developerData?.logoUrl
    const logoFallbackKey = developerForLogo?.name || developerForLogo?.id || ''
    const logoUrl = logoFromApi || developerLogos[logoFallbackKey]

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

    return () => {
      map.off('zoomend', handleZoomEnd)
    }
  }, [finalProject, hasCoordinates, lot, mapContainerEl])

  // Отслеживание видимости карты для корректного обновления размеров
  useEffect(() => {
    if (!mapContainerEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && mapRef.current) {
            // Карта стала видимой, обновляем размер
            setTimeout(() => {
              mapRef.current?.invalidateSize()
            }, 100)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(mapContainerEl)

    return () => {
      observer.disconnect()
    }
  }, [mapContainerEl])

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

  if (error || !lot) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Unit Not Found</h1>
          <p>{error || `Unit "${id}" does not exist.`}</p>
          <Link to="/catalog" className={styles.backLink}>
            Return to Catalog
          </Link>
        </div>
      </div>
    )
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

  const lotDataFields = lot.data as {
    view?: string
    furnishing?: string
    orientation?: string
    features?: string[]
  } | undefined

  const projectDataFields = finalProject?.data as {
    description?: string
    featuresAmenities?: string[]
    media?: {
      cover?: { url?: string }
      gallery?: Array<{ url?: string }>
    }
  } | undefined

  // Используем изображения проекта, если есть
  const allImages = [
    ...(projectDataFields?.media?.cover?.url ? [projectDataFields.media.cover.url] : []),
    ...(projectDataFields?.media?.gallery
      ?.map(img => img.url)
      .filter((url): url is string => Boolean(url)) || []),
  ]

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const priceText =
    lot.priceAmount !== undefined && typeof lot.priceAmount === 'number'
      ? `${(lot.priceAmount / 1000000).toFixed(1)}M ${lot.priceCurrency || 'AED'}`
      : '-'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backLink}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ← Back
        </button>
        {finalProject && (
          <Link to={`/project/${finalProject.slug}`} className={styles.projectLink}>
            {finalProject.name}
          </Link>
        )}
        <h1 className={styles.title}>Unit Details</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.galleryContainer}>
            <div className={styles.mainImageContainer}>
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`${finalProject?.name || 'Unit'} - image ${currentImageIndex + 1}`}
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
                  <span>Unit Image</span>
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
          </div>

          {(lotDataFields?.view ||
            lotDataFields?.furnishing ||
            lotDataFields?.orientation ||
            (lotDataFields?.features && lotDataFields.features.length > 0)) && (
            <div className={styles.contentCard}>
              {lotDataFields?.view && (
                <div className={styles.viewSection}>
                  <h3 className={styles.viewTitle}>View</h3>
                  <div className={styles.viewItem}>
                    {(() => {
                      const ViewIcon = getViewIcon(lotDataFields.view)
                      return (
                        <>
                          <div className={styles.viewIconWrapper}>
                            <ViewIcon size={24} className={styles.viewIcon} />
                          </div>
                          <span className={styles.viewText}>{lotDataFields.view}</span>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
              {lotDataFields?.furnishing && (
                <div className={styles.description}>
                  <h3>Furnishing</h3>
                  <p>{lotDataFields.furnishing}</p>
                </div>
              )}
              {lotDataFields?.orientation && (
                <div className={styles.description}>
                  <h3>Orientation</h3>
                  <p>{lotDataFields.orientation}</p>
                </div>
              )}
              {lotDataFields?.features && lotDataFields.features.length > 0 && (
                <ProjectFeatures features={lotDataFields.features} maxItems={10} />
              )}
            </div>
          )}

          {hasCoordinates && finalProject && (
            <div className={styles.mapCard}>
              <div className={styles.mapHeader}>
                <div>
                  <h3 className={styles.mapTitle}>Location on Map</h3>
                  <p className={styles.mapSubtitle}>Project coordinates</p>
                </div>
                <span className={styles.coordinates}>
                  {finalProject.lat !== undefined && finalProject.lng !== undefined
                    ? `${finalProject.lat.toFixed(4)}, ${finalProject.lng.toFixed(4)}`
                    : '-'}
                </span>
              </div>
              <div ref={setMapContainerEl} className={styles.map} />
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.viewApartmentsButton}>
            <Button onClick={() => setIs3DModalOpen(true)} variant="primary" size="lg">
              View 3D Model
            </Button>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardHeader}>
              <h2>Unit Information</h2>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Price:</span>
              <span className={styles.value}>{priceText}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status:</span>
              <span className={styles.value}>{getLotStatusText(lot.status)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>{lot.type || '-'}</span>
            </div>
            {lot.bedrooms !== undefined && lot.bedrooms !== null && (
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <IconBed size={20} />
                  Bedrooms:
                </span>
                <span className={styles.value}>{lot.bedrooms}</span>
              </div>
            )}
            {lot.bathrooms !== undefined && lot.bathrooms !== null && (
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <IconBath size={20} />
                  Bathrooms:
                </span>
                <span className={styles.value}>{lot.bathrooms}</span>
              </div>
            )}
            {lot.areaSqm !== undefined && lot.areaSqm !== null && (
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <IconArea size={20} />
                  Area:
                </span>
                <span className={styles.value}>{lot.areaSqm} sqm</span>
              </div>
            )}
            {lot.floor !== undefined && lot.floor !== null && (
              <div className={styles.infoRow}>
                <span className={styles.label}>
                  <IconFloor size={20} />
                  Floor:
                </span>
                <span className={styles.value}>{lot.floor}</span>
              </div>
            )}
            {finalProject && (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Project:</span>
                  <span className={styles.value}>
                    <Link to={`/project/${finalProject.slug}`} className={styles.projectLinkInline}>
                      {finalProject.name}
                    </Link>
                  </span>
                </div>
                {finalProject.area && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Location:</span>
                    <span className={styles.value}>{finalProject.area.name || 'Dubai'}</span>
                  </div>
                )}
                {finalProject.developer && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Developer:</span>
                    <span className={styles.value}>{finalProject.developer.name || 'Not specified'}</span>
                  </div>
                )}
              </>
            )}
            {lot.bonusKeys && lot.bonusKeys.length > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Bonuses:</span>
                <span className={styles.value}>{lot.bonusKeys.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

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

