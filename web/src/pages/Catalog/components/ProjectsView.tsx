import { useTranslation } from 'react-i18next'
import { ProjectCard } from '../../../components/ProjectCard'
import { ProjectsViewSkeleton } from './ProjectsViewSkeleton'
import { ErrorState } from '../../../ui'
import styles from '../Catalog.module.scss'
import type { Project } from '../../../api/generated/schemas/project'

interface ProjectsViewProps {
  projects: Project[]
  isLoading: boolean
  error: unknown
}

export default function ProjectsView({ projects, isLoading, error }: ProjectsViewProps) {
  const { t } = useTranslation()
  const activeProjects = projects.filter(p => p.status === 'active')

  if (isLoading) {
    return <ProjectsViewSkeleton />
  }

  if (error) {
    const msg = error instanceof Error ? error.message : undefined
    return (
      <ErrorState
        title={t(msg?.toLowerCase().includes('fetch') ? 'error.titleNetwork' : 'error.title')}
        message={t('error.loadingError', { message: msg || t('error.unknownError') })}
        onRetry={() => window.location.reload()}
        retryLabel={t('error.retry')}
      />
    )
  }

  return (
    <div className={styles.grid}>
      {activeProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
