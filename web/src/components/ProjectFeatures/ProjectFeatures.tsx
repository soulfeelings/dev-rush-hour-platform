import { useState } from 'react'
import { Package } from 'lucide-react'
import { AVAILABLE_INFRASTRUCTURE_ICONS } from '../../utils/infrastructureIcons'
import styles from './ProjectFeatures.module.scss'

type FeatureItem = {
  name: string
  icon?: string
}

interface ProjectFeaturesProps {
  features: (string | FeatureItem)[]
  maxItems?: number
}

const iconComponentMap = new Map(
  AVAILABLE_INFRASTRUCTURE_ICONS.map(({ name, component }) => [name, component])
)

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
    <div className={styles.featuresContainer}>
      <h3 className={styles.title}>Features & Amenities</h3>
      <div className={styles.featuresGrid}>
        {displayedItems.map((item, index) => {
          const IconComponent = item.icon ? iconComponentMap.get(item.icon) : undefined
          return (
            <div key={`${item.name}-${index}`} className={styles.featureItem}>
              <div className={styles.iconWrapper}>
                {IconComponent ? <IconComponent size={20} /> : <Package size={20} />}
              </div>
              <span className={styles.featureText}>{item.name}</span>
            </div>
          )
        })}
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
