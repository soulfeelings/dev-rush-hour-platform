import { Skeleton } from '../../ui/Skeleton'
import styles from './LotDetail.module.scss'

export function LotDetailSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <Skeleton width={60} height={14} />
        <Skeleton width={140} height={18} />
        <Skeleton width="40%" height={32} />
      </div>

      {/* Content Grid Skeleton */}
      <div className={styles.content}>
        {/* Left: Image + Features */}
        <div className={styles.imageSection}>
          <Skeleton variant="rectangular" className={styles.skeletonGallery} />
          <div className={styles.skeletonContentCard}>
            <Skeleton width="30%" height={20} />
            <div className={styles.skeletonFeatureRow}>
              <Skeleton
                variant="rectangular"
                width={40}
                height={40}
                className={styles.skeletonFeatureIcon}
              />
              <Skeleton width={100} height={16} />
            </div>
            <Skeleton width="25%" height={20} />
            <Skeleton width="60%" height={16} />
          </div>
          <div className={styles.skeletonMapCard}>
            <div className={styles.skeletonMapHeader}>
              <div>
                <Skeleton width={140} height={18} />
                <Skeleton width={120} height={14} />
              </div>
              <Skeleton width={100} height={14} />
            </div>
            <Skeleton variant="rectangular" className={styles.skeletonMap} />
          </div>
        </div>

        {/* Right: Info Card */}
        <div className={styles.infoSection}>
          <div className={styles.skeletonInfoCard}>
            <Skeleton width="50%" height={22} />
            <div className={styles.skeletonInfoRows}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonInfoRow}>
                  <Skeleton width={90} height={14} />
                  <Skeleton width={80} height={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
