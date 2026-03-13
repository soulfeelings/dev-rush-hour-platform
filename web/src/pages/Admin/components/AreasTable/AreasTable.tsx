import { useState } from 'react'
import { Trash2, MapPin } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import type { Area } from '../../../../api/generated/schemas/area'
import { TableActionButtons } from '../TableActionButtons'
import { CachedSection } from '../CachedSection/CachedSection'
import { MapViewModal } from '../MapViewModal'
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
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [areasToDelete, setAreasToDelete] = useState<string[]>([])
  const [mapModalArea, setMapModalArea] = useState<Area | null>(null)
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
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${styles.skeletonLine} ${styles.wide}`} />
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.short}`} />
              <div className={`${styles.skeletonLine} ${styles.short}`} />
            </div>
          ))}
        </div>
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
        <div className={styles.headerActions}>
          {areasList.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all areas"
            />
          )}
          <h2 className={styles.title}>Areas</h2>
        </div>
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
        <div className={styles.grid}>
          {areasList.map(area => (
            <div
              key={area.id}
              className={`${styles.card}${area.id && selectedIds.has(area.id) ? ` ${styles.selected}` : ''}`}
              onMouseOver={() => setHoveredCardId(area.id)}
              onMouseLeave={() => setHoveredCardId(undefined)}
              onClick={() => onEditClick(area)}
            >
              <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                <Checkbox
                  checked={!!area.id && selectedIds.has(area.id)}
                  onChange={() => area.id && handleSelectOne(area.id)}
                  aria-label={`Select ${area.name}`}
                />
              </div>
              <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                <TableActionButtons
                  show={hoveredCardId === area.id}
                  onEdit={() => onEditClick(area)}
                  onDelete={() => area.id && handleDeleteClick([area.id])}
                  deleteLoading={deleteLoading}
                />
              </div>
              <h3 className={styles.areaName}>{area.name || '-'}</h3>
              <div className={styles.areaSlug}>{area.slug || '-'}</div>
              {area.city && <div className={styles.areaCity}>{area.city}</div>}
              {area.status && <div className={styles.areaStatus}>{area.status}</div>}
              <div className={styles.cardFooter}>
                <div className={styles.areaDate}>
                  {area.createdAt ? new Date(area.createdAt).toLocaleDateString('en-US') : '-'}
                </div>
                {area.data?.boundary?.coordinates ? (
                  <button
                    className={styles.mapButton}
                    onClick={e => {
                      e.stopPropagation()
                      setMapModalArea(area)
                    }}
                  >
                    <MapPin size={14} /> Map
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {mapModalArea && (
        <MapViewModal
          area={mapModalArea}
          onClose={() => setMapModalArea(null)}
        />
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
