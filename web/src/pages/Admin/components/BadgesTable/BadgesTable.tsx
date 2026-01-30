import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button } from '../../../../ui'
import type { Badge } from '../../../../api/generated/schemas/badge'
import { TableSkeleton } from '../TableSkeleton'
import styles from './BadgesTable.module.scss'

const { useAdminListBadges } = AdminApi

type BadgesTableProps = {
  onNewClick: () => void
  onEditClick: (badge: Badge) => void
}

export function BadgesTable({ onNewClick, onEditClick }: BadgesTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const {
    data: badges,
    isLoading,
    error,
  } = useAdminListBadges({
    query: { enabled: true },
  })

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Badges</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', 'Preview', 'Name', 'Slug', 'Status', 'Sort Order']}
          columns={[{ isActions: true, width: '50px' }, { width: '150px' }, {}, {}, {}, {}]}
          minWidth="700px"
        />
      </div>
    )
  }

  if (error) {
    return <div className={styles.error}>Error loading badges</div>
  }

  const badgesList = badges || []

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Badges</h2>
        <Button onClick={onNewClick}>New</Button>
      </div>
      {badgesList.length === 0 ? (
        <div className={styles.empty}>No badges</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Preview</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Sort Order</th>
            </tr>
          </thead>
          <tbody>
            {badgesList.map(badge => (
              <tr
                key={badge.id}
                onMouseEnter={() => setHoveredRowId(badge.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
              >
                <td className={styles.actionsCell}>
                  {hoveredRowId === badge.id && (
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => onEditClick(badge)}
                      aria-label="Edit badge"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </td>
                <td>
                  <span
                    className={styles.badgePreview}
                    style={{
                      backgroundColor: badge.backgroundColor || '#000',
                      color: badge.textColor || '#fff',
                    }}
                  >
                    {badge.name || 'Badge'}
                  </span>
                </td>
                <td>{badge.name || '-'}</td>
                <td>{badge.slug || '-'}</td>
                <td>{badge.status || '-'}</td>
                <td>{badge.sortOrder ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
