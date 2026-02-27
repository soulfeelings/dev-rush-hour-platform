import { X } from 'lucide-react'
import styles from './CachedSection.module.scss'

type CachedDraft = { id: string; displayName: string }

type Props = {
  drafts: CachedDraft[]
  onDraftClick: (id: string) => void
  onDraftDiscard: (id: string) => void
}

export function CachedSection({ drafts, onDraftClick, onDraftDiscard }: Props) {
  if (drafts.length === 0) return null

  return (
    <div className={styles.card}>
      <span className={styles.label}>Cached</span>
      <div className={styles.chips}>
        {drafts.map(draft => (
          <div key={draft.id} className={styles.chip}>
            <button
              type="button"
              className={styles.chipName}
              onClick={() => onDraftClick(draft.id)}
            >
              {draft.displayName}
            </button>
            <button
              type="button"
              className={styles.chipDiscard}
              onClick={() => onDraftDiscard(draft.id)}
              aria-label="Discard draft"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
