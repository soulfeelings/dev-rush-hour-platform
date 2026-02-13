import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InfrastructureTag } from '../../ui/InfrastructureTag'
import { Typography } from '../../ui/Typography'
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
  const { t } = useTranslation()

  if (!features || features.length === 0) {
    return null
  }

  const items = features.map(normalizeFeature)
  const displayedItems = showAll ? items : items.slice(0, maxItems)
  const hasMore = items.length > maxItems

  return (
    <div className={styles.infrastructureContainer}>
      <Typography variant="h1" weight="medium" className={styles.title}>{t('projectFeatures.title')}</Typography>
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
          {showAll
            ? t('projectFeatures.showLess')
            : t('projectFeatures.showMore', { count: items.length - maxItems })}
        </button>
      )}
    </div>
  )
}
