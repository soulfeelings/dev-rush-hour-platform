import { Skeleton } from '../../ui/Skeleton'
import styles from './ProjectDetail.module.scss'

export function ProjectDetailSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.leftContent}>
        {/* Gallery Skeleton */}
        <div className={styles.mainGallery}>
          <Skeleton variant="rectangular" height={450} className={styles.skeletonGallery} />
          <div className={styles.skeletonThumbnails}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={224} height={155} />
            ))}
          </div>
        </div>

        {/* Header Skeleton */}
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonHeaderTop}>
            <Skeleton variant="circular" width={68} height={68} />
            <div className={styles.skeletonHeaderText}>
              <Skeleton width="60%" height={24} />
              <Skeleton width="35%" height={16} />
              <Skeleton width="25%" height={16} />
            </div>
          </div>
          <div className={styles.skeletonPriceRows}>
            <div className={styles.skeletonPriceRow}>
              <Skeleton width={120} height={18} />
              <Skeleton width={140} height={24} />
            </div>
            <div className={styles.skeletonPriceRow}>
              <Skeleton width={140} height={18} />
              <Skeleton width={140} height={24} />
            </div>
          </div>
          <div className={styles.skeletonFooterRow}>
            <Skeleton width={80} height={18} />
            <Skeleton width={100} height={18} />
          </div>
        </div>

        {/* Description Skeleton */}
        <div className={styles.skeletonDescription}>
          <Skeleton lines={4} />
        </div>

        {/* Cards Skeleton */}
        <div className={styles.skeletonCards}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton variant="rectangular" height={200} />
              <div className={styles.skeletonCardContent}>
                <Skeleton width="70%" height={16} />
                <Skeleton width="40%" height={14} />
                <Skeleton width="50%" height={20} />
                <Skeleton height={40} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rightContent}>
        {/* Media Skeleton (video + map) */}
        <div className={styles.skeletonSidebar}>
          <Skeleton variant="rectangular" className={styles.skeletonSidebarItem} />
          <Skeleton variant="rectangular" className={styles.skeletonSidebarItem} />
        </div>

        {/* Timeline Skeleton */}
        <div className={styles.timelineSection}>
          <Skeleton width="50%" height={20} />
          <div className={styles.timelineCard}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonTimelineItem}>
                <Skeleton variant="circular" width={20} height={20} />
                <div className={styles.skeletonTimelineItemText}>
                  <Skeleton width={140} height={14} />
                  <Skeleton width={90} height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
