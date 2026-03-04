import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useEmblaCarousel from 'embla-carousel-react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createPropertyMarkerIcon } from '../../components/PropertyMap/markerIcon'
import { developerLogos } from '../../data/mockProperties'
import ProjectFeatures from '../../components/ProjectFeatures'
import Model3DViewer from '../../components/Model3DViewer'
import FloorPlanTable from '../../components/FloorPlanTable'
import { splitCompletionDate } from '../../components/splitCompletionDate'
import { Modal } from '../../ui/Modal'
import { Typography } from '../../ui/Typography'
import { RoiBadge } from '../../ui/RoiBadge'
import { YouTubePreview } from '../../ui/YouTubePreview'
import type { Project, Lot, Developer, Area, Badge as BadgeType } from '../../api'
import { useGetProject, useListLots } from '../../api'
import { ROUTES } from '../../constants/routes'
import { NotFound } from '../../ui/NotFound'
import {
  MapPin,
  // Check, // timeline hidden
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useSettings } from '../../features/Settings/Settings'
import { formatPrice, formatArea } from '../../utils/format'
import { useIsRTL } from '../../hooks/useDirection'
import { ApartmentsCarousel } from './ApartmentsCarousel'
import { ApartmentCard } from './ApartmentCard'
import { LotQuickViewModal } from './LotQuickViewModal'
import { ProjectDetailSkeleton } from './ProjectDetailSkeleton'
import { getImageUrl } from '../../utils/imageUrl'
import styles from './ProjectDetail.module.scss'

const MAP_ZOOM_DEFAULT = 13
const ALWAYS_FRESH_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
}
const _forceSkeleton = false

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

type Infrastructure = {
  id?: string
  name?: string
  icon?: string
}

type ProjectWithRelations = Project & {
  developer?: Developer
  area?: Area
  badges?: BadgeType[]
  infrastructures?: Infrastructure[]
}

interface LotGroup {
  bedrooms: number
  type: string
  lots: Lot[]
  minPrice: number
  totalUnits: number
  minArea: number
  maxArea: number
}

