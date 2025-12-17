import { HTMLAttributes, forwardRef } from 'react'
import styles from './Card.module.scss'

export type CardVariant = 'elevated' | 'flat' | 'outlined'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'elevated', hoverable = true, padding = 'none', className, children, ...props },
    ref
  ) => {
    const classNames = [
      styles.card,
      styles[`card--${variant}`],
      hoverable && styles['card--hoverable'],
      padding !== 'none' && styles[`card--padding-${padding}`],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card subcomponents
export interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  alt: string
  aspectRatio?: '16/9' | '16/10' | '4/3' | '1/1'
}

export const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  ({ src, alt, aspectRatio = '16/10', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.cardImage} ${className || ''}`}
        style={{ aspectRatio }}
        {...props}
      >
        <img src={src} alt={alt} />
        {children}
      </div>
    )
  }
)

CardImage.displayName = 'CardImage'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.cardContent} ${className || ''}`} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export interface CardBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'featured'
}

export const CardBadge = forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const classNames = [
      styles.cardBadge,
      variant === 'featured' && styles['cardBadge--featured'],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <span ref={ref} className={classNames} {...props}>
        {children}
      </span>
    )
  }
)

CardBadge.displayName = 'CardBadge'
