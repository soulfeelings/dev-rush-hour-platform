import React from 'react'
import clsx from 'clsx'
import styles from './Typography.module.scss'

export type TypographyVariant = 'h1' | 'body'
export type TypographySize = 'large' | 'regular' | 'small' | 'xs'
export type TypographyWeight = 'medium' | 'regular' | 'semibold' | 'bold'
export type TypographyColor = 'default' | 'white' | 'inherit'

export type TypographyProps = {
  /**
   * @default 'span'
   */
  as?: 'span' | 'h1' | 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  variant?: TypographyVariant
  size?: TypographySize
  weight?: TypographyWeight
  color?: TypographyColor
  className?: string
  children?: React.ReactNode
}

/**
 *
 * @default
 {
    variant: 'body'
    size: 'regular'
    weight: 'regular'
    as: 'span'
 }
 */
export const Typography = ({
  variant = 'body',
  size = 'regular',
  weight = 'regular',
  color = 'inherit',
  as: Component = 'span',
  className,
  children,
  ...rest
}: TypographyProps) => {
  const classNames = [
    styles.typography,
    styles[`weight-${weight}`],
    styles[`typography--color-${color}`],
    variant === 'h1' ? styles['typography--h1'] : styles[`typography--body-${size}-${weight}`],
    className,
  ]

  return (
    <Component {...rest} className={clsx(classNames)}>
      {children}
    </Component>
  )
}

Typography.displayName = 'Typography'
