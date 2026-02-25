import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { getInfrastructureIcon } from '../../../../utils/infrastructureIcons'
import type { Infrastructure } from '../../../../api/generated/schemas/infrastructure'
import { TableSkeleton } from '../TableSkeleton'
import { TableActionButtons } from '../TableActionButtons'
import styles from './InfrastructuresTable.module.scss'

const { useAdminListInfrastructures } = AdminApi

type InfrastructuresTableProps = {
  onNewClick: () => void
  onEditClick: (infrastructure: Infrastructure) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
}

export function InfrastructuresTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
}: InfrastructuresTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
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
        <TableSkeleton
          headers={['', '', 'Name', 'Slug', 'Icon', 'Sort Order']}
          columns={[{ width: '40px' }, { isActions: true, width: '50px' }, {}, {}, {}, {}]}
          minWidth="600px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading infrastructures" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Infrastructures</h2>
        <div className={styles.headerActions}>
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
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all infrastructures"
                />
              </th>
              <th></th>
              <th>Name</th>
              <th>Slug</th>
              <th>Icon</th>
              <th>Sort Order</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr
                key={item.id}
                onMouseEnter={() => setHoveredRowId(item.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
                className={item.id && selectedIds.has(item.id) ? styles.selectedRow : ''}
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={!!item.id && selectedIds.has(item.id)}
                    onChange={() => item.id && handleSelectOne(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                </td>
                <td className={styles.actionsCell}>
                  <TableActionButtons
                    show={hoveredRowId === item.id}
                    onEdit={() => onEditClick(item)}
                    onDelete={() => item.id && handleDeleteClick([item.id])}
                    deleteLoading={deleteLoading}
                  />
                </td>
                <td>{item.name || '-'}</td>
                <td>{item.slug || '-'}</td>
                <td>{getInfrastructureIcon(item.icon) || item.icon || '-'}</td>
                <td>{item.sortOrder ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
