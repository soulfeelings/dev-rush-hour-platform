import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { TableSkeleton } from '../TableSkeleton'
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
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
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
        <TableSkeleton
          headers={['', '', 'ID', 'Project', 'Type', 'Bedrooms', 'Area (m²)', 'Price', 'Deleted At']}
          columns={[{ width: '40px' }, { isActions: true, width: '80px' }, {}, {}, {}, {}, {}, {}, {}]}
          minWidth="900px"
        />
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
                  aria-label="Select all deleted lots"
                />
              </th>
              <th></th>
              <th>ID</th>
              <th>Project</th>
              <th>Type</th>
              <th>Bedrooms</th>
              <th>Area (m²)</th>
              <th>Price</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {lotsList.map(lot => (
              <tr
                key={lot.id}
                onMouseEnter={() => setHoveredRowId(lot.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
                className={lot.id && selectedIds.has(lot.id) ? styles.selectedRow : ''}
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={!!lot.id && selectedIds.has(lot.id)}
                    onChange={() => lot.id && handleSelectOne(lot.id)}
                    aria-label={`Select lot ${lot.id}`}
                  />
                </td>
                <td className={styles.actionsCell}>
                  {hoveredRowId === lot.id && (
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.restoreBtn}
                        onClick={() => lot.id && handleRestoreClick([lot.id])}
                        aria-label="Restore lot"
                        disabled={isLoading_}
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => lot.id && handleDeleteClick([lot.id])}
                        aria-label="Permanently delete lot"
                        disabled={isLoading_}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
                <td>{lot.id?.slice(0, 8)}...</td>
                <td>{lot.project?.name || '-'}</td>
                <td>{lot.type || '-'}</td>
                <td>{lot.bedrooms ?? '-'}</td>
                <td>{lot.areaSqm ?? '-'}</td>
                <td>{lot.priceFromUs ? `${lot.priceFromUs.toLocaleString()} AED` : '-'}</td>
                <td>{lot.deletedAt ? new Date(lot.deletedAt).toLocaleDateString('en-US') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
