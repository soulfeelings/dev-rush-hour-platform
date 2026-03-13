import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { getImageUrl } from '../../../../utils/imageUrl'
import styles from './DeletedDevelopersTable.module.scss'

const { useAdminListDeletedDevelopers } = AdminApi

type DeletedDevelopersTableProps = {
  onRestore: (ids: string[]) => void
  onHardDelete: (ids: string[]) => void
  restoreLoading?: boolean
  hardDeleteLoading?: boolean
}

export function DeletedDevelopersTable({
  onRestore,
  onHardDelete,
  restoreLoading,
  hardDeleteLoading,
}: DeletedDevelopersTableProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [developersToRestore, setDevelopersToRestore] = useState<string[]>([])
  const [developersToDelete, setDevelopersToDelete] = useState<string[]>([])
  const {
    data: developers,
    isLoading,
    error,
  } = useAdminListDeletedDevelopers({
    query: { enabled: true },
  })

  const developersList = developers || []

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
    setDevelopersToRestore(ids)
    setRestoreModalOpen(true)
  }

  const handleConfirmRestore = () => {
    onRestore(developersToRestore)
    setRestoreModalOpen(false)
    setDevelopersToRestore([])
    setSelectedIds(new Set())
  }

  const handleCancelRestore = () => {
    setRestoreModalOpen(false)
    setDevelopersToRestore([])
  }

  const handleDeleteClick = (ids: string[]) => {
    setDevelopersToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onHardDelete(developersToDelete)
    setDeleteModalOpen(false)
    setDevelopersToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setDevelopersToDelete([])
  }

  const handleSelectAll = () => {
    if (selectedIds.size === developersList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(developersList.map(d => d.id).filter((id): id is string => !!id)))
    }
  }

  const isAllSelected = developersList.length > 0 && selectedIds.size === developersList.length
  const isSomeSelected = selectedIds.size > 0

  const getDeveloperNames = (ids: string[]) => {
    return ids.map(id => developersList.find(d => d.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Deleted Developers</h2>
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
    return <ErrorState message="Error loading deleted developers" onRetry={() => window.location.reload()} variant="inline" />
  }

  if (developersList.length === 0) {
    return null
  }

  const isLoading_ = restoreLoading || hardDeleteLoading

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Deleted Developers</h2>
        <div className={styles.headerActions}>
          <Checkbox
            checked={isAllSelected}
            onChange={handleSelectAll}
            aria-label="Select all deleted developers"
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
        {developersList.map(developer => {
          const isSelected = !!developer.id && selectedIds.has(developer.id)
          return (
            <div
              key={developer.id}
              className={`${styles.card} ${isSelected ? styles.selected : ''}`}
              onMouseOver={() => setHoveredCardId(developer.id)}
              onMouseLeave={() => setHoveredCardId(undefined)}
            >
              <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                <Checkbox checked={isSelected} onChange={() => developer.id && handleSelectOne(developer.id)} aria-label={`Select ${developer.name}`} />
              </div>
              <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                {hoveredCardId === developer.id && (
                  <>
                    <button type="button" className={styles.restoreBtn} onClick={() => developer.id && handleRestoreClick([developer.id])} aria-label="Restore" disabled={isLoading_}>
                      <RotateCcw size={16} />
                    </button>
                    <button type="button" className={styles.deleteBtn} onClick={() => developer.id && handleDeleteClick([developer.id])} aria-label="Permanently delete" disabled={isLoading_}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
              {developer.logoUrl ? (
                <img src={getImageUrl(developer.logoUrl!, 'thumbnail')} alt={`${developer.name} logo`} className={styles.logoImage} />
              ) : (
                <span className={styles.noLogo}>No logo</span>
              )}
              <h3 className={styles.itemName}>{developer.name || '-'}</h3>
              <div className={styles.itemSlug}>{developer.slug || '-'}</div>
              <div className={styles.itemDate}>Deleted: {developer.deletedAt ? new Date(developer.deletedAt).toLocaleDateString('en-US') : '-'}</div>
            </div>
          )
        })}
      </div>

      <Modal open={restoreModalOpen} onClose={handleCancelRestore} title="Confirm Restore">
        <ModalBody>
          <p>
            Are you sure you want to restore{' '}
            {developersToRestore.length === 1
              ? 'this developer'
              : `${developersToRestore.length} developers`}
            ?
          </p>
          <p className={styles.itemNames}>{getDeveloperNames(developersToRestore)}</p>
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
            {developersToDelete.length === 1
              ? 'this developer'
              : `${developersToDelete.length} developers`}
            ?
          </p>
          <p className={styles.itemNames}>{getDeveloperNames(developersToDelete)}</p>
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
