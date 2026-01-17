import { useMemo } from 'react'
import { useListProjects } from '../../../api'
import { apiProjectsToProperties } from '../../../utils/apiAdapters'
import ProjectCard from '../../../components/ProjectCard'
import { SkeletonCard } from '../../../ui/Skeleton'
import styles from '../Catalog.module.scss'

interface ProjectsViewProps {
  panelWidth: number
  screenWidth: number
  onFavoriteClick: (propertyId: string) => void
  getGridColumns: (catalogWidth: number, screenWidth: number) => number
  enabled?: boolean
}

export default function ProjectsView({
  panelWidth,
  screenWidth,
  onFavoriteClick,
  getGridColumns,
  enabled = true,
}: ProjectsViewProps) {
  const {
    data: projectsData,
    isLoading,
    error,
  } = useListProjects(
    {},
    {
      query: {
        enabled,
      },
    }
  )

  const projects = useMemo(() => {
    if (!projectsData) return []
    return apiProjectsToProperties(projectsData)
  }, [projectsData])

  const activeProperties = projects.filter(p => p.status === 'active')
  const regularProperties = activeProperties.filter(p => !p.isFeatured)

  if (isLoading) {
    return (
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${getGridColumns(100 - panelWidth, screenWidth)}, 1fr)`,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} imageHeight={180} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Ошибка загрузки: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    )
  }

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${getGridColumns(100 - panelWidth, screenWidth)}, 1fr)`,
      }}
    >
      {regularProperties.map(property => (
        <ProjectCard key={property.id} property={property} onFavoriteClick={onFavoriteClick} />
      ))}
    </div>
  )
}
