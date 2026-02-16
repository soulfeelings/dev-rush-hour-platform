import { Pencil, Trash2 } from 'lucide-react'
import styles from './TableActionButtons.module.scss'

type TableActionButtonsProps = {
  onEdit?: () => void
  onDelete?: () => void
  deleteLoading?: boolean
  show?: boolean
}

export function TableActionButtons({
  onEdit,
  onDelete,
  deleteLoading,
  show = false,
}: TableActionButtonsProps) {
  if (!show) return null

  return (
    <div className={styles.actionButtons}>
      {onEdit && (
        <button
          type="button"
          className={styles.editButton}
          onClick={onEdit}
          aria-label="Edit"
        >
          <Pencil size={16} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label="Delete"
          disabled={deleteLoading}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}
