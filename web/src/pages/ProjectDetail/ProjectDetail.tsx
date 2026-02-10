import { useParams, Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
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
import { ROUTES } from '../../constants/routes'
import {
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react'
import { useSettings } from '../../features/Settings/Settings'
import { formatPrice, formatArea } from '../../utils/format'
import { mockProject, mockLots } from './mockData'
import { ApartmentsCarousel } from './ApartmentsCarousel'
import { ApartmentCard } from './ApartmentCard'
import { ProjectDetailSkeleton } from './ProjectDetailSkeleton'
import styles from './ProjectDetail.module.scss'

const MAP_ZOOM_DEFAULT = 13

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

type ProjectDataFields = {
  description?: string | Record<string, string>
  featuresAmenities?: string[]
  specs?: { priceFrom?: number; currency?: string; handoverDate?: string }
  youtubeUrl?: string
  timeline?: {
    projectAnnouncement?: string
    bookingStarted?: string
    constructionStarted?: string
    constructionProgress?: string
    constructionProgressPercent?: number
    expectedCompletion?: string
  }
  roi?: number
  ourPrice?: number
  developerPrice?: number
  paymentPlan?: string
  completionDate?: string
}

interface LotGroup {
  bedrooms: number
  lots: Lot[]
  minPrice: number
  totalUnits: number
  minArea: number
  maxArea: number
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ProjectDetail() {
  const { currency, unit } = useSettings()
  const { slug } = useParams<{ slug: string }>()
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [mapContainerEl, setMapContainerEl] = useState<HTMLDivElement | null>(null)

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
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

  // TODO: restore API calls when done with UI work
  // const {
  //   data: projectData,
  //   isLoading: projectLoading,
  //   error: projectError,
  // } = useGetProject(slug || '', undefined, {
  //   query: {
  //     enabled: !!slug,
  //   },
  // })
  //
  // const { data: lotsData, isLoading: lotsLoading } = useListLots(
  //   { project: slug || '' },
  //   {
  //     query: {
  //       enabled: !!slug,
  //     },
  //   }
  // )
  //
  // const project = (projectData as ProjectWithRelations | undefined) || null
  // const lots: Lot[] = lotsData?.items || []

  const project = mockProject as unknown as ProjectWithRelations
  const lots: Lot[] = mockLots

  const groupedLots = useMemo<LotGroup[]>(() => {
    const groups: Record<number, LotGroup> = {}

    lots.forEach(lot => {
      const bedrooms = lot.bedrooms ?? 0
      if (!groups[bedrooms]) {
        groups[bedrooms] = {
          bedrooms,
          lots: [],
          minPrice: Infinity,
          totalUnits: 0,
          minArea: Infinity,
          maxArea: 0,
        }
      }
      groups[bedrooms].lots.push(lot)
      groups[bedrooms].totalUnits++
      if (lot.priceAmount && lot.priceAmount < groups[bedrooms].minPrice) {
        groups[bedrooms].minPrice = lot.priceAmount
      }
      if (lot.areaSqm) {
        if (lot.areaSqm < groups[bedrooms].minArea) groups[bedrooms].minArea = lot.areaSqm
        if (lot.areaSqm > groups[bedrooms].maxArea) groups[bedrooms].maxArea = lot.areaSqm
      }
    })

    return Object.values(groups).sort((a, b) => a.bedrooms - b.bedrooms)
  }, [lots])

  const loading = false
  const error = null

  const hasCoordinates =
    project?.lat !== undefined &&
    project?.lng !== undefined &&
    project.lat !== null &&
    project.lng !== null

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

  if (loading) {
    return <ProjectDetailSkeleton />
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Property Not Found</h1>
          <p>{error || `Property "${slug}" does not exist.`}</p>
          <Link to={ROUTES.CATALOG} className={styles.backLink}>
            Return to Catalog
          </Link>
        </div>
      </div>
    )
  }

  const projectDataFields = project.data as ProjectDataFields | undefined

  const allImages = [
    ...(project.data?.media?.cover?.url ? [project.data.media.cover.url] : []),
    ...(project.data?.media?.gallery
      ?.map(img => img.url)
      .filter((url): url is string => Boolean(url)) || []),
  ]

  const projectLogoUrl = project.data?.media?.logo?.url
  const developerLogoUrl =
    project.developer?.logoUrl || developerLogos[project.developer?.name || '']
  const displayLogoUrl = projectLogoUrl || developerLogoUrl

  const description =
    typeof projectDataFields?.description === 'string'
      ? projectDataFields.description
      : projectDataFields?.description
        ? JSON.stringify(projectDataFields.description)
        : null

  const timeline = projectDataFields?.timeline
  const { firstPart: completionFirstPart, rest: completionRest } = splitCompletionDate(
    projectDataFields?.completionDate
  )

  const timelineItems = timeline
    ? [
        {
          label: 'Project announcement',
          value: timeline.projectAnnouncement
            ? formatDate(timeline.projectAnnouncement)
            : undefined,
          completed: !!timeline.projectAnnouncement,
        },
        {
          label: 'Booking started',
          value: timeline.bookingStarted ? formatDate(timeline.bookingStarted) : undefined,
          completed: !!timeline.bookingStarted,
        },
        {
          label: 'Construction started',
          value: timeline.constructionStarted
            ? formatDate(timeline.constructionStarted)
            : undefined,
          completed: !!timeline.constructionStarted,
        },
        {
          label: 'Construction progress',
          value:
            timeline.constructionProgressPercent != null
              ? `${timeline.constructionProgressPercent}%`
              : undefined,
          completed: !!timeline.constructionProgress,
        },
        {
          label: 'Expected completion',
          value: timeline.expectedCompletion ? formatDate(timeline.expectedCompletion) : undefined,
          completed: false,
        },
      ]
    : []

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
                          src={url}
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
                      <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      className={`${styles.navButton} ${styles.nextButton}`}
                      onClick={scrollNext}
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} strokeWidth={2.5} />
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
                <span>Project Image</span>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className={styles.thumbnailRow}>
              {allImages.map((url, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumbnailWrapper} ${
                    idx === selectedIndex ? styles.activeThumbnail : ''
                  }`}
                  onClick={() => scrollTo(idx, true)}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className={styles.thumbnailImage} />
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
                    src={displayLogoUrl}
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
            {projectDataFields?.roi && <RoiBadge value={projectDataFields.roi} />}
          </div>

          {(projectDataFields?.ourPrice || projectDataFields?.developerPrice) && (
            <div className={styles.priceRows}>
              {projectDataFields?.ourPrice && projectDataFields?.developerPrice && (
                <div className={styles.ourPriceRow}>
                  <div className={styles.priceLabelContainer}>
                    <Typography size="large" weight="medium" className={styles.priceLabel}>
                      Our price:
                    </Typography>
                    {projectDataFields.developerPrice > projectDataFields.ourPrice && (
                      <span className={styles.discountBadge}>
                        -
                        {Math.round(
                          (1 - projectDataFields.ourPrice / projectDataFields.developerPrice) * 100
                        )}
                        %
                      </span>
                    )}
                  </div>
                  <div className={styles.priceValue}>
                    <Typography className={styles.priceFrom}>from</Typography>{' '}
                    <Typography variant="h1" className={styles.priceAmount}>
                      {formatPrice(projectDataFields.ourPrice, currency)}
                    </Typography>
                  </div>
                </div>
              )}
              {projectDataFields?.developerPrice && (
                <div className={styles.developerPriceRow}>
                  <Typography size="large" weight="medium" className={styles.priceLabel}>
                    Developer price:
                  </Typography>
                  <div className={styles.priceValue}>
                    <Typography className={styles.priceFrom}>from</Typography>{' '}
                    <Typography variant="h1" className={styles.priceAmount}>
                      {formatPrice(projectDataFields.developerPrice, currency)}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          )}

          {(completionFirstPart || projectDataFields?.paymentPlan) && (
            <div className={styles.headerBottom}>
              {completionFirstPart && (
                <Typography size="large" className={styles.dateValue}>
                  <span className={styles.quarter}>{completionFirstPart}</span>
                  {completionRest && <span className={styles.year}> {completionRest}</span>}
                </Typography>
              )}
              {projectDataFields?.paymentPlan && (
                <Typography size="large" weight="medium" className={styles.planValue}>
                  <span className={styles.planLabel}>PP:</span>{' '}
                  <span className={styles.planNumbers}>{projectDataFields.paymentPlan}</span>
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
                <span>{isDescriptionExpanded ? 'See less' : 'See more'}</span>
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
        {groupedLots.length > 0 && (
          <Typography variant="h1" className={styles.allUnitsLabel}>
            All Units
          </Typography>
        )}
        {groupedLots.map(group => (
          <section key={group.bedrooms} className={styles.apartmentsSection}>
            <div className={styles.apartmentsHeader}>
              <div className={styles.apartmentsHeaderTop}>
                <Typography variant="h1">Apartments</Typography>
                <button className={styles.viewAllBtn}>
                  <Typography variant="body" size="small" weight="regular">
                    View the grid
                  </Typography>
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className={styles.apartmentsStats}>
                <span>{group.bedrooms} beds</span>
                <span className={styles.statDivider} />
                <span>
                  from {formatPrice(group.minPrice === Infinity ? 0 : group.minPrice, currency)}
                </span>
                <span className={styles.statDivider} />
                <span>{group.totalUnits} units</span>
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
                  areaName={project.area?.name}
                  roi={projectDataFields?.roi}
                  ourPrice={projectDataFields?.ourPrice}
                  developerPrice={projectDataFields?.developerPrice}
                />
              ))}
            </ApartmentsCarousel>
          </section>
        ))}
      </div>

      <div className={styles.rightContent}>
        {projectDataFields?.youtubeUrl && (
          <YouTubePreview
            url={projectDataFields.youtubeUrl}
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
          </div>
        )}

        {/* Project Timeline */}
        {timelineItems.length > 0 && (
          <div className={styles.timelineSection}>
            <h2>Project timeline</h2>
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
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        open={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        title="3D Apartment Model"
        className="wide transparent"
      >
        <Model3DViewer embedded />
      </Modal>

      <Modal
        open={isFloorPlanModalOpen}
        onClose={() => setIsFloorPlanModalOpen(false)}
        title="Building Plan"
        size="large"
      >
        {lots.length > 0 ? (
          <FloorPlanTable lots={lots} />
        ) : (
          <div
            style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}
          >
            No apartments available
          </div>
        )}
      </Modal>
    </div>
  )
}
