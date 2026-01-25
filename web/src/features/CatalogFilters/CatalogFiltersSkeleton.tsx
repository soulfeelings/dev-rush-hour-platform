import { Skeleton } from '@/ui'
import styles from './CatalogFilters.module.scss'

export const CatalogFiltersSkeleton = () => {
  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.filtersBar}>
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonRow}>
            <Skeleton variant="circular" width={100} height={26} />
            <Skeleton variant="circular" width={100} height={26} />
            <Skeleton variant="circular" width={100} height={26} />
            <Skeleton variant="circular" width={100} height={26} />
            <Skeleton variant="circular" width={100} height={26} />
          </div>
          <Skeleton variant="circular" width={100} height={26} />
        </div>
      </div>
    </div>
  )
}
