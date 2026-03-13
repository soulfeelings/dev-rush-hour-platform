import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import styles from './DeletedCitiesTable.module.scss'

const { useAdminListDeletedCities } = AdminApi

type DeletedCitiesTableProps = {
  onRestore: (ids: string[]) => void
  onHardDelete: (ids: string[]) => void
  restoreLoading?: boolean
  hardDeleteLoading?: boolean
}

export function DeletedCitiesTable({
  onRestore,
  onHardDelete,
  restoreLoading,
  hardDeleteLoading,
}: DeletedCitiesTableProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemsToRestore, setItemsToRestore] = useState<string[]>([])
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([])
  const {
    data: cities,
    isLoading,
    error,
  } = useAdminListDeletedCities({
    query: { enabled: true },
  })

  const citiesList = cities || []

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

  const handleSelectAll = () => {
    if (selectedIds.size === citiesList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(citiesList.map(c => c.id).filter((id): id is string => !!id)))
    }
  }

  const isAllSelected = citiesList.length > 0 && selectedIds.size === citiesList.length
  const isSomeSelected = selectedIds.size > 0

  const getItemNames = (ids: string[]) => {
    return ids.map(id => citiesList.find(c => c.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Deleted Cities</h2>
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
    return <ErrorState message="Error loading deleted cities" onRetry={() => window.location.reload()} variant="inline" />
  }

  if (citiesList.length === 0) {
    return null
  }

  const isLoading_ = restoreLoading || hardDeleteLoading

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Deleted Cities</h2>
        <div className={styles.headerActions}>
          <Checkbox
            checked={isAllSelected}
            onChange={handleSelectAll}
            aria-label="Select all deleted cities"
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
        {citiesList.map(city => {
          const isSelected = !!city.id && selectedIds.has(city.id)
          return (
            <div
              key={city.id}
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
              onMouseOver={() => setHoveredCardId(city.id)}
              onMouseLeave={() => setHoveredCardId(undefined)}
            >
              <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                <Checkbox checked={isSelected} onChange={() => city.id && handleSelectOne(city.id)} aria-label={`Select ${city.name}`} />
              </div>
              <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                {hoveredCardId === city.id && (
                  <>
                    <button type="button" className={styles.restoreBtn} onClick={() => city.id && handleRestoreClick([city.id])} aria-label="Restore" disabled={isLoading_}>
                      <RotateCcw size={16} />
                    </button>
                    <button type="button" className={styles.deleteBtn} onClick={() => city.id && handleDeleteClick([city.id])} aria-label="Permanently delete" disabled={isLoading_}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
              <h3 className={styles.itemName}>{city.name || '-'}</h3>
              <div className={styles.itemSlug}>{city.slug || '-'}</div>
              <div className={styles.itemDate}>Deleted: {city.deletedAt ? new Date(city.deletedAt).toLocaleDateString('en-US') : '-'}</div>
            </div>
          )
        })}
      </div>

      <Modal open={restoreModalOpen} onClose={handleCancelRestore} title="Confirm Restore">
        <ModalBody>
          <p>
            Are you sure you want to restore{' '}
            {itemsToRestore.length === 1 ? 'this city' : `${itemsToRestore.length} cities`}?
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
            {itemsToDelete.length === 1 ? 'this city' : `${itemsToDelete.length} cities`}?
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
