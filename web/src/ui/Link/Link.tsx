import { forwardRef } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'
import clsx from 'clsx'
import { Typography } from '../Typography'
import styles from './Link.module.scss'

export interface LinkProps extends RouterLinkProps {
  className?: string
  newTab?: boolean
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, newTab, ...props }, ref) => {
    return (
      <RouterLink
        ref={ref}
        className={clsx(styles.link, className)}
        {...(newTab && { target: '_blank' })}
        {...props}
      >
        <Typography variant="body" size="large" weight="medium">
          {children}
        </Typography>
      </RouterLink>
    )
  }
)

Link.displayName = 'Link'
