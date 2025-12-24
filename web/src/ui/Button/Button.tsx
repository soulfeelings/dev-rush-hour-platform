import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  testId?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
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
      fullWidth && styles['btn--full'],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} className={classNames} data-testid={testId} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
