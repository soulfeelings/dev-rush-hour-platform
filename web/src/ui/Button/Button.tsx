import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonAlign = 'left' | 'center' | 'right'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  align?: ButtonAlign
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  iconSize?: number
  selected?: boolean
  testId?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      align = 'center',
      fullWidth = false,
      iconLeft,
      iconRight,
      iconSize = 12,
      selected = false,
      className,
      children,
      testId = 'ui-button',
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.btn,
      styles[`btn--${variant}`],
      styles[`btn--${size}`],
      styles[`btn--align-${align}`],
      fullWidth && styles['btn--full'],
      selected && styles['btn--selected'],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classNames}
        data-testid={testId}
        style={{ '--icon-size': `${iconSize}px` } as React.CSSProperties}
        {...props}
      >
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        {children && <span className={styles.text}>{children}</span>}
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
