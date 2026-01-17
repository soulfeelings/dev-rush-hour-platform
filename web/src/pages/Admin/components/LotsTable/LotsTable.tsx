import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button } from '../../../../ui'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import styles from './LotsTable.module.scss'

const { useAdminListLots } = AdminApi

type LotsTableProps = {
  onNewClick: () => void
  onEditClick: (lot: LotListItem) => void
}

export function LotsTable({ onNewClick, onEditClick }: LotsTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const {
    data: lotsResponse,
    isLoading,
    error,
  } = useAdminListLots({
    query: { enabled: true },
  })

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (error) {
    return <div className={styles.error}>Error loading lots</div>
  }

  const lotsList = lotsResponse?.items || []

  const formatPrice = (amount?: number, currency?: string) => {
    if (!amount) return '-'
    const formatted = new Intl.NumberFormat('en-US').format(amount)
    return currency ? `${formatted} ${currency}` : formatted
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Lots</h2>
        <Button onClick={onNewClick}>New</Button>
      </div>
      {lotsList.length === 0 ? (
        <div className={styles.empty}>No lots</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Type</th>
              <th>Bedrooms</th>
              <th>Bathrooms</th>
              <th>Area (m²)</th>
              <th>Floor</th>
              <th>Price</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {lotsList.map(lot => (
              <tr
                key={lot.id}
                onMouseEnter={() => setHoveredRowId(lot.id)}
                onMouseLeave={() => setHoveredRowId(undefined)}
              >
                <td className={styles.actionsCell}>
                  {hoveredRowId === lot.id && (
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => onEditClick(lot)}
                      aria-label="Edit lot"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </td>
                <td>{lot.id}</td>
                <td>{lot.type || '-'}</td>
                <td>{lot.bedrooms ?? '-'}</td>
                <td>{lot.bathrooms ?? '-'}</td>
                <td>{lot.areaSqm ?? '-'}</td>
                <td>{lot.floor ?? '-'}</td>
                <td>{formatPrice(lot.priceAmount, lot.priceCurrency)}</td>
                <td>{lot.status || '-'}</td>
                <td>{lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('en-US') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
