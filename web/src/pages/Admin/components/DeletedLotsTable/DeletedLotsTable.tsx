import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import styles from './DeletedLotsTable.module.scss'

const { useAdminListDeletedLots } = AdminApi

type DeletedLotsTableProps = {
  onRestore: (ids: string[]) => void
  onHardDelete: (ids: string[]) => void
  restoreLoading?: boolean
  hardDeleteLoading?: boolean
}

export function DeletedLotsTable({
  onRestore,
  onHardDelete,
  restoreLoading,
  hardDeleteLoading,
}: DeletedLotsTableProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemsToRestore, setItemsToRestore] = useState<string[]>([])
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([])
  const {
    data: lotsResponse,
    isLoading,
    error,
  } = useAdminListDeletedLots({
    query: { enabled: true },
  })

  const lotsList = lotsResponse?.items || []

  const handleSelectAll = () => {
    if (selectedIds.size === lotsList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(lotsList.map(l => l.id).filter((id): id is string => !!id)))
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

  const handleRestoreClick = (ids: string[]) => {
    setItemsToRestore(ids)
    setRestoreModalOpen(true)
  }

  const handleConfirmRestore = () => {
    onRestore(itemsToRestore)
    setRestoreModalOpen(false)
    setItemsToRestore([])
    setSelectedIds(new Set())
  }

  const handleCancelRestore = () => {
    setRestoreModalOpen(false)
    setItemsToRestore([])
  }

  const handleDeleteClick = (ids: string[]) => {
    setItemsToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onHardDelete(itemsToDelete)
    setDeleteModalOpen(false)
    setItemsToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setItemsToDelete([])
  }

  const isAllSelected = lotsList.length > 0 && selectedIds.size === lotsList.length
  const isSomeSelected = selectedIds.size > 0

  const getItemNames = (ids: string[]) => {
    return ids
      .map(id => {
        const lot = lotsList.find(l => l.id === id)
        return lot ? `${lot.type || 'Lot'} - ${lot.id?.slice(0, 8)}` : id
      })
      .join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Deleted Lots</h2>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
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
    return <ErrorState message="Error loading deleted lots" onRetry={() => window.location.reload()} variant="inline" />
  }

  if (lotsList.length === 0) {
    return null
  }

  const isLoading_ = restoreLoading || hardDeleteLoading

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Deleted Lots</h2>
        <div className={styles.headerActions}>
          <Checkbox
            checked={isAllSelected}
            onChange={handleSelectAll}
            aria-label="Select all deleted lots"
          />
          {isSomeSelected && (
            <>
              <Button
                variant="secondary"
                onClick={() => handleRestoreClick(Array.from(selectedIds))}
                disabled={isLoading_}
                iconLeft={<RotateCcw size={16} />}
              >
                Restore ({selectedIds.size})
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDeleteClick(Array.from(selectedIds))}
                disabled={isLoading_}
                iconLeft={<Trash2 size={16} />}
                className={styles.deleteButton}
              >
                Delete ({selectedIds.size})
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.grid}>
        {lotsList.map(lot => {
          const isSelected = !!lot.id && selectedIds.has(lot.id)
          return (
            <div
              key={lot.id}
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
              onMouseOver={() => setHoveredCardId(lot.id)}
              onMouseLeave={() => setHoveredCardId(undefined)}
            >
              <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                <Checkbox checked={isSelected} onChange={() => lot.id && handleSelectOne(lot.id)} aria-label={`Select lot ${lot.id}`} />
              </div>
              <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                {hoveredCardId === lot.id && (
                  <>
                    <button type="button" className={styles.restoreBtn} onClick={() => lot.id && handleRestoreClick([lot.id])} aria-label="Restore" disabled={isLoading_}>
                      <RotateCcw size={16} />
                    </button>
                    <button type="button" className={styles.deleteBtn} onClick={() => lot.id && handleDeleteClick([lot.id])} aria-label="Permanently delete" disabled={isLoading_}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
              <h3 className={styles.itemName}>{lot.type || 'Lot'} #{lot.id?.slice(0, 8)}</h3>
              {lot.project?.name && <div className={styles.itemMeta}>{lot.project.name}</div>}
              {(lot.bedrooms != null || lot.areaSqft != null) && (
                <div className={styles.itemMeta}>
                  {[
                    lot.bedrooms != null ? `${lot.bedrooms} BR` : null,
                    lot.areaSqft != null ? `${lot.areaSqft} ft²` : null,
                  ].filter(Boolean).join(' · ')}
                </div>
              )}
              {lot.priceFromUs && <div className={styles.itemPrice}>{lot.priceFromUs.toLocaleString()} AED</div>}
              <div className={styles.itemDate}>Deleted: {lot.deletedAt ? new Date(lot.deletedAt).toLocaleDateString('en-US') : '-'}</div>
            </div>
          )
        })}
      </div>

      <Modal open={restoreModalOpen} onClose={handleCancelRestore} title="Confirm Restore">
        <ModalBody>
          <p>
            Are you sure you want to restore{' '}
            {itemsToRestore.length === 1 ? 'this lot' : `${itemsToRestore.length} lots`}?
          </p>
          <p className={styles.itemNames}>{getItemNames(itemsToRestore)}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={handleCancelRestore} disabled={restoreLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmRestore} disabled={restoreLoading}>
            {restoreLoading ? 'Restoring...' : 'Restore'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={deleteModalOpen} onClose={handleCancelDelete} title="Confirm Permanent Delete">
        <ModalBody>
          <p>
            Are you sure you want to permanently delete{' '}
            {itemsToDelete.length === 1 ? 'this lot' : `${itemsToDelete.length} lots`}?
          </p>
          <p className={styles.itemNames}>{getItemNames(itemsToDelete)}</p>
          <p className={styles.deleteWarning}>This action cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={handleCancelDelete} disabled={hardDeleteLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmDelete} disabled={hardDeleteLoading}>
            {hardDeleteLoading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
