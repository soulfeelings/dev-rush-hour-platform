import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import type { City } from '../../../../api/generated/schemas/city'
import { TableSkeleton } from '../TableSkeleton'
import { TableActionButtons } from '../TableActionButtons'
import { CachedSection } from '../CachedSection/CachedSection'
import styles from './CitiesTable.module.scss'

const { useAdminListCities } = AdminApi

type CitiesTableProps = {
  onNewClick: () => void
  onEditClick: (city: City) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
  drafts?: Array<{ id: string; displayName: string }>
  onDraftClick?: (id: string) => void
  onDraftDiscard?: (id: string) => void
}

export function CitiesTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
  drafts,
  onDraftClick,
  onDraftDiscard,
}: CitiesTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [citiesToDelete, setCitiesToDelete] = useState<string[]>([])
  const {
    data: cities,
    isLoading,
    error,
  } = useAdminListCities({
    query: { enabled: true },
  })

  const citiesList = cities || []

  const handleSelectAll = () => {
    if (selectedIds.size === citiesList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(citiesList.map(c => c.id).filter((id): id is string => !!id)))
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
    setCitiesToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(citiesToDelete)
    setDeleteModalOpen(false)
    setCitiesToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setCitiesToDelete([])
  }

  const isAllSelected = citiesList.length > 0 && selectedIds.size === citiesList.length
  const isSomeSelected = selectedIds.size > 0

  const getCityNamesToDelete = () => {
    return citiesToDelete.map(id => citiesList.find(c => c.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Cities</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <TableSkeleton
          headers={['', '', 'ID', 'Name', 'Slug', 'Created At']}
          columns={[{ width: '40px' }, { isActions: true, width: '50px' }, {}, {}, {}, {}]}
          minWidth="750px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading cities" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      {drafts && drafts.length > 0 && onDraftClick && onDraftDiscard && (
        <CachedSection drafts={drafts} onDraftClick={onDraftClick} onDraftDiscard={onDraftDiscard} />
      )}
      <div className={styles.header}>
        <h2 className={styles.title}>Cities</h2>
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
      {citiesList.length === 0 ? (
        <div className={styles.empty}>No cities</div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all cities"
                  />
                </th>
                <th></th>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {citiesList.map(city => (
                <tr
                  key={city.id}
                  onMouseEnter={() => setHoveredRowId(city.id)}
                  onMouseLeave={() => setHoveredRowId(undefined)}
                  className={city.id && selectedIds.has(city.id) ? styles.selectedRow : ''}
                >
                  <td className={styles.checkboxCell}>
                    <Checkbox
                      checked={!!city.id && selectedIds.has(city.id)}
                      onChange={() => city.id && handleSelectOne(city.id)}
                      aria-label={`Select ${city.name}`}
                    />
                  </td>
                  <td className={styles.actionsCell}>
                    <TableActionButtons
                      show={hoveredRowId === city.id}
                      onEdit={() => onEditClick(city)}
                      onDelete={() => city.id && handleDeleteClick([city.id])}
                      deleteLoading={deleteLoading}
                    />
                  </td>
                  <td>{city.id}</td>
                  <td>{city.name || '-'}</td>
                  <td>{city.slug || '-'}</td>
                  <td>
                    {city.createdAt ? new Date(city.createdAt).toLocaleDateString('en-US') : '-'}
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
            {citiesToDelete.length === 1 ? 'this city' : `${citiesToDelete.length} cities`}?
          </p>
          <p className={styles.deleteItemNames}>{getCityNamesToDelete()}</p>
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