const pluralizeType = (type: string) => {
  const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
  if (type.endsWith('x') || type.endsWith('s') || type.endsWith('sh') || type.endsWith('ch')) {
    return capitalized + 'es'
  }
  return capitalized + 's'
}
export default function ProjectDetail() {
  const { t } = useTranslation()
  const { currency, unit } = useSettings()
  const isRTL = useIsRTL()
  const { slug } = useParams<{ slug: string }>()
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [mapContainerEl, setMapContainerEl] = useState<HTMLDivElement | null>(null)

  // const formatDate = useCallback(
  //   (dateStr?: string) => {
  //     if (!dateStr) return null
  //     const date = new Date(dateStr)
  //     return date.toLocaleDateString(getDateLocale(i18n.language), {
  //       month: 'long',
  //       day: 'numeric',
  //       year: 'numeric',
  //     })
  //   },
  //   [i18n.language]
  // )

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: isRTL ? 'rtl' : 'ltr' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number, jump = false) => {
      if (emblaApi) emblaApi.scrollTo(index, jump)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useGetProject(slug || '', undefined, {
    query: {
      enabled: !!slug,
      ...ALWAYS_FRESH_QUERY_OPTIONS,
    },
  })

  const { data: lotsData, isLoading: lotsLoading } = useListLots(
    { project: slug || '' },
    {
      query: {
        enabled: !!slug,
        ...ALWAYS_FRESH_QUERY_OPTIONS,
      },
    }
  )

  const project = (projectData as ProjectWithRelations | undefined) || null
  const lots: Lot[] = lotsData?.items || []

  const groupedLots = useMemo<LotGroup[]>(() => {
    const groups: Record<number, LotGroup> = {}

    lots.forEach(lot => {
      const bedrooms = lot.bedrooms ?? 0
      if (!groups[bedrooms]) {
        groups[bedrooms] = {
          bedrooms,
          type: lot.type || 'apartment',
          lots: [],
          minPrice: Infinity,
          totalUnits: 0,
          minArea: Infinity,
          maxArea: 0,
        }
      }
      groups[bedrooms].lots.push(lot)
      groups[bedrooms].totalUnits++
      if (lot.priceFromUs && lot.priceFromUs < groups[bedrooms].minPrice) {
        groups[bedrooms].minPrice = lot.priceFromUs
      }
      if (lot.areaSqft) {
        if (lot.areaSqft < groups[bedrooms].minArea) groups[bedrooms].minArea = lot.areaSqft
        if (lot.areaSqft > groups[bedrooms].maxArea) groups[bedrooms].maxArea = lot.areaSqft
      }
    })

    return Object.values(groups).sort((a, b) => a.bedrooms - b.bedrooms)
  }, [lots])

  const loading = projectLoading || lotsLoading
  const error = projectError ? String(projectError) : null

  const hasCoordinates =
    project?.lat !== undefined &&
    project?.lng !== undefined &&
    project.lat !== null &&
    project.lng !== null

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
    if (isMobile && selectedLot) {
      setSelectedLot(null)
    }
  }, [isMobile, selectedLot])

  useEffect(() => {
    if (!hasCoordinates || !mapContainerEl || mapRef.current) return

    const defaultCoordinates: [number, number] = [25.1972, 55.2744]
    mapRef.current = L.map(mapContainerEl, {
      center: defaultCoordinates,
      zoom: MAP_ZOOM_DEFAULT,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      }
    ).addTo(mapRef.current)

    setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 0)
  }, [hasCoordinates, mapContainerEl])

  useEffect(() => {
    if (!mapRef.current || !project || !hasCoordinates) return

    const coordinates: [number, number] = [project.lat!, project.lng!]

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
  }, [project, hasCoordinates, mapContainerEl])

  useEffect(() => {
    if (!mapContainerEl) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && mapRef.current) {
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

  if (loading || _forceSkeleton) {
    return <ProjectDetailSkeleton />
  }

  if (error || !project) {
    return (
      <NotFound
        title={t('projectDetail.notFound.title')}
        message={error || t('projectDetail.notFound.description', { slug })}
        backTo={ROUTES.CATALOG}
        backLabel={t('projectDetail.notFound.backToCatalog')}
      />
    )
  }

  const allImages = [
    ...(project.media?.cover?.url ? [project.media.cover.url] : []),
    ...(project.media?.gallery
      ?.map(img => img.url)
      .filter((url): url is string => Boolean(url)) || []),
  ]

  const projectLogoUrl = project.media?.logo?.url
  const developerLogoUrl =
    project.developer?.logoUrl || developerLogos[project.developer?.name || '']
  const displayLogoUrl = projectLogoUrl || developerLogoUrl

  const description =
    typeof project.description === 'string'
      ? project.description
      : project.description
        ? JSON.stringify(project.description)
        : null

  // const timeline = project.timeline
  // const timelineItems = [...] // timeline hidden

  const { firstPart: completionFirstPart, rest: completionRest } = splitCompletionDate(
    project.completionDate
  )

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft
  const NextIcon = isRTL ? ChevronLeft : ChevronRight

  return (
    <div className={styles.container}>
      <div className={styles.leftContent}>
        {/* Hero Gallery */}
        <div className={styles.mainGallery}>
          <div className={styles.galleryContainer}>
            {allImages.length > 0 ? (
              <>
                <div className={styles.emblaViewport} ref={emblaRef}>
                  <div className={styles.emblaContainer}>
                    {allImages.map((url, idx) => (
                      <div className={styles.emblaSlide} key={idx}>
                        <img
                          src={getImageUrl(url, 'hero')}
                          alt={`${project.name} - image ${idx + 1}`}
                          className={styles.projectImage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {allImages.length > 1 && (
                  <>
                    <button
                      className={`${styles.navButton} ${styles.prevButton}`}
                      onClick={scrollPrev}
                      aria-label="Previous image"
                    >
                      <PrevIcon size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      className={`${styles.navButton} ${styles.nextButton}`}
                      onClick={scrollNext}
                      aria-label="Next image"
                    >
                      <NextIcon size={18} strokeWidth={2.5} />
                    </button>
                    <div className={styles.progressBar}>
                      {allImages.map((_, idx) => (
                        <div
                          key={idx}
                          className={`${styles.progressSegment} ${idx === selectedIndex ? styles.progressSegmentActive : ''}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>{t('projectDetail.imagePlaceholder')}</span>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className={styles.thumbnailRow}>
              {allImages.map((url, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumbnailWrapper} ${idx === selectedIndex ? styles.activeThumbnail : ''
                    }`}
                  onClick={() => scrollTo(idx, true)}
                >
                  <img src={getImageUrl(url, 'thumbnail')} alt={`Thumbnail ${idx + 1}`} className={styles.thumbnailImage} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Header */}
        <section className={styles.projectHeader}>
          <div className={styles.headerTop}>
            <div className={styles.projectInfo}>
              {displayLogoUrl && (
                <div className={styles.projectLogoContainer}>
                  <img
                    src={getImageUrl(displayLogoUrl, 'thumbnail')}
                    alt={project.name || project.developer?.name}
                    className={styles.projectLogo}
                  />
                </div>
              )}
              <div className={styles.projectNameContainer}>
                <Typography variant="h1" className={styles.projectTitle}>
                  {project.name}
                </Typography>
                <Typography className={styles.projectArea}>
                  {project.area?.name || 'Dubai'}
                </Typography>
                {project.developer?.name && (
                  <Typography className={styles.projectDeveloper}>
                    {project.developer.name}
                  </Typography>
                )}
              </div>
            </div>
            {project.roi && <RoiBadge value={project.roi} />}
          </div>

          {(project.priceFromUs || project.priceFromDeveloper) && (
            <div className={styles.priceRows}>
              {project.priceFromUs && project.priceFromDeveloper && (
                <div className={styles.ourPriceRow}>
                  <div className={styles.priceLabelContainer}>
                    <Typography size="large" weight="medium" className={styles.priceLabel}>
                      {t('projectDetail.ourPrice')}
                    </Typography>
                    {project.priceFromDeveloper > project.priceFromUs && (
                      <span className={styles.discountBadge}>
                        -
                        {Math.round(
                          (1 - project.priceFromUs / project.priceFromDeveloper) * 100
                        )}
                        %
                      </span>
                    )}
                  </div>
                  <div className={styles.priceValue}>
                    <Typography className={styles.priceFrom}>{t('from')}</Typography>{' '}
                    <Typography variant="h1" className={styles.priceAmount}>
                      {formatPrice(project.priceFromUs, currency)}
                    </Typography>
                  </div>
                </div>
              )}
              {project.priceFromDeveloper && (
                <div className={styles.developerPriceRow}>
                  <Typography size="large" weight="medium" className={styles.priceLabel}>
                    {t('projectDetail.developerPrice')}
                  </Typography>
                  <div className={styles.priceValue}>
                    <Typography className={styles.priceFrom}>{t('from')}</Typography>{' '}
                    <Typography variant="h1" className={styles.priceAmount}>
                      {formatPrice(project.priceFromDeveloper, currency)}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          )}

          {(completionFirstPart || project.paymentPlan) && (
            <div className={styles.headerBottom}>
              {completionFirstPart && (
                <Typography size="large" className={styles.dateValue}>
                  <span className={styles.quarter}>{completionFirstPart}</span>
                  {completionRest && <span className={styles.year}> {completionRest}</span>}
                </Typography>
              )}
              {project.paymentPlan && (
                <Typography size="large" weight="medium" className={styles.planValue}>
                  <span className={styles.planLabel}>PP:</span>{' '}
                  <span className={styles.planNumbers}>{project.paymentPlan}</span>
                </Typography>
              )}
            </div>
          )}
        </section>

        {/* Description Section */}
        {description && (
          <section className={styles.descriptionSection}>
            <p
              className={`${styles.descriptionText} ${isDescriptionExpanded ? styles.expanded : styles.collapsed}`}
            >
              {description}
            </p>
            {description.length > 300 && (
              <button
                className={styles.seeMoreBtn}
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <span>
                  {isDescriptionExpanded ? t('projectDetail.seeLess') : t('projectDetail.seeMore')}
                </span>
                {isDescriptionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </section>
        )}

        {/* Infrastructure Section */}
        {project.infrastructures && project.infrastructures.length > 0 && (
          <section className={styles.infrastructureSection}>
            <ProjectFeatures
              features={project.infrastructures
                .filter((i): i is Infrastructure & { name: string } => !!i.name)
                .map(i => ({ name: i.name, icon: i.icon }))}
              maxItems={12}
            />
          </section>
        )}

        {/* Apartments Sections by Bedroom Count */}
        <div className={styles.apartmentsHeaderTop}>
          <Typography variant="h1">{t('projectDetail.allUnits')}</Typography>
          {/* <button className={styles.viewAllBtn}>
            <Typography variant="body" size="small" weight="regular">
              {t('projectDetail.viewTheGrid')}
            </Typography>
            <ArrowRight size={16} />
          </button> */}
        </div>
        {groupedLots.length > 0 ? (
          groupedLots.map(group => (
            <section key={group.bedrooms} className={styles.apartmentsSection}>
              <div className={styles.apartmentsHeader}>
                <Typography variant="h1" className={styles.groupTypeLabel}>
                  {pluralizeType(group.type)}
                </Typography>
                <div className={styles.apartmentsStats}>
                  <span>{t('projectDetail.beds', { count: group.bedrooms })}</span>
                  <span className={styles.statDivider} />
                  <span>
                    {t('from')}{' '}
                    {formatPrice(group.minPrice === Infinity ? 0 : group.minPrice, currency)}
                  </span>
                  <span className={styles.statDivider} />
                  <span>{t('projectDetail.units', { count: group.totalUnits })}</span>
                  <span className={styles.statDivider} />
                  <span>
                    {group.minArea === Infinity
                      ? '-'
                      : group.minArea === group.maxArea
                        ? formatArea(group.minArea, unit)
                        : `${formatArea(group.minArea, unit)} - ${formatArea(group.maxArea, unit)}`}
                  </span>
                </div>
              </div>

              <ApartmentsCarousel>
                {group.lots.map((lot, index) => (
                  <ApartmentCard
                    key={lot.id || index}
                    lot={lot}
                    projectName={project.name}
                    projectSlug={slug}
                    areaName={project.area?.name}
                    roi={lot.roi ?? project.roi}
                    onClick={
                      isMobile
                        ? undefined
                        : openedLot => {
                          setSelectedLot(openedLot)
                        }
                    }
                  />
                ))}
              </ApartmentsCarousel>
            </section>
          ))
        ) : (
          <section className={styles.apartmentsSection}>
            <div style={{ padding: '1rem 0', color: 'var(--color-text-secondary)' }}>
              {t('projectDetail.noApartments')}
            </div>
          </section>
        )}
      </div>

      <div className={styles.rightContent}>
        <div className={styles.mediaSection}>
          {project.youtubeUrl && (
            <YouTubePreview
              url={project.youtubeUrl}
              size="medium"
              className={styles.videoPreview}
            />
          )}

          {hasCoordinates && (
            <div className={styles.mapThumbnail}>
              <div ref={setMapContainerEl} className={styles.miniMap} />
              <div className={styles.mapLocationLabel}>
                <MapPin size={14} />
                <span>{project.area?.name || 'Location'}</span>
              </div>
              {project.googleMapsUrl && (
                <a
                  href={project.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.openMapsLink}
                >
                  {t('projectDetail.openInGoogleMaps')}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Project Timeline — hidden */}
        {/* <div className={styles.timelineSection}>
          <Typography variant="h1" weight="medium" className={styles.timelineHeader}>{t('projectDetail.timeline.title')}</Typography>
          <div className={styles.timelineCard}>
            <div className={styles.timelineList}>
              {timelineItems.map((item, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div
                    className={`${styles.timelineDot} ${item.completed ? styles.timelineDotCompleted : ''}`}
                  >
                    {item.completed && <Check size={12} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>{item.label}</span>
                    {item.value && <span className={styles.timelineDate}>{item.value}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>

      {/* Modals */}
      <Modal
        open={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        title={t('projectDetail.modal3D')}
        className="wide transparent"
      >
        <Model3DViewer embedded />
      </Modal>

      <Modal
        open={isFloorPlanModalOpen}
        onClose={() => setIsFloorPlanModalOpen(false)}
        title={t('projectDetail.modalBuildingPlan')}
        size="large"
      >
        {lots.length > 0 ? (
          <FloorPlanTable lots={lots} />
        ) : (
          <div
            style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}
          >
            {t('projectDetail.noApartments')}
          </div>
        )}
      </Modal>

      {!isMobile && (
        <LotQuickViewModal
          open={!!selectedLot}
          onClose={() => setSelectedLot(null)}
          lot={selectedLot}
          projectName={project.name}
          projectSlug={project.slug}
          areaName={project.area?.name}
          projectCompletionDate={project.completionDate}
          projectPaymentPlan={project.paymentPlan}
          fallbackRoi={project.roi}
          lat={project.lat}
          lng={project.lng}
        />
      )}
    </div>
  )
}
