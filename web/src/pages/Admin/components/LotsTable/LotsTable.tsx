import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, Modal, ModalBody, ModalFooter } from '../../../../ui'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import { TableSkeleton } from '../TableSkeleton'
import styles from './LotsTable.module.scss'

const { useAdminListLots } = AdminApi

type LotsTableProps = {
  onNewClick: () => void
  onEditClick: (lot: LotListItem) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
}

export function LotsTable({ onNewClick, onEditClick, onDelete, deleteLoading }: LotsTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [lotsToDelete, setLotsToDelete] = useState<string[]>([])
  const {
    data: lotsResponse,
    isLoading,
    error,
  } = useAdminListLots({
    query: { enabled: true },
  })

  const lotsList = lotsResponse?.items || []

  const handleSelectAll = () => {
    if (selectedIds.size === lotsList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(lotsList.map(l => l.id).filter((id): id is string => !!id)))
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
    setLotsToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(lotsToDelete)
    setDeleteModalOpen(false)
    setLotsToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setLotsToDelete([])
  }

  const isAllSelected = lotsList.length > 0 && selectedIds.size === lotsList.length
  const isSomeSelected = selectedIds.size > 0

  const formatPrice = (amount?: number, currency?: string) => {
    if (!amount) return '-'
    const formatted = new Intl.NumberFormat('en-US').format(amount)
    return currency ? `${formatted} ${currency}` : formatted
  }

  const getLotImageUrl = (lot: (typeof lotsList)[0]) => {
    if (lot.data?.media?.cover?.url) {
      return lot.data.media.cover.url
    }
    if (lot.data?.media?.photos && lot.data.media.photos.length > 0) {
      return lot.data.media.photos[0]?.url
    }
    return null
  }

  const getLotNamesToDelete = () => {
    return lotsToDelete
      .map(id => {
        const lot = lotsList.find(l => l.id === id)
        return lot ? `${lot.type || 'Lot'} #${lot.id?.slice(0, 8)}` : id
      })
      .join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Lots</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={[
            '',
            '',
            'Image',
            'ID',
            'Type',
            'Bedrooms',
            'Bathrooms',
            'Area (m²)',
            'Floor',
            'Price',
            'Status',
            'Created At',
          ]}
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
            {},
          ]}
          minWidth="1050px"
        />
      </div>
    )
  }

  if (error) {
    return <div className={styles.error}>Error loading lots</div>
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Lots</h2>
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
      {lotsList.length === 0 ? (
        <div className={styles.empty}>No lots</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all lots"
                />
              </th>
              <th></th>
              <th>Image</th>
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
                className={lot.id && selectedIds.has(lot.id) ? styles.selectedRow : ''}
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={!!lot.id && selectedIds.has(lot.id)}
                    onChange={() => lot.id && handleSelectOne(lot.id)}
                    aria-label={`Select lot ${lot.id}`}
                  />
                </td>
                <td className={styles.actionsCell}>
                  {hoveredRowId === lot.id && (
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => onEditClick(lot)}
                        aria-label="Edit lot"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => lot.id && handleDeleteClick([lot.id])}
                        aria-label="Delete lot"
                        disabled={deleteLoading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
                <td className={styles.imageCell}>
                  {getLotImageUrl(lot) ? (
                    <img
                      src={getLotImageUrl(lot) || ''}
                      alt={`Lot ${lot.id}`}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.noImage}>-</div>
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

      <Modal open={deleteModalOpen} onClose={handleCancelDelete} title="Confirm Delete">
        <ModalBody>
          <p>
            Are you sure you want to delete{' '}
            {lotsToDelete.length === 1 ? 'this lot' : `${lotsToDelete.length} lots`}?
          </p>
          <p className={styles.deleteItemNames}>{getLotNamesToDelete()}</p>
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
