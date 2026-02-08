import type { ReactNode } from 'react'
import { getBadgeIcon } from '../../utils/badgeIcons'
import styles from './Badge.module.scss'

export interface BadgeProps {
  text: string
  backgroundColor: string
  textColor?: string
  icon?: ReactNode
  iconName?: string
  iconColor?: string
  size?: 'small' | 'default'
  className?: string
}

export const Badge = ({
  text,
  backgroundColor,
  textColor = 'white',
  icon,
  iconName,
  iconColor,
  size = 'default',
  className,
}: BadgeProps) => {
  const resolvedIcon = icon ?? getBadgeIcon(iconName)

  return (
    <span
      className={`${styles.badge} ${styles[size]} ${className ?? ''}`}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {resolvedIcon && (
        <span className={styles.icon} style={iconColor ? { color: iconColor } : undefined}>
          {resolvedIcon}
        </span>
      )}
      <span className={styles.text}>{text}</span>
    </span>
  )
}
