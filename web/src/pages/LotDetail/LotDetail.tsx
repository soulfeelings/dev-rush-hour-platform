import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createPropertyMarkerIcon } from '../../components/PropertyMap/markerIcon'
import Model3DViewer from '../../components/Model3DViewer'
import { Modal } from '../../ui/Modal'
import { useGetLot, useGetProject, useListLots } from '../../api'
import type { Project, Developer, Area } from '../../api'
import { ROUTES } from '../../constants/routes'
import { NotFound } from '../../ui/NotFound'
import { useSettings } from '../../features/Settings/Settings'
import { formatPrice, formatArea } from '../../utils/format'
import { LotDetailSkeleton } from './LotDetailSkeleton'
import { ApartmentCard } from '../ProjectDetail/ApartmentCard'
import { ApartmentsCarousel } from '../ProjectDetail/ApartmentsCarousel'
import { getImageUrl } from '../../utils/imageUrl'
import styles from './LotDetail.module.scss'
import { saveCatalogViewMode } from '../../utils/catalogViewMode'
import { useTranslation } from 'react-i18next'

const MAP_ZOOM_DEFAULT = 13
const VIEW_MAP_ZOOM = 16

const DIRECTIONS = [
  { key: 'North', angle: 0 },
  { key: 'North-East', angle: 45 },
  { key: 'East', angle: 90 },
  { key: 'South-East', angle: 135 },
  { key: 'South', angle: 180 },
  { key: 'South-West', angle: 225 },
  { key: 'West', angle: 270 },
  { key: 'North-West', angle: 315 },
] as const

const pluralizeType = (type?: string) => {
  const normalized = (type || 'apartment').trim().toLowerCase()
  const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1)

  if (
    normalized.endsWith('x') ||
    normalized.endsWith('s') ||
    normalized.endsWith('sh') ||
    normalized.endsWith('ch')
  ) {
    return `${capitalized}es`
  }

  return `${capitalized}s`
}

