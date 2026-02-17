import { Skeleton } from '@/ui/Skeleton'
import styles from './HeroFilters.module.scss'

export const HeroFiltersSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.filterGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.selectPlaceholder}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </div>
        ))}
        <div className={styles.buttonPlaceholder}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i + 3} className={styles.selectPlaceholder}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </div>
        ))}
        <div className={styles.buttonPlaceholder}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </div>
      </div>
    </div>
  )
}
