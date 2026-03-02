import { type Badge } from '../../../../api'
import { Badge as BadgeUI, Checkbox } from '../../../../ui'
import styles from './ProjectForm.module.scss'

type BadgesSectionProps = {
  badges: Badge[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export function BadgesSection({ badges, selectedIds, onToggle }: BadgesSectionProps) {
  if (badges.length === 0) return null

  return (
    <div className={styles.mediaSection}>
      <h3 className={styles.sectionTitle}>Badges</h3>
      <div className={styles.badgesList}>
        {badges.map(badge => (
          <label key={badge.id} className={styles.badgeItem}>
            <Checkbox
              checked={badge.id ? selectedIds.includes(badge.id) : false}
              onChange={() => badge.id && onToggle(badge.id)}
            />
            <BadgeUI
              text={badge.name || ''}
              backgroundColor={badge.backgroundColor || '#e0e0e0'}
              textColor={badge.textColor || '#000000'}
              iconName={badge.icon}
              iconColor={badge.iconColor}
              size="small"
            />
          </label>
        ))}
      </div>
    </div>
  )
}
