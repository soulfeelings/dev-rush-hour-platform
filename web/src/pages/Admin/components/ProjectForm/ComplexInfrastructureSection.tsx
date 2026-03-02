import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { type Infrastructure } from '../../../../api'
import { Checkbox, Modal, Input } from '../../../../ui'
import { InfrastructureTag } from '../../../../ui/InfrastructureTag'
import {
  useAdminCreateInfrastructure,
  getAdminListInfrastructuresQueryKey,
} from '../../../../api/generated/admin/rushHourRealEstatePlatformAPI'
import { InfrastructureForm } from '../InfrastructureForm/InfrastructureForm'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const filtered = useMemo(() => {
    if (!search.trim()) return infrastructures
    const q = search.toLowerCase()
    return infrastructures.filter(i => i.name?.toLowerCase().includes(q))
  }, [infrastructures, search])

  const createMutation = useAdminCreateInfrastructure({
    mutation: {
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: getAdminListInfrastructuresQueryKey() })
        if (data.id) onToggle(data.id)
        setIsModalOpen(false)
      },
    },
  })

  return (
    <>
      <div className={styles.mediaSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Complex Infrastructure</h3>
          <button type="button" className={styles.addButton} onClick={() => setIsModalOpen(true)}>
            <Plus size={14} />
            Add Infrastructure
          </button>
        </div>
        <Input
          placeholder="Search infrastructure..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {filtered.length > 0 && (
          <div className={styles.badgesList}>
            {filtered.map(infra => (
              <label key={infra.id} className={styles.badgeItem}>
                <Checkbox
                  checked={infra.id ? selectedIds.includes(infra.id) : false}
                  onChange={() => infra.id && onToggle(infra.id)}
                />
                <InfrastructureTag name={infra.name || ''} iconName={infra.icon} size="small" />
              </label>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Infrastructure"
        size="compact"
      >
        <InfrastructureForm
          onSubmit={data => createMutation.mutate({ data })}
          loading={createMutation.isPending}
        />
      </Modal>
    </>
  )
}
