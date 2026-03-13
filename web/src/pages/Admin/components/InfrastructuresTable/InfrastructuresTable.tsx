import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { getInfrastructureIcon } from '../../../../utils/infrastructureIcons'
import type { Infrastructure } from '../../../../api/generated/schemas/infrastructure'
import { TableActionButtons } from '../TableActionButtons'
import { CachedSection } from '../CachedSection/CachedSection'
import styles from './InfrastructuresTable.module.scss'

const { useAdminListInfrastructures } = AdminApi

type InfrastructuresTableProps = {
  onNewClick: () => void
  onEditClick: (infrastructure: Infrastructure) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
  drafts?: Array<{ id: string; displayName: string }>
  onDraftClick?: (id: string) => void
  onDraftDiscard?: (id: string) => void
}

export function InfrastructuresTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
  drafts,
  onDraftClick,
  onDraftDiscard,
}: InfrastructuresTableProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([])
  const {
    data: infrastructures,
    isLoading,
    error,
  } = useAdminListInfrastructures({
    query: { enabled: true },
  })

  const list = infrastructures || []

  const handleSelectAll = () => {
    if (selectedIds.size === list.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(list.map(b => b.id).filter((id): id is string => !!id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteClick = (ids: string[]) => {
    setItemsToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(itemsToDelete)
    setDeleteModalOpen(false)
    setItemsToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setItemsToDelete([])
  }

  const isAllSelected = list.length > 0 && selectedIds.size === list.length
  const isSomeSelected = selectedIds.size > 0

  const getItemNamesToDelete = () => {
    return itemsToDelete.map(id => list.find(b => b.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Infrastructures</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonIcon} />
              <div className={`${styles.skeletonLine} ${styles.wide}`} />
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.short}`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading infrastructures" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      {drafts && drafts.length > 0 && onDraftClick && onDraftDiscard && (
        <CachedSection drafts={drafts} onDraftClick={onDraftClick} onDraftDiscard={onDraftDiscard} />
      )}
      <div className={styles.header}>
        <h2 className={styles.title}>Infrastructures</h2>
        <div className={styles.headerActions}>
          {list.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all infrastructures"
            />
          )}
          {isSomeSelected && (
            <Button
              variant="secondary"
              onClick={() => handleDeleteClick(Array.from(selectedIds))}
              disabled={deleteLoading}
              iconLeft={<Trash2 size={16} />}
            >
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={onNewClick}>New</Button>
        </div>
      </div>
      {list.length === 0 ? (
        <div className={styles.empty}>No infrastructures</div>
      ) : (
        <div className={styles.grid}>
          {list.map(item => {
            const isSelected = !!item.id && selectedIds.has(item.id)

            return (
              <div
                key={item.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onMouseOver={() => setHoveredCardId(item.id)}
                onMouseLeave={() => setHoveredCardId(undefined)}
                onClick={() => onEditClick(item)}
              >
                <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => item.id && handleSelectOne(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                </div>
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <TableActionButtons
                    show={hoveredCardId === item.id}
                    onEdit={() => onEditClick(item)}
                    onDelete={() => item.id && handleDeleteClick([item.id])}
                    deleteLoading={deleteLoading}
                  />
                </div>
                <div className={styles.infraIcon}>
                  {getInfrastructureIcon(item.icon) || item.icon || '-'}
                </div>
                <h3 className={styles.infraName}>{item.name || '-'}</h3>
                <div className={styles.infraSlug}>{item.slug || '-'}</div>
                <div className={styles.infraSortOrder}>Order: {item.sortOrder ?? 0}</div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={deleteModalOpen} onClose={handleCancelDelete} title="Confirm Delete">
        <ModalBody>
          <p>
            Are you sure you want to delete{' '}
            {itemsToDelete.length === 1
              ? 'this infrastructure'
              : `${itemsToDelete.length} infrastructures`}
            ?
          </p>
          <p className={styles.deleteItemNames}>{getItemNamesToDelete()}</p>
          <p className={styles.deleteWarning}>This action cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={handleCancelDelete} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
