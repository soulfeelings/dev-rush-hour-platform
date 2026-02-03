import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { TableSkeleton } from '../TableSkeleton'
import styles from './DeletedAreasTable.module.scss'

const { useAdminListDeletedAreas } = AdminApi

type DeletedAreasTableProps = {
  onRestore: (ids: string[]) => void
  onHardDelete: (ids: string[]) => void
  restoreLoading?: boolean
  hardDeleteLoading?: boolean
}

export function DeletedAreasTable({
  onRestore,
  onHardDelete,
  restoreLoading,
  hardDeleteLoading,
}: DeletedAreasTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemsToRestore, setItemsToRestore] = useState<string[]>([])
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([])
  const {
    data: areas,
    isLoading,
    error,
  } = useAdminListDeletedAreas({
    query: { enabled: true },
  })

  const areasList = areas || []

  const handleSelectAll = () => {
    if (selectedIds.size === areasList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(areasList.map(a => a.id).filter((id): id is string => !!id)))
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

  const isAllSelected = areasList.length > 0 && selectedIds.size === areasList.length
  const isSomeSelected = selectedIds.size > 0

  const getItemNames = (ids: string[]) => {
    return ids.map(id => areasList.find(a => a.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Deleted Areas</h2>
        </div>
        <TableSkeleton
          headers={['', '', 'ID', 'Name', 'Slug', 'City', 'Deleted At']}
          columns={[{ width: '40px' }, { isActions: true, width: '80px' }, {}, {}, {}, {}, {}]}
          minWidth="750px"
        />
      </div>
    )
  }

  if (error) {
    return <div className={styles.error}>Error loading deleted areas</div>
  }

  if (areasList.length === 0) {
    return null
  }

  const isLoading_ = restoreLoading || hardDeleteLoading

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Deleted Areas</h2>
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
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkboxCell}>
              <Checkbox
                checked={isAllSelected}
                onChange={handleSelectAll}
                aria-label="Select all deleted areas"
              />
            </th>
            <th></th>
            <th>ID</th>
            <th>Name</th>
            <th>Slug</th>
            <th>City</th>
            <th>Deleted At</th>
          </tr>
        </thead>
        <tbody>
          {areasList.map(area => (
            <tr
              key={area.id}
              onMouseEnter={() => setHoveredRowId(area.id)}
              onMouseLeave={() => setHoveredRowId(undefined)}
              className={area.id && selectedIds.has(area.id) ? styles.selectedRow : ''}
            >
              <td className={styles.checkboxCell}>
                <Checkbox
                  checked={!!area.id && selectedIds.has(area.id)}
                  onChange={() => area.id && handleSelectOne(area.id)}
                  aria-label={`Select ${area.name}`}
                />
              </td>
              <td className={styles.actionsCell}>
                {hoveredRowId === area.id && (
                  <div className={styles.actionButtons}>
                    <button
                      type="button"
                      className={styles.restoreBtn}
                      onClick={() => area.id && handleRestoreClick([area.id])}
                      aria-label="Restore area"
                      disabled={isLoading_}
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => area.id && handleDeleteClick([area.id])}
                      aria-label="Permanently delete area"
                      disabled={isLoading_}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </td>
              <td>{area.id}</td>
              <td>{area.name || '-'}</td>
              <td>{area.slug || '-'}</td>
              <td>{area.city || '-'}</td>
              <td>{area.deletedAt ? new Date(area.deletedAt).toLocaleDateString('en-US') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={restoreModalOpen} onClose={handleCancelRestore} title="Confirm Restore">
        <ModalBody>
          <p>
            Are you sure you want to restore{' '}
            {itemsToRestore.length === 1 ? 'this area' : `${itemsToRestore.length} areas`}?
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
            {itemsToDelete.length === 1 ? 'this area' : `${itemsToDelete.length} areas`}?
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
