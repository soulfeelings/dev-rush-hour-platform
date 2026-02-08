import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useListDevelopers, useListProjects, type Project } from '../../api'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { ROUTES, getProjectDetailRoute } from '../../constants/routes'
import { MapPin, Building2, ArrowLeft } from 'lucide-react'
import styles from './DeveloperDetail.module.scss'

type DeveloperDataFields = {
  logoUrl?: string
  description?: string
  website?: string
  foundedYear?: number
  headquarters?: string
}

type ProjectWithRelations = Project & {
  badges?: Array<{ name?: string; backgroundColor?: string; textColor?: string; icon?: string }>
}

const formatPrice = (price: number | undefined, currency = 'AED') => {
  if (price === undefined) return '-'
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M ${currency}`
  }
  return `${price.toLocaleString()} ${currency}`
}

export default function DeveloperDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const {
    data: developersData,
    isLoading: developersLoading,
    error: developersError,
  } = useListDevelopers({
    query: { enabled: !!slug },
  })

  const developer = useMemo(() => {
    if (!developersData || !slug) return null
    return developersData.find(d => d.slug === slug) || null
  }, [developersData, slug])

  const { data: projectsData, isLoading: projectsLoading } = useListProjects(
    { developer: slug },
    {
      query: { enabled: !!slug },
    }
  )

  const projects = (projectsData || []) as ProjectWithRelations[]
  const loading = developersLoading || projectsLoading
  const error = developersError instanceof Error ? developersError.message : null

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (error || !developer) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Developer Not Found</h1>
          <p>{error || `Developer "${slug}" does not exist.`}</p>
          <Link to={ROUTES.CATALOG} className={styles.backLink}>
            Return to Catalog
          </Link>
        </div>
      </div>
    )
  }

  const developerData = developer.data as DeveloperDataFields | undefined

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <section className={styles.heroSection}>
        <div className={styles.developerHeader}>
          {developerData?.logoUrl && (
            <img
              src={developerData.logoUrl}
              alt={developer.name}
              className={styles.developerLogo}
            />
          )}
          <div className={styles.developerInfo}>
            <h1 className={styles.developerName}>{developer.name}</h1>
            {developerData?.headquarters && (
              <div className={styles.location}>
                <MapPin size={16} />
                <span>{developerData.headquarters}</span>
              </div>
            )}
            {developerData?.foundedYear && (
              <p className={styles.founded}>Founded in {developerData.foundedYear}</p>
            )}
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{projects.length}</span>
            <span className={styles.statLabel}>Projects</span>
          </div>
          {developerData?.website && (
            <a
              href={developerData.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteLink}
            >
              Visit Website
            </a>
          )}
        </div>
      </section>

      {developerData?.description && (
        <section className={styles.descriptionSection}>
          <h2>About {developer.name}</h2>
          <p>{developerData.description}</p>
        </section>
      )}

      <section className={styles.projectsSection}>
        <h2>Projects by {developer.name}</h2>
        {projects.length === 0 ? (
          <div className={styles.noProjects}>
            <Building2 size={48} />
            <p>No projects available</p>
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.map(project => {
              const coverImage = project.data?.media?.cover?.url
              const priceFrom = (project.data as { specs?: { priceFrom?: number } })?.specs
                ?.priceFrom

              return (
                <div
                  key={project.id}
                  className={styles.projectCard}
                  onClick={() => project.slug && navigate(getProjectDetailRoute(project.slug))}
                >
                  <div className={styles.projectCardImage}>
                    {coverImage ? (
                      <img src={coverImage} alt={project.name} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <Building2 size={48} />
                      </div>
                    )}
                    {project.badges?.[0] && (
                      <div className={styles.badgeWrapper}>
                        <Badge
                          text={project.badges[0].name || ''}
                          backgroundColor={project.badges[0].backgroundColor || '#000'}
                          textColor={project.badges[0].textColor || '#fff'}
                          iconName={project.badges[0].icon || undefined}
                          iconColor={project.badges[0].iconColor}
                        />
                      </div>
                    )}
                  </div>
                  <div className={styles.projectCardContent}>
                    <h3>{project.name}</h3>
                    <div className={styles.projectLocation}>
                      <MapPin size={14} />
                      <span>
                        {(project as Project & { area?: { name?: string } }).area?.name || 'Dubai'}
                      </span>
                    </div>
                    {priceFrom && (
                      <div className={styles.projectPrice}>
                        <span className={styles.priceLabel}>From</span>
                        <span className={styles.priceValue}>{formatPrice(priceFrom)}</span>
                      </div>
                    )}
                    <Button variant="primary" size="sm" fullWidth>
                      View Project
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
