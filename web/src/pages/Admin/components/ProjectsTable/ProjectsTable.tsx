import { AdminApi } from '../../../../api'
import { Button } from '../../../../ui'
import styles from './ProjectsTable.module.scss'

const { useAdminListProjects } = AdminApi

type ProjectsTableProps = {
  onNewClick: () => void
}

export function ProjectsTable({ onNewClick }: ProjectsTableProps) {
  const {
    data: projects,
    isLoading,
    error,
  } = useAdminListProjects({
    query: { enabled: true },
  })

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (error) {
    return <div className={styles.error}>Error loading projects</div>
  }

  const projectsList = projects || []

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
              <tr key={project.id}>
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
