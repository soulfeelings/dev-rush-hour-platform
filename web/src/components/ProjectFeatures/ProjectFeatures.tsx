import { useState } from 'react'
import { InfrastructureTag } from '../../ui/InfrastructureTag'
import styles from './ProjectFeatures.module.scss'

type FeatureItem = {
  name: string
  icon?: string
}

interface ProjectFeaturesProps {
  features: (string | FeatureItem)[]
  maxItems?: number
}

const normalizeFeature = (feature: string | FeatureItem): FeatureItem => {
  if (typeof feature === 'string') return { name: feature }
  return feature
}

export default function ProjectFeatures({ features, maxItems = 6 }: ProjectFeaturesProps) {
  const [showAll, setShowAll] = useState(false)

  if (!features || features.length === 0) {
    return null
  }

  const items = features.map(normalizeFeature)
  const displayedItems = showAll ? items : items.slice(0, maxItems)
  const hasMore = items.length > maxItems

  return (
    <div className={styles.infrastructureContainer}>
      <h3 className={styles.title}>Residential complex infrastructure</h3>
      <div className={styles.infrastructureGrid}>
        {displayedItems.map((item, index) => (
          <InfrastructureTag key={`${item.name}-${index}`} name={item.name} iconName={item.icon} />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          className={styles.showMoreButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `Show ${items.length - maxItems} More`}
        </button>
      )}
    </div>
  )
}
