import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useListDevelopers, useListProjects, type Project } from '../../api'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { ROUTES, getProjectDetailRoute } from '../../constants/routes'
import { NotFound } from '../../ui/NotFound'
import { MapPin, Building2, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../features/Settings/Settings'
import { formatPrice } from '../../utils/format'
import { DeveloperDetailSkeleton } from './DeveloperDetailSkeleton'
import { getImageUrl } from '../../utils/imageUrl'
import styles from './DeveloperDetail.module.scss'

type ProjectWithRelations = Project & {
  badges?: Array<{ name?: string; backgroundColor?: string; textColor?: string; icon?: string }>
}

export default function DeveloperDetail() {
  const { currency } = useSettings()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

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
    return <DeveloperDetailSkeleton />
  }

  if (error || !developer) {
    return (
      <NotFound
        title={t('developerDetail.notFound.title')}
        message={error || t('developerDetail.notFound.description', { slug })}
        backTo={ROUTES.CATALOG}
        backLabel={t('developerDetail.notFound.backToCatalog')}
      />
    )
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>{t('developerDetail.back')}</span>
      </button>

      <section className={styles.heroSection}>
        <div className={styles.developerHeader}>
          {developer.logoUrl && (
            <img src={getImageUrl(developer.logoUrl!, 'thumbnail')} alt={developer.name} className={styles.developerLogo} />
          )}
          <div className={styles.developerInfo}>
            <h1 className={styles.developerName}>{developer.name}</h1>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{projects.length}</span>
            <span className={styles.statLabel}>{t('developerDetail.projects')}</span>
          </div>
        </div>
      </section>

      <section className={styles.projectsSection}>
        <h2>{t('developerDetail.projectsBy', { name: developer.name })}</h2>
        {projects.length === 0 ? (
          <div className={styles.noProjects}>
            <Building2 size={48} />
            <p>{t('developerDetail.noProjects')}</p>
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.map(project => {
              const coverImage = project.media?.cover?.url
              const priceFromUs = project.priceFromUs

              return (
                <div
                  key={project.id}
                  className={styles.projectCard}
                  onClick={() => project.slug && navigate(getProjectDetailRoute(project.slug))}
                >
                  <div className={styles.projectCardImage}>
                    {coverImage ? (
                      <img src={getImageUrl(coverImage, 'card')} alt={project.name} />
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
                    {priceFromUs && (
                      <div className={styles.projectPrice}>
                        <span className={styles.priceLabel}>{t('developerDetail.fromPrice')}</span>
                        <span className={styles.priceValue}>
                          {formatPrice(priceFromUs, currency)}
                        </span>
                      </div>
                    )}
                    <Button variant="primary" size="sm" fullWidth>
                      {t('developerDetail.viewProject')}
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
