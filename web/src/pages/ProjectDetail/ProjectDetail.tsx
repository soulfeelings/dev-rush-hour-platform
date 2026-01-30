import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createPropertyMarkerIcon } from '../../components/PropertyMap/markerIcon'
import { developerLogos } from '../../data/mockProperties'
import ProjectFeatures from '../../components/ProjectFeatures'
import Model3DViewer from '../../components/Model3DViewer'
import FloorPlanTable from '../../components/FloorPlanTable'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { YouTubePreview } from '../../ui/YouTubePreview'
import { useGetProject, useListLots } from '../../api'
import type { Project, Lot, Developer, Area, Badge as BadgeType } from '../../api'
import { IconBed, IconBath, IconArea } from '../../components/icons'
import { ROUTES, getLotDetailRoute } from '../../constants/routes'
import { Heart, MapPin, Building2, Check } from 'lucide-react'
import styles from './ProjectDetail.module.scss'

const MAP_ZOOM_DEFAULT = 13

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

type ProjectWithRelations = Project & {
  developer?: Developer
  area?: Area
  badges?: BadgeType[]
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
    expectedCompletion?: string
  }
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

const formatPrice = (price: number | undefined, currency = 'AED') => {
  if (price === undefined) return '-'
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M ${currency}`
  }
  return `${price.toLocaleString()} ${currency}`
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [is3DModalOpen, setIs3DModalOpen] = useState(false)
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
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

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const developerLogoUrl =
    (project.developer?.data as { logoUrl?: string } | undefined)?.logoUrl ||
    developerLogos[project.developer?.name || '']

  const description =
    typeof projectDataFields?.description === 'string'
      ? projectDataFields.description
      : projectDataFields?.description
        ? JSON.stringify(projectDataFields.description)
        : null

  const timeline = projectDataFields?.timeline

  const timelineItems = [
    { label: 'Project announcement', date: timeline?.projectAnnouncement },
    { label: 'Booking started', date: timeline?.bookingStarted },
    { label: 'Construction started', date: timeline?.constructionStarted },
    { label: 'Construction progress', date: timeline?.constructionProgress },
    { label: 'Expected completion', date: timeline?.expectedCompletion },
  ].filter(item => item.date)

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.mainGallery}>
          <div className={styles.galleryContainer}>
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
              {allImages.slice(0, 5).map((url, idx) => (
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

        <div className={styles.mediaSidebar}>
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
              <div className={styles.mapOverlay}>
                <MapPin size={20} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Project Header */}
      <section className={styles.projectHeader}>
        <div className={styles.developerInfo}>
          {developerLogoUrl && (
            <img
              src={developerLogoUrl}
              alt={project.developer?.name}
              className={styles.developerLogo}
            />
          )}
          <div className={styles.projectTitle}>
            <h1>{project.name}</h1>
            <div className={styles.projectLocation}>
              <MapPin size={16} />
              <span>{project.area?.name || 'Dubai'}</span>
            </div>
          </div>
        </div>
        <div className={styles.badgesRow}>
          {project.badges?.map(badge => (
            <Badge
              key={badge.id}
              text={badge.name || ''}
              backgroundColor={badge.backgroundColor || '#000'}
              textColor={badge.textColor || '#fff'}
              iconName={badge.icon || undefined}
            />
          ))}
        </div>
      </section>

      {/* Info + Timeline Section */}
      <section className={styles.infoSection}>
        <div className={styles.projectInfo}>
          <div className={styles.priceBlock}>
            <div className={styles.ourPrice}>
              <span className={styles.priceLabel}>Our price</span>
              <span className={styles.priceDiscount}>-3%</span>
              <span className={styles.priceValue}>
                {formatPrice(projectDataFields?.specs?.priceFrom)}
              </span>
            </div>
            <div className={styles.developerPrice}>
              <span className={styles.priceLabel}>Developer price</span>
              <span className={styles.priceValueStrike}>
                {formatPrice(
                  projectDataFields?.specs?.priceFrom
                    ? Math.round(projectDataFields.specs.priceFrom * 1.03)
                    : undefined
                )}
              </span>
            </div>
          </div>
          {projectDataFields?.specs?.handoverDate && (
            <div className={styles.handoverInfo}>
              <span className={styles.handoverLabel}>PP</span>
              <span className={styles.handoverDate}>{projectDataFields.specs.handoverDate}</span>
            </div>
          )}
        </div>

        {timelineItems.length > 0 && (
          <div className={styles.projectTimeline}>
            <h3>Project timeline</h3>
            <div className={styles.timelineList}>
              {timelineItems.map((item, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineDot}>
                    <Check size={12} />
                  </div>
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>{item.label}</span>
                    <span className={styles.timelineDate}>{formatDate(item.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Description Section */}
      {description && (
        <section className={styles.descriptionSection}>
          <p className={isDescriptionExpanded ? styles.expanded : styles.collapsed}>
            {description}
          </p>
          {description.length > 300 && (
            <button
              className={styles.seeMoreBtn}
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              {isDescriptionExpanded ? 'See less' : 'See more'}
            </button>
          )}
        </section>
      )}

      {/* Infrastructure Section */}
      {projectDataFields?.featuresAmenities && projectDataFields.featuresAmenities.length > 0 && (
        <section className={styles.infrastructureSection}>
          <h2>Residential complex infrastructure</h2>
          <ProjectFeatures
            features={projectDataFields.featuresAmenities as string[]}
            maxItems={12}
          />
        </section>
      )}

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <Button onClick={() => setIs3DModalOpen(true)} variant="primary" size="lg">
          View Apartments in 3D
        </Button>
        <Button onClick={() => setIsFloorPlanModalOpen(true)} variant="secondary" size="lg">
          View Building Plan
        </Button>
      </div>

      {/* Apartments Sections by Bedroom Count */}
      {groupedLots.map(group => (
        <section key={group.bedrooms} className={styles.apartmentsSection}>
          <div className={styles.apartmentsHeader}>
            <h2>Apartments</h2>
            <div className={styles.apartmentsStats}>
              <span>{group.bedrooms} beds</span>
              <span className={styles.statDivider}>|</span>
              <span>from {formatPrice(group.minPrice === Infinity ? 0 : group.minPrice)}</span>
              <span className={styles.statDivider}>|</span>
              <span>{group.totalUnits} units</span>
              <span className={styles.statDivider}>|</span>
              <span>
                {group.minArea === Infinity
                  ? '-'
                  : group.minArea === group.maxArea
                    ? `${group.minArea} m²`
                    : `${group.minArea}-${group.maxArea} m²`}
              </span>
            </div>
            <button className={styles.viewAllBtn}>View the grid</button>
          </div>

          <div className={styles.apartmentsScroll}>
            {group.lots.map((lot, index) => {
              const lotCoverImage = (
                lot.data as { media?: { cover?: { url?: string } } } | undefined
              )?.media?.cover?.url
              const lotFloorPlan = (
                lot.data as { media?: { floorPlanImages?: { url?: string }[] } } | undefined
              )?.media?.floorPlanImages?.[0]?.url
              const lotTags = (lot.data as { tags?: string[] } | undefined)?.tags || []

              return (
                <div
                  key={lot.id || index}
                  className={styles.apartmentCard}
                  onClick={() => lot.id && navigate(getLotDetailRoute(lot.id))}
                >
                  <div className={styles.apartmentCardImage}>
                    {lotFloorPlan || lotCoverImage ? (
                      <img
                        src={lotFloorPlan || lotCoverImage}
                        alt={`${lot.type} floor plan`}
                        className={styles.apartmentCardImg}
                      />
                    ) : (
                      <div className={styles.apartmentCardPlaceholder}>
                        <Building2 size={48} />
                      </div>
                    )}
                    <div className={styles.apartmentCardTags}>
                      {lotTags.slice(0, 2).map((tag, i) => (
                        <span key={i} className={styles.apartmentTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      className={styles.favoriteBtn}
                      onClick={e => {
                        e.stopPropagation()
                      }}
                    >
                      <Heart size={20} />
                    </button>
                  </div>

                  <div className={styles.apartmentCardContent}>
                    <h3 className={styles.apartmentCardTitle}>
                      {project.name} - {lot.bedrooms} Bedrooms {lot.type}
                    </h3>

                    <div className={styles.apartmentCardBadges}>
                      <span className={styles.buildingBadge}>
                        <Building2 size={14} />
                        Building
                      </span>
                      <span className={styles.roiBadge}>ROI 7%</span>
                    </div>

                    <div className={styles.apartmentCardPrices}>
                      <div className={styles.apartmentOurPrice}>
                        <span>Our price</span>
                        <span className={styles.discountTag}>-3%</span>
                        <span className={styles.priceAmount}>
                          {formatPrice(lot.priceAmount, lot.priceCurrency)}
                        </span>
                      </div>
                      <div className={styles.apartmentDevPrice}>
                        <span>Developer price</span>
                        <span className={styles.priceAmountStrike}>
                          {formatPrice(
                            lot.priceAmount ? Math.round(lot.priceAmount * 1.03) : undefined,
                            lot.priceCurrency
                          )}
                        </span>
                      </div>
                    </div>

                    <div className={styles.apartmentCardSpecs}>
                      <span>Apartments</span>
                      <span>
                        <IconBed /> {lot.bedrooms ?? '-'}
                      </span>
                      <span>
                        <IconBath /> {lot.bathrooms ?? '-'}
                      </span>
                      <span>
                        <IconArea /> {lot.areaSqm ?? '-'} m²
                      </span>
                    </div>

                    <Button variant="primary" size="md" fullWidth className={styles.whatsappBtn}>
                      Get Details on WhatsApp
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

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
