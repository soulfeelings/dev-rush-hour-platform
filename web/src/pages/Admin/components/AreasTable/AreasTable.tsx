import { AdminApi } from '../../../../api'
import { Button } from '../../../../ui'
import styles from './AreasTable.module.scss'

const { useAdminListAreas } = AdminApi

type AreasTableProps = {
  onNewClick: () => void
}

export function AreasTable({ onNewClick }: AreasTableProps) {
  const {
    data: areas,
    isLoading,
    error,
  } = useAdminListAreas({
    query: { enabled: true },
  })

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (error) {
    return <div className={styles.error}>Error loading areas</div>
  }

  const areasList = areas || []

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Areas</h2>
        <Button onClick={onNewClick}>New</Button>
      </div>
      {areasList.length === 0 ? (
        <div className={styles.empty}>No areas</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>City</th>
              <th>Coordinates</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {areasList.map(area => (
              <tr key={area.id}>
                <td>{area.id}</td>
                <td>{area.name || '-'}</td>
                <td>{area.slug || '-'}</td>
                <td>{area.city || '-'}</td>
                <td>
                  {area.lat && area.lng ? `${area.lat.toFixed(6)}, ${area.lng.toFixed(6)}` : '-'}
                </td>
                <td>{area.status || '-'}</td>
                <td>
                  {area.createdAt ? new Date(area.createdAt).toLocaleDateString('en-US') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
