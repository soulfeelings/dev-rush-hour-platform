import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button } from '../../../../ui'
import type { City } from '../../../../api/generated/schemas/city'
import { TableSkeleton } from '../TableSkeleton'
import styles from './CitiesTable.module.scss'

const { useAdminListCities } = AdminApi

type CitiesTableProps = {
  onNewClick: () => void
  onEditClick: (city: City) => void
}

export function CitiesTable({ onNewClick, onEditClick }: CitiesTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const {
    data: cities,
    isLoading,
    error,
  } = useAdminListCities({
    query: { enabled: true },
  })

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Cities</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', 'ID', 'Name', 'Slug', 'Status', 'Created At']}
          columns={[{ isActions: true, width: '50px' }, {}, {}, {}, {}, {}]}
          minWidth="700px"
        />
      </div>
    )
  }

  if (error) {
    return <div className={styles.error}>Error loading cities</div>
  }

  const citiesList = cities || []

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cities</h2>
        <Button onClick={onNewClick}>New</Button>
      </div>
      {citiesList.length === 0 ? (
        <div className={styles.empty}>No cities</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {citiesList.map(city => (
              <tr
                key={city.id}
                onMouseEnter={() => setHoveredRowId(city.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
              >
                <td className={styles.actionsCell}>
                  {hoveredRowId === city.id && (
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => onEditClick(city)}
                      aria-label="Edit city"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </td>
                <td>{city.id}</td>
                <td>{city.name || '-'}</td>
                <td>{city.slug || '-'}</td>
                <td>{city.status || '-'}</td>
                <td>
                  {city.createdAt ? new Date(city.createdAt).toLocaleDateString('en-US') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
