import { useTranslation } from 'react-i18next'
import { ProjectCard } from '../../../components/ProjectCard'
import { ProjectsViewSkeleton } from './ProjectsViewSkeleton'
import styles from '../Catalog.module.scss'
import type { Property } from '../../../types/property'

interface ProjectsViewProps {
  properties: Property[]
  isLoading: boolean
  error: unknown
}

export default function ProjectsView({ properties, isLoading, error }: ProjectsViewProps) {
  const { t } = useTranslation()
  const activeProperties = properties.filter(p => p.status === 'active')

  if (isLoading) {
    return <ProjectsViewSkeleton />
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>
          {t('error.loadingError', {
            message: error instanceof Error ? error.message : t('error.unknownError'),
          })}
        </p>
        <button onClick={() => window.location.reload()}>{t('error.retry')}</button>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {activeProperties.map(property => (
        <ProjectCard key={property.id} property={property} />
      ))}
    </div>
  )
}
