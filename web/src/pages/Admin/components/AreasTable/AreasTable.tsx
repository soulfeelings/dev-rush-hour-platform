import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import type { Area } from '../../../../api/generated/schemas/area'
import { TableSkeleton } from '../TableSkeleton'
import { TableActionButtons } from '../TableActionButtons'
import { CachedSection } from '../CachedSection/CachedSection'
import styles from './AreasTable.module.scss'

const { useAdminListAreas } = AdminApi

type AreasTableProps = {
  onNewClick: () => void
  onEditClick: (area: Area) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
  drafts?: Array<{ id: string; displayName: string }>
  onDraftClick?: (id: string) => void
  onDraftDiscard?: (id: string) => void
}

export function AreasTable({ onNewClick, onEditClick, onDelete, deleteLoading, drafts, onDraftClick, onDraftDiscard }: AreasTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [areasToDelete, setAreasToDelete] = useState<string[]>([])
  const {
    data: areas,
    isLoading,
    error,
  } = useAdminListAreas({
    query: { enabled: true },
  })

  const areasList = areas || []

  const handleSelectAll = () => {
    if (selectedIds.size === areasList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(areasList.map(a => a.id).filter((id): id is string => !!id)))
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
    setAreasToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(areasToDelete)
    setDeleteModalOpen(false)
    setAreasToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setAreasToDelete([])
  }

  const isAllSelected = areasList.length > 0 && selectedIds.size === areasList.length
  const isSomeSelected = selectedIds.size > 0

  const getAreaNamesToDelete = () => {
    return areasToDelete.map(id => areasList.find(a => a.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Areas</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', '', 'ID', 'Name', 'Slug', 'City', 'Coordinates', 'Status', 'Created At']}
          columns={[
            { width: '40px' },
            { isActions: true, width: '50px' },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
          ]}
          minWidth="950px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading areas" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      {drafts && drafts.length > 0 && onDraftClick && onDraftDiscard && (
        <CachedSection drafts={drafts} onDraftClick={onDraftClick} onDraftDiscard={onDraftDiscard} />
      )}
      <div className={styles.header}>
        <h2 className={styles.title}>Areas</h2>
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
      {areasList.length === 0 ? (
        <div className={styles.empty}>No areas</div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all areas"
                  />
                </th>
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
                  className={area.id && selectedIds.has(area.id) ? styles.selectedRow : ''}
                >
                  <td className={styles.checkboxCell}>
                    <Checkbox
                      checked={!!area.id && selectedIds.has(area.id)}
                      onChange={() => area.id && handleSelectOne(area.id)}
                      aria-label={`Select ${area.name}`}
                    />
                  </td>
                  <td className={styles.actionsCell}>
                    <TableActionButtons
                      show={hoveredRowId === area.id}
                      onEdit={() => onEditClick(area)}
                      onDelete={() => area.id && handleDeleteClick([area.id])}
                      deleteLoading={deleteLoading}
                    />
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
        </div>
      )}

      <Modal open={deleteModalOpen} onClose={handleCancelDelete} title="Confirm Delete">
        <ModalBody>
          <p>
            Are you sure you want to delete{' '}
            {areasToDelete.length === 1 ? 'this area' : `${areasToDelete.length} areas`}?
          </p>
          <p className={styles.deleteItemNames}>{getAreaNamesToDelete()}</p>
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
