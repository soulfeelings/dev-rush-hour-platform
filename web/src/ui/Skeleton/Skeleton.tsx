import { forwardRef, type HTMLAttributes } from 'react'
import styles from './Skeleton.module.scss'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width, height, lines = 1, className, style, ...props }, ref) => {
    const classNames = [styles.skeleton, styles[`skeleton--${variant}`], className]
      .filter(Boolean)
      .join(' ')

    const customStyle = {
      ...style,
      width: width,
      height: height,
    }

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={styles.lines} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={classNames}
              style={{
                ...customStyle,
                width: i === lines - 1 ? '60%' : width,
              }}
            />
          ))}
        </div>
      )
    }

    return <div ref={ref} className={classNames} style={customStyle} {...props} />
  }
)

Skeleton.displayName = 'Skeleton'

// Preset: Card skeleton
export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  imageHeight?: string | number
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ imageHeight = 180, className, ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.card} ${className || ''}`} {...props}>
        <Skeleton variant="rectangular" height={imageHeight} />
        <div className={styles.cardContent}>
          <Skeleton lines={3} />
        </div>
      </div>
    )
  }
)

SkeletonCard.displayName = 'SkeletonCard'
