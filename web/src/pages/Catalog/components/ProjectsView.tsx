import { ProjectCard } from '../../../components/ProjectCard'
import { SkeletonCard } from '../../../ui/Skeleton'
import styles from '../Catalog.module.scss'
import type { Property } from '../../../types/property'

interface ProjectsViewProps {
  properties: Property[]
  isLoading: boolean
  error: unknown
}

export default function ProjectsView({ properties, isLoading, error }: ProjectsViewProps) {
  const activeProperties = properties.filter(p => p.status === 'active')

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} imageHeight={180} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Loading error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
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
