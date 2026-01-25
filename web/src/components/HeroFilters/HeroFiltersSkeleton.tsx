import { Skeleton } from '@/ui/Skeleton'
import styles from './HeroFilters.module.scss'

export const HeroFiltersSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.topRow}>
          <div className={styles.selectGroup}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.selectWrapper}>
                <Skeleton variant="rectangular" height={48} />
              </div>
            ))}
          </div>

          <div className={styles.actions} style={{ minWidth: '100px' }}>
            <Skeleton variant="rectangular" height={48} />
            <Skeleton variant="rectangular" height={48} />
          </div>
        </div>
      </div>
    </div>
  )
}
