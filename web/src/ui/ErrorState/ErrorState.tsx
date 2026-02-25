import { TriangleAlert, RotateCcw, WifiOff } from 'lucide-react'
import styles from './ErrorState.module.scss'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  variant?: 'page' | 'inline'
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
  variant = 'page',
}: ErrorStateProps) {
  const isNetwork = message?.toLowerCase().includes('fetch') || message?.toLowerCase().includes('network')

  if (variant === 'inline') {
    return (
      <div className={styles.inline}>
        <TriangleAlert size={16} className={styles.inlineIcon} />
        <span className={styles.inlineText}>{message || 'Something went wrong'}</span>
        {onRetry && (
          <button className={styles.inlineRetry} onClick={onRetry}>
            <RotateCcw size={13} />
            {retryLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.iconCircle}>
        {isNetwork ? <WifiOff size={28} /> : <TriangleAlert size={28} />}
      </div>
      <h3 className={styles.title}>{title || (isNetwork ? 'Connection issue' : 'Something went wrong')}</h3>
      <p className={styles.message}>
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          <RotateCcw size={15} />
          {retryLabel}
        </button>
      )}
    </div>
  )
}
