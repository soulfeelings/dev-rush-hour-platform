import { useTranslation } from 'react-i18next'
import { ProjectCard } from '../../../components/ProjectCard'
import { ProjectsViewSkeleton } from './ProjectsViewSkeleton'
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
      {activeProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
