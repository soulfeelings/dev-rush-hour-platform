import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, Modal, ModalBody, ModalFooter } from '../../../../ui'
import type { Project } from '../../../../api/generated/schemas/project'
import { TableSkeleton } from '../TableSkeleton'
import { TableActionButtons } from '../TableActionButtons'
import styles from './ProjectsTable.module.scss'

const { useAdminListProjects } = AdminApi

type ProjectsTableProps = {
  onNewClick: () => void
  onEditClick: (project: Project) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
}

export function ProjectsTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
}: ProjectsTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectsToDelete, setProjectsToDelete] = useState<string[]>([])
  const {
    data: projects,
    isLoading,
    error,
  } = useAdminListProjects({
    query: { enabled: true },
  })

  const projectsList = projects || []

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

  const handleDeleteClick = (ids: string[]) => {
    setProjectsToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(projectsToDelete)
    setDeleteModalOpen(false)
    setProjectsToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setProjectsToDelete([])
  }

  const isAllSelected = projectsList.length > 0 && selectedIds.size === projectsList.length
  const isSomeSelected = selectedIds.size > 0

  const getProjectImageUrl = (project: (typeof projectsList)[0]) => {
    if (project.media?.cover?.url) {
      return project.media.cover.url
    }
    if (project.media?.gallery && project.media.gallery.length > 0) {
      return project.media.gallery[0]?.url
    }
    return null
  }

  const getProjectNamesToDelete = () => {
    return projectsToDelete.map(id => projectsList.find(p => p.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Projects</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', '', 'Image', 'ID', 'Name', 'Slug', 'Status', 'Sale', 'Created At']}
          columns={[
            { width: '40px' },
            { isActions: true, width: '50px' },
            { isImage: true, width: '80px' },
            {},
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
    return <div className={styles.error}>Error loading projects</div>
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Projects</h2>
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
      {projectsList.length === 0 ? (
        <div className={styles.empty}>No projects</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all projects"
                />
              </th>
              <th></th>
              <th>Image</th>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Sale</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {projectsList.map(project => (
              <tr
                key={project.id}
                onMouseEnter={() => setHoveredRowId(project.id)}
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
                  <TableActionButtons
                    show={hoveredRowId === project.id}
                    onEdit={() => onEditClick(project)}
                    onDelete={() => project.id && handleDeleteClick([project.id])}
                    deleteLoading={deleteLoading}
                  />
                </td>
                <td className={styles.imageCell}>
                  {getProjectImageUrl(project) ? (
                    <img
                      src={getProjectImageUrl(project) || ''}
                      alt={project.name || 'Project'}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.noImage}>-</div>
                  )}
                </td>
                <td>{project.id}</td>
                <td>{project.name || '-'}</td>
                <td>{project.slug || '-'}</td>
                <td>{project.status || '-'}</td>
                <td>{project.sale || '-'}</td>
                <td>
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString('en-US')
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
            {projectsToDelete.length === 1 ? 'this project' : `${projectsToDelete.length} projects`}
            ?
          </p>
          <p className={styles.deleteProjectNames}>{getProjectNamesToDelete()}</p>
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
