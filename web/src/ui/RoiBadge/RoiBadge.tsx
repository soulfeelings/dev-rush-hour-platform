import clsx from 'clsx'
import styles from './RoiBadge.module.scss'

interface RoiBadgeProps {
  value: number
  size?: 'small' | 'default'
  className?: string
}

export const RoiBadge = ({ value, size = 'default', className }: RoiBadgeProps) => (
  <div className={clsx(styles.container, styles[size], className)}>
    <span className={styles.value}>ROI {value}%</span>
  </div>
)
