import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../../ui/Modal'
import { useIsRTL } from '../../hooks/useDirection'
import type { Lot } from '../../api'
import { capitalize, formatPrice } from '../../utils/format'
import { ApartmentCard } from './ApartmentCard'
import styles from './LotQuickViewModal.module.scss'
import { getImageUrl } from '../../utils/imageUrl'
import { useSettings } from '../../features/Settings/Settings'

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

type LotData = {
  media?: {
    cover?: { url?: string }
    floorPlanImages?: Array<{ url?: string }>
    gallery?: Array<{ url?: string }>
    photos?: Array<{ url?: string }>
    viewPhotos?: Array<{ url?: string }>
  }
  paymentPlan?: {
    schedule?: Array<{ stage?: string; percent?: number; amount?: number }>
  }
  orientation?: string
}

interface LotQuickViewModalProps {
  open: boolean
  onClose: () => void
  lot: Lot | null
  projectName?: string
  projectSlug?: string
  areaName?: string
  projectCompletionDate?: string
  projectPaymentPlan?: string
  fallbackRoi?: number
  lat?: number | null
  lng?: number | null
}

function createSectorCone(
  center: L.LatLng,
  angleInDegrees: number,
  radiusInMeters = 300,
  arcAngle = 60
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

export function LotQuickViewModal({
  open,
  onClose,
  lot,
  projectName,
  projectSlug,
  areaName,
  projectPaymentPlan,
  fallbackRoi,
  lat,
  lng,
}: LotQuickViewModalProps) {
  const { t } = useTranslation()
  const { currency } = useSettings()
  const isRTL = useIsRTL()
  const [lotPhotoIndex, setLotPhotoIndex] = useState(0)
  const [planImageIndex, setPlanImageIndex] = useState(0)
  const viewMapRef = useRef<L.Map | null>(null)
  const viewSectorRef = useRef<L.Polygon | null>(null)
  const [viewMapContainerEl, setViewMapContainerEl] = useState<HTMLDivElement | null>(null)

  const lotData = (lot?.data as LotData | undefined) || undefined

  const floorPlanImages =
    lotData?.media?.floorPlanImages?.map(item => item.url).filter((url): url is string => !!url) ||
    []
  const galleryPhotos =
    lotData?.media?.photos?.map(item => item.url).filter((url): url is string => !!url) || []
  const commonGalleryPhotos =
    lotData?.media?.gallery?.map(item => item.url).filter((url): url is string => !!url) || []
  const coverImage = lotData?.media?.cover?.url

  const planImages = floorPlanImages
  const lotPhotos = Array.from(
    new Set([...(coverImage ? [coverImage] : []), ...commonGalleryPhotos, ...galleryPhotos])
  )
  const activePlanImage = planImages[planImageIndex] || null
  const activeOrientationImage = lotPhotos[lotPhotoIndex] || lotPhotos[0]
  const lotPaymentPlanSchedule = lotData?.paymentPlan?.schedule
  const paymentPlanSchedule =
    lotPaymentPlanSchedule && lotPaymentPlanSchedule.length > 0
      ? lotPaymentPlanSchedule
      : projectPaymentPlan
          ?.split('/')
          .map(pct => {
            const percent = parseInt(pct, 10)
            const amount =
              lot?.priceFromUs != null
                ? Math.round((percent / 100) * lot.priceFromUs)
                : undefined
            return { percent, amount }
          })

  useEffect(() => {
    if (!open) {
      setLotPhotoIndex(0)
      setPlanImageIndex(0)
    }
  }, [open])

  useEffect(() => {
    setLotPhotoIndex(0)
    setPlanImageIndex(0)
  }, [lot?.id])

  useEffect(() => {
    if (!open || !viewMapContainerEl || viewMapRef.current || lat == null || lng == null) return

    const coordinates: [number, number] = [lat, lng]
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

    L.circleMarker(coordinates, {
      radius: 5,
      fillColor: '#fff',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(viewMapRef.current)

    setTimeout(() => {
      viewMapRef.current?.invalidateSize()
    }, 0)
  }, [open, viewMapContainerEl, lat, lng])

  useEffect(() => {
    const orientation = lotData?.orientation

    if (!open || !viewMapRef.current || !viewMapContainerEl || lat == null || lng == null) return

    if (!orientation) {
      if (viewSectorRef.current) {
        viewSectorRef.current.remove()
        viewSectorRef.current = null
      }
      return
    }

    const selectedDirection = DIRECTIONS.find(item => item.key === orientation)
    if (!selectedDirection) {
      if (viewSectorRef.current) {
        viewSectorRef.current.remove()
        viewSectorRef.current = null
      }
      return
    }

    const center = L.latLng(lat, lng)
    const map = viewMapRef.current
    map.setView([lat, lng], VIEW_MAP_ZOOM)
    map.invalidateSize()

    const sectorPoints = createSectorCone(center, selectedDirection.angle)

    if (viewSectorRef.current) {
      viewSectorRef.current.remove()
    }

    viewSectorRef.current = L.polygon(sectorPoints, {
      color: '#FFD700',
      fillColor: '#FFD700',
      fillOpacity: 0.35,
      weight: 2,
      opacity: 0.8,
    }).addTo(map)
  }, [open, lot?.data, lat, lng, viewMapContainerEl])

  useEffect(() => {
    if (!open) {
      viewSectorRef.current?.remove()
      viewSectorRef.current = null
      viewMapRef.current?.remove()
      viewMapRef.current = null
    }
  }, [open])

  const goToLotPhotoPrev = () => {
    setLotPhotoIndex(prev => (prev === 0 ? lotPhotos.length - 1 : prev - 1))
  }

  const goToLotPhotoNext = () => {
    setLotPhotoIndex(prev => (prev === lotPhotos.length - 1 ? 0 : prev + 1))
  }

  const goToPlanPrev = () => {
    setPlanImageIndex(prev => (prev === 0 ? planImages.length - 1 : prev - 1))
  }

  const goToPlanNext = () => {
    setPlanImageIndex(prev => (prev === planImages.length - 1 ? 0 : prev + 1))
  }

  const modalTitle = t('apartmentCard.title', {
    type: capitalize(lot?.type),
    count: lot?.bedrooms ?? 0,
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="large"
      className={styles.quickViewModal}
      aria-label={modalTitle}
    >
      {!lot ? null : (
        <div className={`${styles.layout} ${!activePlanImage ? styles.layoutSingle : ''}`}>
          {activePlanImage && (
            <div className={styles.leftPane}>
              <div className={styles.leftColumn}>
                <div className={styles.floorPlanFrame}>
                  <img src={getImageUrl(activePlanImage, 'hero')} alt={modalTitle} className={styles.floorPlanImage} />
                  {planImages.length > 1 && (
                    <>
                      <button
                        className={`${styles.planArrow} ${styles.planArrowLeft}`}
                        onClick={goToPlanPrev}
                        aria-label={t('apartmentCard.previousImage')}
                      >
                        {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      </button>
                      <button
                        className={`${styles.planArrow} ${styles.planArrowRight}`}
                        onClick={goToPlanNext}
                        aria-label={t('apartmentCard.nextImage')}
                      >
                        {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </>
                  )}
                </div>
                {planImages.length > 1 && (
                  <div className={styles.floorPlanThumbs}>
                    {planImages.map((url, index) => (
                      <button
                        type="button"
                        key={`${url}-${index}`}
                        className={`${styles.floorPlanThumb} ${index === planImageIndex ? styles.floorPlanThumbActive : ''}`}
                        onClick={() => setPlanImageIndex(index)}
                        aria-label={`Floor plan ${index + 1}`}
                      >
                        <img src={getImageUrl(url, 'thumbnail')} alt={`Floor plan ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.rightPane}>
            <div className={styles.rightColumn}>
              <div className={styles.lotCardWrap}>
                <ApartmentCard
                  lot={lot}
                  projectName={projectName}
                  projectSlug={projectSlug}
                  areaName={areaName}
                  roi={lot.roi ?? fallbackRoi}
                  onClick={() => {}}
                  onImageClick={imageUrl => {
                    const idx = planImages.indexOf(imageUrl)
                    if (idx >= 0) setPlanImageIndex(idx)
                  }}
                  fullWidth
                  coverFirst
                  disableHoverLift
                />
              </div>

              <div className={styles.sectionCard}>
                <h4>
                  {t('lotDetail.orientation')}
                  {lotData?.orientation ? `: ${lotData.orientation}` : ''}
                </h4>
                {lat != null && lng != null && lotData?.orientation ? (
                  <div className={styles.viewMap} ref={setViewMapContainerEl} />
                ) : null}
                {lotPhotos.length > 0 ? (
                  <div className={styles.orientationGallery}>
                    <div className={styles.orientationMain}>
                      <img src={getImageUrl(activeOrientationImage, 'hero')} alt="Active orientation" />
                    </div>
                    {lotPhotos.length > 1 && (
                      <>
                        <button
                          className={`${styles.imageArrow} ${styles.leftArrow}`}
                          onClick={goToLotPhotoPrev}
                          aria-label={t('apartmentCard.previousImage')}
                        >
                          {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                        <button
                          className={`${styles.imageArrow} ${styles.rightArrow}`}
                          onClick={goToLotPhotoNext}
                          aria-label={t('apartmentCard.nextImage')}
                        >
                          {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </>
                    )}
                    <div className={styles.orientationThumbs}>
                      {lotPhotos.map((url, index) => {
                        const realIndex = lotPhotos.findIndex(photo => photo === url)
                        const isActive = url === activeOrientationImage
                        return (
                          <button
                            type="button"
                            className={`${styles.orientationGalleryItem} ${
                              isActive ? styles.orientationGalleryItemActive : ''
                            }`}
                            key={`${url}-${index}`}
                            onClick={() => {
                              if (realIndex >= 0) {
                                setLotPhotoIndex(realIndex)
                              }
                            }}
                            aria-label={`Open lot photo ${index + 1}`}
                          >
                            <img src={getImageUrl(url, 'thumbnail')} alt={`Lot photo ${index + 1}`} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptySecondary}>No lot photos</div>
                )}
              </div>

              {paymentPlanSchedule && paymentPlanSchedule.length > 0 && (
                <div className={styles.sectionCard}>
                  <h4>Payment plan</h4>
                  <div className={styles.paymentRows}>
                    <div className={styles.paymentStages}>
                      {paymentPlanSchedule.map((item, idx) => (
                        <div key={idx} className={styles.paymentRow}>
                          <div className={styles.paymentLeft}>
                            <span className={styles.paymentBullet} />
                            <div className={styles.paymentText}>
                              {'stage' in item && item.stage && (
                                <span className={styles.paymentStage}>{item.stage}</span>
                              )}
                              {item.percent != null && (
                                <span className={styles.paymentMeta}>{item.percent}%</span>
                              )}
                            </div>
                          </div>
                          {item.amount != null && (
                            <div className={styles.paymentRight}>
                              <span className={styles.paymentAmount}>
                                {formatPrice(item.amount, currency)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {lot?.priceFromUs != null && (
                      <div className={styles.paymentSummary}>
                        <div className={styles.summaryRow}>
                          <div className={styles.summaryLeft}>
                            <span>Total Price</span>
                          </div>
                          <div className={styles.summaryRight}>
                            <span>{formatPrice(lot.priceFromUs, currency)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
