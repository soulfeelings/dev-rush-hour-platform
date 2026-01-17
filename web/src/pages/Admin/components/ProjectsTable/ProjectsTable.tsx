import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button } from '../../../../ui'
import type { Project } from '../../../../api/generated/schemas/project'
import { TableSkeleton } from '../TableSkeleton'
import styles from './ProjectsTable.module.scss'

const { useAdminListProjects } = AdminApi

type ProjectsTableProps = {
  onNewClick: () => void
  onEditClick: (project: Project) => void
}

export function ProjectsTable({ onNewClick, onEditClick }: ProjectsTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const {
    data: projects,
    isLoading,
    error,
  } = useAdminListProjects({
    query: { enabled: true },
  })

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Projects</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', 'Image', 'ID', 'Name', 'Slug', 'Status', 'Sale', 'Created At']}
          columns={[
            { isActions: true, width: '50px' },
            { isImage: true, width: '80px' },
            {},
            {},
            {},
            {},
            {},
            {},
          ]}
          minWidth="800px"
        />
      </div>
    )
  }

  if (error) {
    return <div className={styles.error}>Error loading projects</div>
  }

  const projectsList = projects || []

  const getProjectImageUrl = (project: (typeof projectsList)[0]) => {
    if (project.data?.media?.cover?.url) {
      return project.data.media.cover.url
    }
    if (project.data?.media?.gallery && project.data.media.gallery.length > 0) {
      return project.data.media.gallery[0]?.url
    }
    return null
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Projects</h2>
        <Button onClick={onNewClick}>New</Button>
      </div>
      {projectsList.length === 0 ? (
        <div className={styles.empty}>No projects</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
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
              >
                <td className={styles.actionsCell}>
                  {hoveredRowId === project.id && (
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => onEditClick(project)}
                      aria-label="Edit project"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
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
    </div>
  )
}
