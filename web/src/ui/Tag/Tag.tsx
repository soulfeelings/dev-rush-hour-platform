import { X } from 'lucide-react'
import styles from './Tag.module.scss'

export interface TagProps {
  children: React.ReactNode
  onRemove?: () => void
  testId?: string
}

export function Tag({ children, onRemove, testId = 'ui-tag' }: TagProps) {
  return (
    <span className={styles.tag} data-testid={testId}>
      <span className={styles.content}>{children}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label="Remove"
        >
          <X size={14} />
        </button>
      )}
    </span>
  )
}

