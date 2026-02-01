import { forwardRef } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'
import clsx from 'clsx'
import {
  Typography,
  type TypographySize,
  type TypographyVariant,
  type TypographyWeight,
} from '../Typography'
import styles from './Link.module.scss'

export interface LinkProps extends RouterLinkProps {
  className?: string
  newTab?: boolean
  typographyVariant?: TypographyVariant
  typographySize?: TypographySize
  typographyWeight?: TypographyWeight
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      className,
      children,
      newTab,
      typographyVariant = 'body',
      typographySize = 'large',
      typographyWeight = 'medium',
      ...props
    },
    ref
  ) => {
    return (
      <RouterLink
        ref={ref}
        className={clsx(styles.link, className)}
        {...(newTab && { target: '_blank' })}
        {...props}
      >
        <Typography variant={typographyVariant} size={typographySize} weight={typographyWeight}>
          {children}
        </Typography>
      </RouterLink>
    )
  }
)

Link.displayName = 'Link'