// Helper function to create a sector cone shape
function createSectorCone(
  center: L.LatLng,
  angleInDegrees: number,
  radiusInMeters: number = 300,
  arcAngle: number = 60
): L.LatLng[] {
  const points: L.LatLng[] = [center]
  const steps = 20

  const startAngle = angleInDegrees - arcAngle / 2
  const endAngle = angleInDegrees + arcAngle / 2

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps)
    const angleRad = (angle * Math.PI) / 180

    const latOffset = (radiusInMeters * Math.cos(angleRad)) / 111320
    const lngOffset =
      (radiusInMeters * Math.sin(angleRad)) / (111320 * Math.cos((center.lat * Math.PI) / 180))

    points.push(L.latLng(center.lat + latOffset, center.lng + lngOffset))
  }

  points.push(center)
  return points
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function LotDetail() {
  const { currency, unit } = useSettings()
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentViewPhotoIndex, setCurrentViewPhotoIndex] = useState(0)
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const [selectedMobileImageUrl, setSelectedMobileImageUrl] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const viewMapRef = useRef<L.Map | null>(null)
  const viewSectorRef = useRef<L.Polygon | null>(null)
  const [mapContainerEl] = useState<HTMLDivElement | null>(null)
  const [viewMapContainerEl, setViewMapContainerEl] = useState<HTMLDivElement | null>(null)

  const {
    data: lotData,
    isLoading: lotLoading,
    error: lotError,
  } = useGetLot(id || '', {
    query: {
      enabled: !!id,
    },
  })

  const lot = lotData

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    setSelectedMobileImageUrl(null)
    setCurrentImageIndex(0)
    setCurrentViewPhotoIndex(0)

    mapRef.current?.remove()
    mapRef.current = null
    markerRef.current = null

    viewMapRef.current?.remove()
    viewMapRef.current = null
    viewSectorRef.current = null
  }, [id])

  // Используем вложенный project, если он есть, иначе пытаемся загрузить по ID
  const project = lot?.project || null
  const projectId = !project ? lot?.projectId : null

  const { data: projectData, isLoading: projectLoading } = useGetProject(
    projectId || '',
    undefined,
    {
      query: {
        enabled: !!projectId, // Загружать только если нет вложенного проекта
      },
    }
  )

  // Используем данные из projectData только если не было вложенного проекта
  const projectFromApi =
    projectId && projectData
      ? (projectData as Project & { developer?: Developer; area?: Area })
      : null
  const finalProject = project || projectFromApi
  const projectSlug = finalProject?.slug || lot?.project?.slug || ''
  const { data: projectLotsData } = useListLots(
    { project: projectSlug },
    {
      query: {
        enabled: Boolean(projectSlug),
      },
    }
  )
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
      attributionControl: true,
    })

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',

    ).addTo(mapRef.current)

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

    const map = mapRef.current
    map.setView(coordinates, Math.max(map.getZoom(), MAP_ZOOM_DEFAULT))

    const applyMarkerIcon = () => {
      const icon = createPropertyMarkerIcon()

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
      markerRef.current.setIcon(createPropertyMarkerIcon())
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

  // Initialize view map (for orientation cone)
  useEffect(() => {
    if (!hasCoordinates || !viewMapContainerEl || viewMapRef.current) return

    const coordinates: [number, number] = [finalProject!.lat!, finalProject!.lng!]
    viewMapRef.current = L.map(viewMapContainerEl, {
      center: coordinates,
      zoom: VIEW_MAP_ZOOM,
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    })

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(viewMapRef.current)

    // Add center marker
    L.circleMarker(coordinates, {
      radius: 5,
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(viewMapRef.current)

    const invalidate = () => {
      viewMapRef.current?.invalidateSize()
    }

    const rafId = requestAnimationFrame(invalidate)
    const timeoutA = window.setTimeout(invalidate, 0)
    const timeoutB = window.setTimeout(invalidate, 150)
    const timeoutC = window.setTimeout(invalidate, 350)

    const resizeObserver = new ResizeObserver(() => {
      viewMapRef.current?.invalidateSize()
    })
    resizeObserver.observe(viewMapContainerEl)

    return () => {
      cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutA)
      window.clearTimeout(timeoutB)
      window.clearTimeout(timeoutC)
      resizeObserver.disconnect()
    }
  }, [hasCoordinates, viewMapContainerEl, finalProject])

  // Update sector cone when orientation exists
  useEffect(() => {
    const orientation = (lot?.data as { orientation?: string })?.orientation

    if (!viewMapRef.current || !hasCoordinates || !orientation || !finalProject) {
      if (viewSectorRef.current && viewMapRef.current) {
        viewSectorRef.current.remove()
        viewSectorRef.current = null
      }
      return
    }

    const selectedDirection = DIRECTIONS.find(d => d.key === orientation)
    if (!selectedDirection) return

    const center = L.latLng(finalProject.lat!, finalProject.lng!)
    const sectorPoints = createSectorCone(center, selectedDirection.angle)

    if (viewSectorRef.current) {
      viewSectorRef.current.remove()
    }

    // Yellow cone
    viewSectorRef.current = L.polygon(sectorPoints, {
      color: '#FFD700',
      fillColor: '#FFD700',
      fillOpacity: 0.35,
      weight: 2,
      opacity: 0.8,
    }).addTo(viewMapRef.current)
  }, [lot?.data, hasCoordinates, finalProject, viewMapContainerEl])

  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
      viewMapRef.current?.remove()
      viewMapRef.current = null
      viewSectorRef.current = null
    }
  }, [])

  if (loading) {
    return <LotDetailSkeleton />
  }

  if (error || !lot) {
    return (
      <NotFound
        title={t('lotDetail.notFound.title')}
        message={error || t('lotDetail.notFound.description', { id })}
        backTo={ROUTES.CATALOG}
        backLabel={t('lotDetail.notFound.backToCatalog')}
      />
    )
  }

  // Используем изображения лота - seed data использует gallery (как и для проектов)
  const lotMedia = lot.data?.media as
    | {
        cover?: { url?: string }
        floorPlanImages?: Array<{ url?: string }>
        gallery?: Array<{ url?: string }>
        photos?: Array<{ url?: string }>
        viewPhotos?: Array<{ url?: string }>
      }
    | undefined

  const allImages = [
    ...(lotMedia?.cover?.url ? [lotMedia.cover.url] : []),
    // Поддерживаем оба варианта: gallery (из seed) и photos (из OpenAPI schema)
    ...(lotMedia?.gallery?.map(img => img.url).filter((url): url is string => Boolean(url)) || []),
    ...(lotMedia?.photos?.map(img => img.url).filter((url): url is string => Boolean(url)) || []),
  ]
  const floorPlanImages =
    lotMedia?.floorPlanImages?.map(img => img.url).filter((url): url is string => Boolean(url)) || []
  const lotPhotos = Array.from(new Set(allImages))

  const viewPhotos =
    lotMedia?.viewPhotos?.map(img => img.url).filter((url): url is string => Boolean(url)) || []
  const mobileViewPhotos = viewPhotos.length > 0 ? viewPhotos : lotPhotos

  const lotDataFields = lot.data as
    | {
        view?: string
        furnishing?: string
        orientation?: string
        features?: string[]
        media?: {
          cover?: { url?: string }
          gallery?: Array<{ url?: string }>
        }
      }
    | undefined

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handlePrevViewPhoto = () => {
    if (mobileViewPhotos.length === 0) return
    setCurrentViewPhotoIndex(prev => (prev === 0 ? mobileViewPhotos.length - 1 : prev - 1))
  }

  const handleNextViewPhoto = () => {
    if (mobileViewPhotos.length === 0) return
    setCurrentViewPhotoIndex(prev => (prev === mobileViewPhotos.length - 1 ? 0 : prev + 1))
  }

  const paymentUnitPrice = 10_000_000
  const paymentFees = 100_000
  const paymentTotal = paymentUnitPrice + paymentFees
  const mobileMainImage = selectedMobileImageUrl || floorPlanImages[0] || lotPhotos[0]
  const allProjectLots = projectLotsData?.items || []
  const targetBedrooms = lot.bedrooms
  const targetMinPrice = lot.priceFromUs
  const similarUnits = allProjectLots.filter(projectLot => {
    if (!projectLot.id || projectLot.id === lot.id) return false
    if (targetBedrooms != null && projectLot.bedrooms !== targetBedrooms) return false
    if (targetMinPrice != null && targetMinPrice > 0) {
      if (projectLot.priceFromUs == null || projectLot.priceFromUs < targetMinPrice) return false
    }
    return true
  })

  const similarUnitsFromPrice =
    lot.priceFromUs ??
    similarUnits.reduce<number | null>((minPrice, similarLot) => {
      if (similarLot.priceFromUs == null) return minPrice
      if (minPrice == null) return similarLot.priceFromUs
      return Math.min(minPrice, similarLot.priceFromUs)
    }, null)

  const similarUnitsAreaRange = similarUnits.reduce<{ min: number | null; max: number | null }>(
    (acc, similarLot) => {
      if (similarLot.areaSqm == null) return acc
      return {
        min: acc.min == null ? similarLot.areaSqm : Math.min(acc.min, similarLot.areaSqm),
        max: acc.max == null ? similarLot.areaSqm : Math.max(acc.max, similarLot.areaSqm),
      }
    },
    { min: null, max: null }
  )

  const similarUnitsAreaLabel =
    similarUnitsAreaRange.min == null || similarUnitsAreaRange.max == null
      ? '-'
      : similarUnitsAreaRange.min === similarUnitsAreaRange.max
        ? formatArea(similarUnitsAreaRange.min, unit)
        : `${formatArea(similarUnitsAreaRange.min, unit)}-${formatArea(similarUnitsAreaRange.max, unit)}`

  const similarUnitsSection =
    similarUnits.length > 0 ? (
      <section className={styles.similarUnitsSection}>
        <div className={styles.similarUnitsHeader}>
          <h3 className={styles.similarUnitsTitle}>Similar Units</h3>
          <p className={styles.similarUnitsType}>{pluralizeType(lot.type)}</p>
          <div className={styles.similarUnitsStats}>
            <span>{t('projectDetail.beds', { count: lot.bedrooms ?? 0 })}</span>
            <span className={styles.similarUnitsDivider} />
            <span>
              {t('from')}{' '}
              {similarUnitsFromPrice != null ? formatPrice(similarUnitsFromPrice, currency) : '-'}
            </span>
            <span className={styles.similarUnitsDivider} />
            <span>{t('projectDetail.units', { count: similarUnits.length })}</span>
            <span className={styles.similarUnitsDivider} />
            <span>{similarUnitsAreaLabel}</span>
          </div>
        </div>

        <ApartmentsCarousel>
          {similarUnits.map((similarLot, idx) => (
            <ApartmentCard
              key={similarLot.id || idx}
              lot={similarLot}
              projectName={finalProject?.name}
              projectSlug={finalProject?.slug}
              areaName={similarLot.area?.name || finalProject?.area?.name}
              roi={similarLot.roi ?? finalProject?.roi}
            />
          ))}
        </ApartmentsCarousel>
      </section>
    ) : null

  const paymentPlanSection = (
    <div className={styles.paymentPlanCard}>
      <h3 className={styles.paymentPlanTitle}>Payment plan</h3>
      <div className={styles.paymentPlanRows}>
        <div className={styles.paymentPlanRow}>
          <div className={styles.paymentPlanLeft}>
            <span className={styles.paymentPlanBullet} />
            <div className={styles.paymentPlanText}>
              <span className={styles.paymentPlanStage}>Down Payment</span>
              <span className={styles.paymentPlanMeta}>30%</span>
            </div>
          </div>
          <div className={styles.paymentPlanRight}>
            <span className={styles.paymentPlanAmount}>{formatPrice(3_000_000, currency)}</span>
            <span className={styles.paymentPlanSubmeta}>Fees included 20%</span>
          </div>
        </div>
        <div className={styles.paymentPlanRow}>
          <div className={styles.paymentPlanLeft}>
            <span className={styles.paymentPlanBullet} />
            <div className={styles.paymentPlanText}>
              <span className={styles.paymentPlanStage}>Pre-Handover Payments</span>
              <span className={styles.paymentPlanMeta}>10%</span>
            </div>
          </div>
          <div className={styles.paymentPlanRight}>
            <span className={styles.paymentPlanAmount}>{formatPrice(1_000_000, currency)}</span>
          </div>
        </div>
        <div className={styles.paymentPlanRow}>
          <div className={styles.paymentPlanLeft}>
            <span className={styles.paymentPlanBullet} />
            <div className={styles.paymentPlanText}>
              <span className={styles.paymentPlanStage}>On Handover</span>
              <span className={styles.paymentPlanMeta}>60%</span>
            </div>
          </div>
          <div className={styles.paymentPlanRight}>
            <span className={styles.paymentPlanAmount}>{formatPrice(6_000_000, currency)}</span>
          </div>
        </div>
      </div>
      <div className={styles.paymentPlanSummary}>
        <div className={styles.paymentPlanSummaryRow}>
          <div className={styles.paymentPlanSummaryLeft}>
            <span>Unit Price</span>
            <small>Fees</small>
          </div>
          <div className={styles.paymentPlanSummaryRight}>
            <span>{formatPrice(paymentUnitPrice, currency)}</span>
            <small>{formatPrice(paymentFees, currency)}</small>
          </div>
        </div>
        <div className={styles.paymentPlanSummaryRow}>
          <div className={styles.paymentPlanSummaryLeft}>
            <span>Total Price</span>
          </div>
          <div className={styles.paymentPlanSummaryRight}>
            <span>{formatPrice(paymentTotal, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isMobile) {
    return (
      <div className={styles.container}>
        <div className={styles.desktopLotLayout}>
          <div className={styles.desktopCenterColumn}>
            <div className={styles.desktopMainGallery}>
              <div className={styles.galleryContainer}>
                <div className={styles.mainImageContainer}>
                  {allImages.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(allImages[currentImageIndex], 'hero')}
                        alt={`${finalProject?.name || 'Unit'} - image ${currentImageIndex + 1}`}
                        className={styles.projectImage}
                      />
                      {allImages.length > 1 && (
                        <>
                          <button
                            className={`${styles.navButton} ${styles.prevButton}`}
                            onClick={handlePrevImage}
                            aria-label="Previous image"
                          ><ChevronLeft size={18} strokeWidth={2.5} />
                          </button>
                          <button
                            className={`${styles.navButton} ${styles.nextButton}`}
                            onClick={handleNextImage}
                            aria-label="Next image"
                          ><ChevronRight size={18} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>{t('lotDetail.imagePlaceholder')}</span>
                    </div>
                  )}
                </div>
              </div>
              {allImages.length > 1 && (
                <div className={styles.desktopGalleryThumbs}>
                  {allImages.map((url, idx) => (
                    <button
                      key={`${url}-${idx}`}
                      type="button"
                      className={`${styles.desktopGalleryThumb} ${
                        idx === currentImageIndex ? styles.desktopGalleryThumbActive : ''
                      }`}
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <img src={getImageUrl(url, 'thumbnail')} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.desktopCardWrap}>
              <ApartmentCard
                lot={lot}
                projectName={finalProject?.name}
                projectSlug={finalProject?.slug}
                areaName={lot.area?.name || finalProject?.area?.name}
                roi={lot.roi}
                onClick={() => {}}
                onImageClick={imageUrl => setSelectedMobileImageUrl(imageUrl)}
                hideGallery
                fullWidth
                coverFirst
                disableHoverLift
              />
            </div>

            {similarUnitsSection}
          </div>

          <div className={styles.desktopSideColumn}>
            {(lotDataFields?.orientation || mobileViewPhotos.length > 0) && hasCoordinates ? (
              <div className={styles.desktopViewBlock}>
                <h3 className={styles.desktopSectionTitle}>Apartment View</h3>
                {lotDataFields?.orientation ? (
                  <div ref={setViewMapContainerEl} className={styles.viewMap} />
                ) : null}
                {mobileViewPhotos.length > 0 ? (
                  <div className={styles.desktopViewGallery}>
                    <div className={styles.desktopViewMain}>
                      <img
                        src={getImageUrl(mobileViewPhotos[currentViewPhotoIndex], 'hero')}
                        alt={`View photo ${currentViewPhotoIndex + 1}`}
                        className={styles.desktopViewMainImage}
                      />
                      {mobileViewPhotos.length > 1 && (
                        <>
                          <button
                            className={`${styles.navButton} ${styles.prevButton}`}
                            onClick={handlePrevViewPhoto}
                            aria-label="Previous view photo"
                          ><ChevronLeft size={18} strokeWidth={2.5} />
                          </button>
                          <button
                            className={`${styles.navButton} ${styles.nextButton}`}
                            onClick={handleNextViewPhoto}
                            aria-label="Next view photo"
                          ><ChevronRight size={18} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                    </div>
                    {mobileViewPhotos.length > 1 && (
                      <div className={styles.desktopViewThumbs}>
                        {mobileViewPhotos.map((url, idx) => (
                          <button
                            key={`${url}-${idx}`}
                            type="button"
                            className={`${styles.desktopViewThumb} ${
                              idx === currentViewPhotoIndex ? styles.desktopViewThumbActive : ''
                            }`}
                            onClick={() => setCurrentViewPhotoIndex(idx)}
                            aria-label={`View photo ${idx + 1}`}
                          >
                            <img src={getImageUrl(url, 'thumbnail')} alt={`View thumbnail ${idx + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            {paymentPlanSection}
          </div>
        </div>
        <Modal
          open={is3DModalOpen}
          onClose={() => setIs3DModalOpen(false)}
          title={t('lotDetail.modal3D')}
          className="wide transparent"
        >
          <Model3DViewer embedded />
        </Modal>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.mobileLotContent}>
        <div className={styles.mobileHero}>
          <div className={styles.mobileHeroMain}>
            {mobileMainImage ? (
              <img src={getImageUrl(mobileMainImage, 'hero')} alt="Lot main" className={styles.mobileHeroImage} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>{t('lotDetail.imagePlaceholder')}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.mobileCardBlock}>
          <ApartmentCard
            lot={lot}
            projectName={finalProject?.name}
            projectSlug={finalProject?.slug}
            areaName={lot.area?.name || finalProject?.area?.name}
            roi={lot.roi}
            onClick={() => {}}
            onImageClick={imageUrl => setSelectedMobileImageUrl(imageUrl)}
            fullWidth
            coverFirst
            disableHoverLift
          />
        </div>

        {(lotDataFields?.orientation || mobileViewPhotos.length > 0) && hasCoordinates && (
          <div className={styles.mobileViewBlock}>
            <h3 className={styles.mobileSectionTitle}>Apartment View</h3>
            {lotDataFields?.orientation ? (
              <div ref={setViewMapContainerEl} className={styles.viewMap} />
            ) : null}
            {mobileViewPhotos.length > 0 && (
              <div className={styles.mobileViewGallery}>
                <div className={styles.mobileViewMain}>
                  <img
                    src={getImageUrl(mobileViewPhotos[currentViewPhotoIndex], 'hero')}
                    alt={`View photo ${currentViewPhotoIndex + 1}`}
                    className={styles.mobileViewMainImage}
                  />
                  {mobileViewPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        className={`${styles.mobileViewArrow} ${styles.mobileViewArrowLeft}`}
                        onClick={handlePrevViewPhoto}
                        aria-label="Previous view photo"
                      >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.mobileViewArrow} ${styles.mobileViewArrowRight}`}
                        onClick={handleNextViewPhoto}
                        aria-label="Next view photo"
                      >
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>
                <div className={styles.mobileViewThumbs}>
                  {mobileViewPhotos.map((url, idx) => (
                    <button
                      key={`${url}-${idx}`}
                      type="button"
                      className={`${styles.mobileViewThumb} ${
                        idx === currentViewPhotoIndex ? styles.mobileViewThumbActive : ''
                      }`}
                      onClick={() => setCurrentViewPhotoIndex(idx)}
                    >
                      <img src={getImageUrl(url, 'thumbnail')} alt={`View photo ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {paymentPlanSection}
        {similarUnitsSection}
      </div>

      <Modal
        open={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        title={t('lotDetail.modal3D')}
        className="wide transparent"
      >
        <Model3DViewer embedded />
      </Modal>
    </div>
  )
}


