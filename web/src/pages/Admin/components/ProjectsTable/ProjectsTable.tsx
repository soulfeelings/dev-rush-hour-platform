import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter, Select } from '../../../../ui'
import type { Project } from '../../../../api/generated/schemas/project'
import { TableSkeleton } from '../TableSkeleton'
import { TableActionButtons } from '../TableActionButtons'
import { getImageUrl } from '../../../../utils/imageUrl'
import styles from './ProjectsTable.module.scss'

const { useAdminListProjects, useAdminListDevelopers, useAdminListAreas, useAdminListCities } = AdminApi

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
  const [filterCityId, setFilterCityId] = useState<string>('')
  const [filterAreaId, setFilterAreaId] = useState<string>('')
  const [filterDeveloperId, setFilterDeveloperId] = useState<string>('')

  const {
    data: projects,
    isLoading,
    error,
  } = useAdminListProjects({
    query: { enabled: true },
  })

  const { data: developersData } = useAdminListDevelopers({ query: { enabled: true } })
  const { data: areasData } = useAdminListAreas({ query: { enabled: true } })
  const { data: citiesData } = useAdminListCities({ query: { enabled: true } })

  const allProjects = projects || []
  const developers = developersData || []
  const areas = areasData || []
  const cities = citiesData || []

  // Build a set of area IDs belonging to the selected city
  const cityAreaIds = useMemo(() => {
    if (!filterCityId) return null
    const city = cities.find(c => c.id === filterCityId)
    if (!city) return null
    return new Set(areas.filter(a => a.city === city.name).map(a => a.id))
  }, [filterCityId, cities, areas])

  const projectsList = useMemo(() => {
    let filtered = allProjects

    if (filterDeveloperId) {
      filtered = filtered.filter(p => p.developerId === filterDeveloperId)
    }

    if (filterAreaId) {
      filtered = filtered.filter(p => p.areaId === filterAreaId)
    } else if (cityAreaIds) {
      filtered = filtered.filter(p => p.areaId && cityAreaIds.has(p.areaId))
    }

    return filtered
  }, [allProjects, filterDeveloperId, filterAreaId, cityAreaIds])

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
          headers={['', '', 'Image', 'ID', 'Name', 'Developer', 'Area', 'Slug', 'Status', 'Sale', 'Created At']}
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
            {},
            {},
          ]}
          minWidth="1000px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading projects" onRetry={() => window.location.reload()} variant="inline" />
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

      <div className={styles.filters}>
        <Select
          options={[
            { value: '', label: 'All Cities' },
            ...cities.map(c => ({ value: c.id || '', label: c.name || '' })),
          ]}
          value={filterCityId}
          onChange={setFilterCityId}
          clearable
          defaultValue=""
        />
        <Select
          options={[
            { value: '', label: 'All Areas' },
            ...areas.map(a => ({ value: a.id || '', label: a.name || '' })),
          ]}
          value={filterAreaId}
          onChange={setFilterAreaId}
          clearable
          defaultValue=""
        />
        <Select
          options={[
            { value: '', label: 'All Developers' },
            ...developers.map(d => ({ value: d.id || '', label: d.name || '' })),
          ]}
          value={filterDeveloperId}
          onChange={setFilterDeveloperId}
          clearable
          defaultValue=""
        />
        {(filterCityId || filterAreaId || filterDeveloperId) && (
          <Button
            variant="secondary"
            onClick={() => {
              setFilterCityId('')
              setFilterAreaId('')
              setFilterDeveloperId('')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {projectsList.length === 0 ? (
        <div className={styles.empty}>
          {allProjects.length === 0 ? 'No projects' : 'No projects match the selected filters'}
        </div>
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
              <th>Developer</th>
              <th>Area</th>
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
                      src={getImageUrl(getProjectImageUrl(project) || '', 'thumbnail')}
                      alt={project.name || 'Project'}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.noImage}>-</div>
                  )}
                </td>
                <td>{project.id}</td>
                <td>{project.name || '-'}</td>
                <td>{project.developer?.name || '-'}</td>
                <td>{project.area?.name || '-'}</td>
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
