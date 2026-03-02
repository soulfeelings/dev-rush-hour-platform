import { type Infrastructure } from '../../../../api'
import { Checkbox } from '../../../../ui'
import { InfrastructureTag } from '../../../../ui/InfrastructureTag'
import styles from './ProjectForm.module.scss'

type ComplexInfrastructureSectionProps = {
  infrastructures: Infrastructure[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export function ComplexInfrastructureSection({
  infrastructures,
  selectedIds,
  onToggle,
}: ComplexInfrastructureSectionProps) {
  if (infrastructures.length === 0) return null

  return (
    <div className={styles.mediaSection}>
      <h3 className={styles.sectionTitle}>Complex Infrastructure</h3>
      <div className={styles.badgesList}>
        {infrastructures.map(infra => (
          <label key={infra.id} className={styles.badgeItem}>
            <Checkbox
              checked={infra.id ? selectedIds.includes(infra.id) : false}
              onChange={() => infra.id && onToggle(infra.id)}
            />
            <InfrastructureTag name={infra.name || ''} iconName={infra.icon} size="small" />
          </label>
        ))}
      </div>
    </div>
  )
}
