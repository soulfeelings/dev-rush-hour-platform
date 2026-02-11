import { Skeleton } from '../../../ui/Skeleton'
import styles from '../Catalog.module.scss'

export function ProjectsViewSkeleton() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonProjectCard}>
          <div className={styles.skeletonProjectCardInner}>
            <Skeleton variant="rectangular" className={styles.skeletonProjectImage} />
            <div className={styles.skeletonProjectInfo}>
              <div className={styles.skeletonProjectHeader}>
                <Skeleton variant="circular" width={48} height={48} />
                <div className={styles.skeletonProjectName}>
                  <Skeleton width="70%" height={18} />
                  <Skeleton width="50%" height={14} />
                  <Skeleton width="40%" height={14} />
                </div>
              </div>
              <div className={styles.skeletonProjectPrices}>
                <div className={styles.skeletonProjectPriceRow}>
                  <Skeleton width={100} height={14} />
                  <Skeleton width={90} height={18} />
                </div>
                <div className={styles.skeletonProjectPriceRow}>
                  <Skeleton width={120} height={14} />
                  <Skeleton width={90} height={18} />
                </div>
              </div>
              <div className={styles.skeletonProjectFooter}>
                <Skeleton width={60} height={14} />
                <Skeleton width={80} height={14} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
