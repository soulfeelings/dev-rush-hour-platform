import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import type { Developer } from '../../../../api/generated/schemas/developer'
import { TableSkeleton } from '../TableSkeleton'
import { TableActionButtons } from '../TableActionButtons'
import { getImageUrl } from '../../../../utils/imageUrl'
import styles from './DevelopersTable.module.scss'

const { useAdminListDevelopers } = AdminApi

type DevelopersTableProps = {
  onNewClick: () => void
  onEditClick: (developer: Developer) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
}

export function DevelopersTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
}: DevelopersTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [developersToDelete, setDevelopersToDelete] = useState<string[]>([])
  const {
    data: developers,
    isLoading,
    error,
  } = useAdminListDevelopers({
    query: { enabled: true },
  })

  const developersList = developers || []

  const handleSelectAll = () => {
    if (selectedIds.size === developersList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(developersList.map(d => d.id).filter((id): id is string => !!id)))
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
    setDevelopersToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(developersToDelete)
    setDeleteModalOpen(false)
    setDevelopersToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setDevelopersToDelete([])
  }

  const isAllSelected = developersList.length > 0 && selectedIds.size === developersList.length
  const isSomeSelected = selectedIds.size > 0

  const getDeveloperNamesToDelete = () => {
    return developersToDelete
      .map(id => developersList.find(d => d.id === id)?.name || id)
      .join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Developers</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', '', 'Logo', 'ID', 'Name', 'Slug', 'Status', 'Created At']}
          columns={[
            { width: '40px' },
            { isActions: true, width: '50px' },
            { width: '60px' },
            {},
            {},
            {},
            {},
            {},
          ]}
          minWidth="850px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading developers" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Developers</h2>
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
      {developersList.length === 0 ? (
        <div className={styles.empty}>No developers</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all developers"
                />
              </th>
              <th></th>
              <th>Logo</th>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {developersList.map(developer => (
              <tr
                key={developer.id}
                onMouseEnter={() => setHoveredRowId(developer.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
                className={developer.id && selectedIds.has(developer.id) ? styles.selectedRow : ''}
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={!!developer.id && selectedIds.has(developer.id)}
                    onChange={() => developer.id && handleSelectOne(developer.id)}
                    aria-label={`Select ${developer.name}`}
                  />
                </td>
                <td className={styles.actionsCell}>
                  <TableActionButtons
                    show={hoveredRowId === developer.id}
                    onEdit={() => onEditClick(developer)}
                    onDelete={() => developer.id && handleDeleteClick([developer.id])}
                    deleteLoading={deleteLoading}
                  />
                </td>
                <td className={styles.logoCell}>
                  {developer.logoUrl ? (
                    <img
                      src={getImageUrl(developer.logoUrl!, 'thumbnail')}
                      alt={`${developer.name} logo`}
                      className={styles.logoImage}
                    />
                  ) : (
                    <span className={styles.noLogo}>-</span>
                  )}
                </td>
                <td>{developer.id}</td>
                <td>{developer.name || '-'}</td>
                <td>{developer.slug || '-'}</td>
                <td>{developer.status || '-'}</td>
                <td>
                  {developer.createdAt
                    ? new Date(developer.createdAt).toLocaleDateString('en-US')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={deleteModalOpen} onClose={handleCancelDelete} title="Confirm Delete">
        <ModalBody>
          <p>
            Are you sure you want to delete{' '}
            {developersToDelete.length === 1
              ? 'this developer'
              : `${developersToDelete.length} developers`}
            ?
          </p>
          <p className={styles.deleteItemNames}>{getDeveloperNamesToDelete()}</p>
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
