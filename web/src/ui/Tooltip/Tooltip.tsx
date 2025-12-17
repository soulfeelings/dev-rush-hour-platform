import { forwardRef, type HTMLAttributes } from 'react'
import styles from './Tooltip.module.scss'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  position?: TooltipPosition
}

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  ({ text, position = 'top', className, children, ...props }, ref) => {
    return (
      <span ref={ref} className={`${styles.tooltip} ${className || ''}`} {...props}>
        {children}
        <span className={`${styles.text} ${styles[`text--${position}`]}`}>{text}</span>
      </span>
    )
  }
)

Tooltip.displayName = 'Tooltip'
