import { Skeleton } from '../../../ui/Skeleton'
import styles from '../Catalog.module.scss'

export function LotsViewSkeleton() {
  return (
    <div className={styles.lotsGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skeletonLotCard}>
          <Skeleton variant="rectangular" className={styles.skeletonLotPhoto} />
          <div className={styles.skeletonLotInfo}>
            <div className={styles.skeletonLotHeader}>
              <Skeleton variant="circular" width={40} height={40} />
              <div className={styles.skeletonLotHeaderText}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={13} />
              </div>
            </div>
            <div className={styles.skeletonLotSpecs}>
              <Skeleton width={70} height={14} />
              <Skeleton width={70} height={14} />
              <Skeleton width={70} height={14} />
              <Skeleton width={70} height={14} />
            </div>
            <div className={styles.skeletonLotPrices}>
              <div className={styles.skeletonLotPriceRow}>
                <Skeleton width={90} height={13} />
                <Skeleton width={100} height={16} />
              </div>
              <div className={styles.skeletonLotPriceRow}>
                <Skeleton width={110} height={13} />
                <Skeleton width={100} height={16} />
              </div>
            </div>
            <Skeleton width="100%" height={36} className={styles.skeletonLotButton} />
          </div>
        </div>
      ))}
    </div>
  )
}
