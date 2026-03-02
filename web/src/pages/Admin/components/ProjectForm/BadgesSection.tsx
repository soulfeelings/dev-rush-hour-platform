import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { type Badge } from '../../../../api'
import { Badge as BadgeUI, Checkbox } from '../../../../ui'
import {
  useAdminCreateBadge,
  getAdminListBadgesQueryKey,
} from '../../../../api/generated/admin/rushHourRealEstatePlatformAPI'
import { BadgeForm } from '../BadgeForm/BadgeForm'
import { Modal } from '../../../../ui'
import styles from './ProjectForm.module.scss'

type BadgesSectionProps = {
  badges: Badge[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export function BadgesSection({ badges, selectedIds, onToggle }: BadgesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const createBadgeMutation = useAdminCreateBadge({
    mutation: {
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: getAdminListBadgesQueryKey() })
        if (data.id) onToggle(data.id)
        setIsModalOpen(false)
      },
    },
  })

  return (
    <>
      <div className={styles.mediaSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Badges</h3>
          <button type="button" className={styles.addButton} onClick={() => setIsModalOpen(true)}>
            <Plus size={14} />
            Add Badge
          </button>
        </div>
        {badges.length > 0 && (
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
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Badge"
        size="compact"
      >
        <BadgeForm
          onSubmit={data => createBadgeMutation.mutate({ data })}
          loading={createBadgeMutation.isPending}
        />
      </Modal>
    </>
  )
}
