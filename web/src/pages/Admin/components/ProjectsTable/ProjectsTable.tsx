import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Input, Modal, ModalBody, ModalFooter, Select } from '../../../../ui'
import type { Project } from '../../../../api/generated/schemas/project'
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
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectsToDelete, setProjectsToDelete] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCityId, setFilterCityId] = useState<string>('')
  const [filterAreaId, setFilterAreaId] = useState<string>('')
  const [filterDeveloperId, setFilterDeveloperId] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

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

  const cityAreaIds = useMemo(() => {
    if (!filterCityId) return null
    const city = cities.find(c => c.id === filterCityId)
    if (!city) return null
    return new Set(areas.filter(a => a.city === city.name).map(a => a.id))
  }, [filterCityId, cities, areas])

  const projectsList = useMemo(() => {
    let filtered = allProjects

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => p.name?.toLowerCase().includes(q))
    }

    if (filterDeveloperId) {
      filtered = filtered.filter(p => p.developerId === filterDeveloperId)
    }

    if (filterAreaId) {
      filtered = filtered.filter(p => p.areaId === filterAreaId)
    } else if (cityAreaIds) {
      filtered = filtered.filter(p => p.areaId && cityAreaIds.has(p.areaId))
    }

    if (filterStatus) {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    return filtered
  }, [allProjects, searchQuery, filterDeveloperId, filterAreaId, cityAreaIds, filterStatus])

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
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonInfo}>
                <div className={`${styles.skeletonLine} ${styles.wide}`} />
                <div className={styles.skeletonLine} />
                <div className={`${styles.skeletonLine} ${styles.short}`} />
              </div>
            </div>
          ))}
        </div>
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
          {projectsList.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all projects"
            />
          )}
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
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
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
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
          clearable
          defaultValue=""
        />
        {(searchQuery || filterCityId || filterAreaId || filterDeveloperId || filterStatus) && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearchQuery('')
              setFilterCityId('')
              setFilterAreaId('')
              setFilterDeveloperId('')
              setFilterStatus('')
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
        <div className={styles.grid}>
          {projectsList.map(project => {
            const isSelected = !!project.id && selectedIds.has(project.id)
            const imageUrl = getProjectImageUrl(project)

            return (
              <div
                key={project.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onMouseOver={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(undefined)}
                onClick={() => onEditClick(project)}
              >
                <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => project.id && handleSelectOne(project.id)}
                    aria-label={`Select ${project.name}`}
                  />
                </div>
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <TableActionButtons
                    show={hoveredCardId === project.id}
                    onEdit={() => onEditClick(project)}
                    onDelete={() => project.id && handleDeleteClick([project.id])}
                    deleteLoading={deleteLoading}
                  />
                </div>
                {project.status === 'draft' && (
                  <div className={styles.draftBadge}>Draft</div>
                )}
                {imageUrl ? (
                  <img
                    src={getImageUrl(imageUrl, 'thumbnail')}
                    alt={project.name || 'Project'}
                    className={styles.projectImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.noImage}>No image</div>
                )}
                <div className={styles.cardInfo}>
                  <h3 className={styles.projectName}>{project.name || '-'}</h3>
                  {project.developer?.name && (
                    <div className={styles.projectMeta}>{project.developer.name}</div>
                  )}
                  {(project.area?.name || project.area?.city) && (
                    <div className={styles.projectMeta}>
                      {[project.area?.name, project.area?.city].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <div className={styles.projectTags}>
                    {project.status && <span className={styles.tag}>{project.status}</span>}
                    {project.sale && <span className={styles.tag}>{project.sale}</span>}
                  </div>
                  <div className={styles.projectDate}>
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString('en-US')
                      : '-'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
