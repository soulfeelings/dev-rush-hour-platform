import { HTMLAttributes, forwardRef, useEffect } from 'react'
import { Check, X, Info, AlertTriangle } from 'lucide-react'
import styles from './Toast.module.scss'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose?: () => void
  variant?: ToastVariant
  duration?: number
  showIcon?: boolean
}

const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info size={20} />,
  success: <Check size={20} />,
  error: <X size={20} />,
  warning: <AlertTriangle size={20} />,
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      open,
      onClose,
      variant = 'default',
      duration = 3000,
      showIcon = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (open && duration && onClose) {
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
      }
    }, [open, duration, onClose])

    if (!open) return null

    const classNames = [styles.toast, styles[`toast--${variant}`], className]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={classNames} {...props}>
        {showIcon && <span className={styles.icon}>{icons[variant]}</span>}
        <span className={styles.content}>{children}</span>
      </div>
    )
  }
)

Toast.displayName = 'Toast'
