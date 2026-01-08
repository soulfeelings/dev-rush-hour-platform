import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, Fragment } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createPropertyMarkerIcon } from '../../components/PropertyMap/markerIcon'
import { developerLogos } from '../../data/mockProperties'
import ProjectFeatures from '../../components/ProjectFeatures'
import Model3DViewer from '../../components/Model3DViewer'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { useGetProject, useListLots } from '../../api'
import type { Project, Lot, Developer, Area } from '../../api'
import { IconBed, IconBath, IconFloor, IconArea } from '../../components/icons'
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
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [mapContainerEl, setMapContainerEl] = useState<HTMLDivElement | null>(null)

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
  const displayLots = useMemo(() => {
    const seen = new Map<string, Lot>()
    lots.forEach(lot => {
      const specKey = `${lot.projectId || 'no-project'}-${lot.type || 'unknown'}-${
        lot.priceAmount || '0'
      }-${lot.priceCurrency || 'AED'}-${lot.areaSqm || '0'}-${lot.floor ?? 'null'}-${
        lot.bedrooms ?? 'null'
      }-${lot.bathrooms ?? 'null'}`

      if (!seen.has(specKey)) seen.set(specKey, lot)
    })
    return Array.from(seen.values())
  }, [lots])
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

  // Инициализация карты: важно НЕ оставлять [] зависимостей,
  // потому что контейнер карты рендерится только когда hasCoordinates === true.
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

    // Инвалидируем размер карты после создания (после layout)
    setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 0)
  }, [hasCoordinates, mapContainerEl])

  // Обновление карты и маркера когда данные проекта загрузились
  // Важно: зависим от mapContainerEl, иначе маркер может не добавиться,
  // если карта создаётся позже (когда ref-контейнер смонтировался).
  useEffect(() => {
    if (!mapRef.current || !project || !hasCoordinates) return

    const coordinates: [number, number] = [project.lat!, project.lng!]
    const isRecommended = Boolean(
      (project.data as { isRecommended?: boolean } | undefined)?.isRecommended
    )
    const saleStatus = project.sale || 'unknown'
    const developerData = project.developer?.data as { logoUrl?: string } | undefined
    const logoFromApi = developerData?.logoUrl
    const logoFallbackKey = project.developer?.name || project.developerId || ''
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
  }, [project, hasCoordinates, mapContainerEl])

  // Отслеживание видимости карты для корректного обновления размеров
  useEffect(() => {
    if (!mapContainerEl) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
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

  const projectDataFields = project.data as
    | {
        description?: string
        featuresAmenities?: string[]
        specs?: { priceFrom?: number; currency?: string }
      }
    | undefined

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
          <div className={styles.galleryContainer}>
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
          </div>

          {(projectDataFields?.description ||
            (projectDataFields?.featuresAmenities &&
              projectDataFields.featuresAmenities.length > 0)) && (
            <div className={styles.contentCard}>
              {projectDataFields?.description && (
                <div className={styles.description}>
                  <h3>Description</h3>
                  <p>
                    {typeof projectDataFields.description === 'string'
                      ? projectDataFields.description
                      : JSON.stringify(projectDataFields.description)}
                  </p>
                </div>
              )}
              {projectDataFields?.featuresAmenities &&
                projectDataFields.featuresAmenities.length > 0 && (
                  <ProjectFeatures
                    features={projectDataFields.featuresAmenities as string[]}
                    maxItems={6}
                  />
                )}
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
              <div ref={setMapContainerEl} className={styles.map} />
            </div>
          )}

          {displayLots.length > 0 && (
            <div className={styles.lotsSection}>
              <h3 className={styles.lotsTitle}>Available Units</h3>
              <div className={styles.lotsList}>
                {displayLots.map((lot, index) => {
                  const priceText =
                    lot.priceAmount !== undefined && typeof lot.priceAmount === 'number'
                      ? `${(lot.priceAmount / 1000000).toFixed(1)}M ${lot.priceCurrency || 'AED'}`
                      : '-'

                  return (
                    <div
                      key={lot.id || index}
                      className={styles.lotCard}
                      onClick={() => lot.id && navigate(`/lot/${lot.id}`)}
                      style={{ cursor: lot.id ? 'pointer' : 'default' }}
                    >
                      <div className={styles.lotCardImage}>
                        {/* Placeholder для изображения - пока его нет */}
                        <div className={styles.lotCardImagePlaceholder}>
                          <span>Image</span>
                        </div>
                      </div>
                      <div className={styles.lotCardContent}>
                        <div className={styles.lotCardPrice}>{priceText}</div>
                        <div className={styles.lotCardDetails}>
                          {(() => {
                            const details: Array<{
                              icon: React.ReactElement
                              value: string | number
                            }> = []
                            if (lot.bedrooms !== undefined && lot.bedrooms !== null) {
                              details.push({ icon: <IconBed />, value: lot.bedrooms })
                            }
                            if (lot.bathrooms !== undefined && lot.bathrooms !== null) {
                              details.push({ icon: <IconBath />, value: lot.bathrooms })
                            }
                            if (lot.areaSqm !== undefined && lot.areaSqm !== null) {
                              details.push({ icon: <IconArea />, value: `${lot.areaSqm} sqm` })
                            }
                            if (lot.floor !== undefined && lot.floor !== null) {
                              details.push({ icon: <IconFloor />, value: lot.floor })
                            }
                            return details.map((detail, idx) => (
                              <Fragment key={idx}>
                                <span className={styles.lotCardDetail}>
                                  {detail.icon}
                                  {detail.value}
                                </span>
                                {idx < details.length - 1 && (
                                  <span className={styles.lotCardSeparator}>/</span>
                                )}
                              </Fragment>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
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
                  const priceFrom = projectDataFields?.specs?.priceFrom
                  const currency = projectDataFields?.specs?.currency || 'AED'
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
