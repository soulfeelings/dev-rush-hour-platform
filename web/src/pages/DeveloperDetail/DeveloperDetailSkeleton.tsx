import { Skeleton } from '../../ui/Skeleton'
import styles from './DeveloperDetail.module.scss'

export function DeveloperDetailSkeleton() {
  return (
    <div className={styles.container}>
      <Skeleton width={80} height={16} />

      <div className={styles.skeletonHero}>
        <div className={styles.skeletonDeveloperHeader}>
          <Skeleton
            variant="rectangular"
            width={120}
            height={120}
            className={styles.skeletonLogo}
          />
          <div className={styles.skeletonDeveloperInfo}>
            <Skeleton width="50%" height={32} />
            <Skeleton width="30%" height={18} />
            <Skeleton width="25%" height={16} />
          </div>
        </div>
        <div className={styles.skeletonStatsRow}>
          <div>
            <Skeleton width={60} height={32} />
            <Skeleton width={60} height={14} />
          </div>
          <Skeleton
            variant="rectangular"
            width={140}
            height={44}
            className={styles.skeletonButton}
          />
        </div>
      </div>

      <div className={styles.skeletonDescription}>
        <Skeleton width="40%" height={20} />
        <div className={styles.skeletonDescriptionLines}>
          <Skeleton lines={4} />
        </div>
      </div>

      <div className={styles.skeletonProjectsHeader}>
        <Skeleton width="35%" height={24} />
      </div>
      <div className={styles.projectsGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.skeletonProjectCard}>
            <Skeleton variant="rectangular" className={styles.skeletonProjectImage} />
            <div className={styles.skeletonProjectContent}>
              <Skeleton width="70%" height={18} />
              <Skeleton width="40%" height={14} />
              <Skeleton width="50%" height={18} />
              <Skeleton height={36} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
