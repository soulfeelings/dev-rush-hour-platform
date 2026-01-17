import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button } from '../../../../ui'
import type { Area } from '../../../../api/generated/schemas/area'
import { TableSkeleton } from '../TableSkeleton'
import styles from './AreasTable.module.scss'

const { useAdminListAreas } = AdminApi

type AreasTableProps = {
  onNewClick: () => void
  onEditClick: (area: Area) => void
}

export function AreasTable({ onNewClick, onEditClick }: AreasTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const {
    data: areas,
    isLoading,
    error,
  } = useAdminListAreas({
    query: { enabled: true },
  })

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Areas</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', 'ID', 'Name', 'Slug', 'City', 'Coordinates', 'Status', 'Created At']}
          columns={[{ isActions: true, width: '50px' }, {}, {}, {}, {}, {}, {}, {}]}
          minWidth="900px"
        />
      </div>
    )
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
              <th></th>
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
              <tr
                key={area.id}
                onMouseEnter={() => setHoveredRowId(area.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
              >
                <td className={styles.actionsCell}>
                  {hoveredRowId === area.id && (
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => onEditClick(area)}
                      aria-label="Edit area"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </td>
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
