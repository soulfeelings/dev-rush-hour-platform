import React from 'react'
import clsx from 'clsx'
import styles from './Typography.module.scss'

export type TypographyVariant = 'h1' | 'body'
export type TypographySize = 'large' | 'regular' | 'small'
export type TypographyWeight = 'medium' | 'regular'
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
  const classNames = [styles.typography]

  if (variant === 'h1') {
    classNames.push(styles['typography--h1'])
  } else {
    classNames.push(styles[`typography--body-${size}-${weight}`])
  }

  classNames.push(styles[`typography--color-${color}`])

  return (
    <Component {...rest} className={clsx(classNames, className)}>
      {children}
    </Component>
  )
}

Typography.displayName = 'Typography'
