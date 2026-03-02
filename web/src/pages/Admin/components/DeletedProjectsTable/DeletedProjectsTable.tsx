import { useState, useMemo } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Input, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { TableSkeleton } from '../TableSkeleton'
import styles from './DeletedProjectsTable.module.scss'

const { useAdminListDeletedProjects } = AdminApi

type DeletedProjectsTableProps = {
  onRestore: (ids: string[]) => void
  onHardDelete: (ids: string[]) => void
  restoreLoading?: boolean
  hardDeleteLoading?: boolean
}

export function DeletedProjectsTable({
  onRestore,
  onHardDelete,
  restoreLoading,
  hardDeleteLoading,
}: DeletedProjectsTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemsToRestore, setItemsToRestore] = useState<string[]>([])
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const {
    data: projects,
    isLoading,
    error,
  } = useAdminListDeletedProjects({
    query: { enabled: true },
  })

  const allProjects = projects || []

  const projectsList = useMemo(() => {
    if (!searchQuery) return allProjects
    const q = searchQuery.toLowerCase()
    return allProjects.filter(p => p.name?.toLowerCase().includes(q))
  }, [allProjects, searchQuery])

  const handleSelectAll = () => {
    if (selectedIds.size === projectsList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(projectsList.map(p => p.id).filter((id): id is string => !!id)))
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

  const isAllSelected = projectsList.length > 0 && selectedIds.size === projectsList.length
  const isSomeSelected = selectedIds.size > 0

  const getItemNames = (ids: string[]) => {
    return ids.map(id => projectsList.find(p => p.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Deleted Projects</h2>
        </div>
        <TableSkeleton
          headers={['', '', 'ID', 'Name', 'Developer', 'Area', 'City', 'Slug', 'Deleted At']}
          columns={[{ width: '40px' }, { isActions: true, width: '80px' }, {}, {}, {}, {}, {}, {}, {}]}
          minWidth="900px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading deleted projects" onRetry={() => window.location.reload()} variant="inline" />
  }

  if (allProjects.length === 0) {
    return null
  }

  const isLoading_ = restoreLoading || hardDeleteLoading

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Deleted Projects</h2>
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
      <div className={styles.filters}>
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {projectsList.length === 0 ? (
        <div className={styles.empty}>No deleted projects match the search</div>
      ) : (
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all deleted projects"
                />
              </th>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Developer</th>
              <th>Area</th>
              <th>City</th>
              <th>Slug</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {projectsList.map(project => (
              <tr
                key={project.id}
                onMouseOver={() => setHoveredRowId(project.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
                className={project.id && selectedIds.has(project.id) ? styles.selectedRow : ''}
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={!!project.id && selectedIds.has(project.id)}
                    onChange={() => project.id && handleSelectOne(project.id)}
                    aria-label={`Select ${project.name}`}
                  />
                </td>
                <td className={styles.actionsCell}>
                  {hoveredRowId === project.id && (
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.restoreBtn}
                        onClick={() => project.id && handleRestoreClick([project.id])}
                        aria-label="Restore project"
                        disabled={isLoading_}
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => project.id && handleDeleteClick([project.id])}
                        aria-label="Permanently delete project"
                        disabled={isLoading_}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
                <td>{project.id}</td>
                <td>{project.name || '-'}</td>
                <td>{project.developer?.name || '-'}</td>
                <td>{project.area?.name || '-'}</td>
                <td>{project.area?.city || '-'}</td>
                <td>{project.slug || '-'}</td>
                <td>
                  {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString('en-US') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <Modal open={restoreModalOpen} onClose={handleCancelRestore} title="Confirm Restore">
        <ModalBody>
          <p>
            Are you sure you want to restore{' '}
            {itemsToRestore.length === 1 ? 'this project' : `${itemsToRestore.length} projects`}?
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
            {itemsToDelete.length === 1 ? 'this project' : `${itemsToDelete.length} projects`}?
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
