import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { TableSkeleton } from '../TableSkeleton'
import styles from './DeletedBadgesTable.module.scss'

const { useAdminListDeletedBadges } = AdminApi

type DeletedBadgesTableProps = {
  onRestore: (ids: string[]) => void
  onHardDelete: (ids: string[]) => void
  restoreLoading?: boolean
  hardDeleteLoading?: boolean
}

export function DeletedBadgesTable({
  onRestore,
  onHardDelete,
  restoreLoading,
  hardDeleteLoading,
}: DeletedBadgesTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemsToRestore, setItemsToRestore] = useState<string[]>([])
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([])
  const {
    data: badges,
    isLoading,
    error,
  } = useAdminListDeletedBadges({
    query: { enabled: true },
  })

  const badgesList = badges || []

  const handleSelectAll = () => {
    if (selectedIds.size === badgesList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(badgesList.map(b => b.id).filter((id): id is string => !!id)))
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

  const isAllSelected = badgesList.length > 0 && selectedIds.size === badgesList.length
  const isSomeSelected = selectedIds.size > 0

  const getItemNames = (ids: string[]) => {
    return ids.map(id => badgesList.find(b => b.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Deleted Badges</h2>
        </div>
        <TableSkeleton
          headers={['', '', 'ID', 'Name', 'Slug', 'Deleted At']}
          columns={[{ width: '40px' }, { isActions: true, width: '80px' }, {}, {}, {}, {}]}
          minWidth="700px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading deleted badges" onRetry={() => window.location.reload()} variant="inline" />
  }

  if (badgesList.length === 0) {
    return null
  }

  const isLoading_ = restoreLoading || hardDeleteLoading

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Deleted Badges</h2>
        <div className={styles.headerActions}>
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
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all deleted badges"
                />
              </th>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {badgesList.map(badge => (
              <tr
                key={badge.id}
                onMouseEnter={() => setHoveredRowId(badge.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
                className={badge.id && selectedIds.has(badge.id) ? styles.selectedRow : ''}
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={!!badge.id && selectedIds.has(badge.id)}
                    onChange={() => badge.id && handleSelectOne(badge.id)}
                    aria-label={`Select ${badge.name}`}
                  />
                </td>
                <td className={styles.actionsCell}>
                  {hoveredRowId === badge.id && (
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.restoreBtn}
                        onClick={() => badge.id && handleRestoreClick([badge.id])}
                        aria-label="Restore badge"
                        disabled={isLoading_}
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => badge.id && handleDeleteClick([badge.id])}
                        aria-label="Permanently delete badge"
                        disabled={isLoading_}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
                <td>{badge.id}</td>
                <td>{badge.name || '-'}</td>
                <td>{badge.slug || '-'}</td>
                <td>
                  {badge.deletedAt ? new Date(badge.deletedAt).toLocaleDateString('en-US') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={restoreModalOpen} onClose={handleCancelRestore} title="Confirm Restore">
        <ModalBody>
          <p>
            Are you sure you want to restore{' '}
            {itemsToRestore.length === 1 ? 'this badge' : `${itemsToRestore.length} badges`}?
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
            {itemsToDelete.length === 1 ? 'this badge' : `${itemsToDelete.length} badges`}?
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
