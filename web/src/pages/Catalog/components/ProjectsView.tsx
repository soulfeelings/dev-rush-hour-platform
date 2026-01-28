import { type ReactNode } from 'react'
import { Gift, Sofa, Tag, Stamp, Waves, Anchor, Sparkles, Key } from 'lucide-react'
import { ProjectCard, type CardBadge } from '../../../components/ProjectCard'
import { SkeletonCard } from '../../../ui/Skeleton'
import styles from '../Catalog.module.scss'
import type { Property } from '../../../types/property'

// Map icon names from backend to lucide-react components
const iconMap: Record<string, ReactNode> = {
  gift: <Gift size={14} />,
  sofa: <Sofa size={14} />,
  tag: <Tag size={14} />,
  passport: <Stamp size={14} />,
  waves: <Waves size={14} />,
  anchor: <Anchor size={14} />,
  sparkles: <Sparkles size={14} />,
  key: <Key size={14} />,
}

interface ProjectsViewProps {
  panelWidth: number
  screenWidth: number
  getGridColumns: (catalogWidth: number, screenWidth: number) => number
  properties: Property[]
  isLoading: boolean
  error: unknown
}

// Transform property badges to CardBadge format
const propertyBadgesToCardBadges = (property: Property): CardBadge[] => {
  if (!property.badges) return []
  return property.badges.map(badge => ({
    text: badge.name,
    backgroundColor: badge.backgroundColor,
    icon: badge.icon ? iconMap[badge.icon] : undefined,
  }))
}

export default function ProjectsView({
  panelWidth,
  screenWidth,
  getGridColumns,
  properties,
  isLoading,
  error,
}: ProjectsViewProps) {
  const activeProperties = properties.filter(p => p.status === 'active')

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
        <p>Loading error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
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
      {activeProperties.map(property => (
        <ProjectCard
          key={property.id}
          property={property}
          badges={propertyBadgesToCardBadges(property)}
        />
      ))}
    </div>
  )
}
