import { useState, useMemo } from 'react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter, Select } from '../../../../ui'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import { getImageUrl } from '../../../../utils/imageUrl'
import styles from './LotsTable.module.scss'
import { Copy, Pencil, Trash2, TrashIcon } from 'lucide-react'

const { useAdminListLots, useAdminListProjects } = AdminApi

type LotsTableProps = {
  onNewClick: () => void
  onEditClick: (lot: LotListItem) => void
  onCopyClick: (lot: LotListItem) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
}

export function LotsTable({ onNewClick, onEditClick, onCopyClick, onDelete, deleteLoading }: LotsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [lotsToDelete, setLotsToDelete] = useState<string[]>([])
  const [filterProjectId, setFilterProjectId] = useState<string>('')
  const [filterBedrooms, setFilterBedrooms] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const {
    data: lotsResponse,
    isLoading,
    error,
  } = useAdminListLots({
    query: { enabled: true },
  })

  const { data: projectsData } = useAdminListProjects({
    query: { enabled: true },
  })

  const allLots = lotsResponse?.items || []
  const projects = projectsData || []

  const lotsList = useMemo(() => {
    let filtered = allLots

    if (filterProjectId) {
      filtered = filtered.filter(lot => lot.projectId === filterProjectId)
    }

    if (filterBedrooms) {
      const bedroomsNum = parseInt(filterBedrooms, 10)
      filtered = filtered.filter(lot => lot.bedrooms === bedroomsNum)
    }

    if (filterStatus) {
      filtered = filtered.filter(lot => lot.status === filterStatus)
    }

    return filtered
  }, [allLots, filterProjectId, filterBedrooms, filterStatus])

  const bedroomOptions = useMemo(() => {
    const uniqueBedrooms = new Set<number>()
    allLots.forEach(lot => {
      if (lot.bedrooms !== undefined && lot.bedrooms !== null) {
        uniqueBedrooms.add(lot.bedrooms)
      }
    })
    return Array.from(uniqueBedrooms).sort((a, b) => a - b)
  }, [allLots])

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
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonInfo}>
                <div className={`${styles.skeletonLine} ${styles.wide}`} />
                <div className={styles.skeletonLine} />
                <div className={`${styles.skeletonLine} ${styles.short}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading lots" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Lots</h2>
        <div className={styles.headerActions}>
          <Checkbox
            checked={isAllSelected}
            onChange={handleSelectAll}
            aria-label="Select all lots"
          />
          {isSomeSelected && (
            <Button
              variant="secondary"
              onClick={() => handleDeleteClick(Array.from(selectedIds))}
              disabled={deleteLoading}
              iconLeft={<TrashIcon size={16} />}
            >
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={onNewClick}>New</Button>
        </div>
      </div>

      <div className={styles.filters}>
        <Select
          options={[
            { value: '', label: 'All Projects' },
            ...projects.map(p => ({ value: p.id || '', label: p.name || '' })),
          ]}
          value={filterProjectId}
          onChange={setFilterProjectId}
          clearable
          defaultValue=""
        />
        <Select
          options={[
            { value: '', label: 'All Bedrooms' },
            ...bedroomOptions.map(b => ({ value: String(b), label: `${b} BR` })),
          ]}
          value={filterBedrooms}
          onChange={setFilterBedrooms}
          clearable
          defaultValue=""
        />
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'hidden', label: 'Hidden' },
            { value: 'reserved', label: 'Reserved' },
            { value: 'sold', label: 'Sold' },
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
          clearable
          defaultValue=""
        />
        {(filterProjectId || filterBedrooms || filterStatus) && (
          <Button
            variant="secondary"
            onClick={() => {
              setFilterProjectId('')
              setFilterBedrooms('')
              setFilterStatus('')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {lotsList.length === 0 ? (
        <div className={styles.empty}>
          {allLots.length === 0 ? 'No lots' : 'No lots match the selected filters'}
        </div>
      ) : (
        <div className={styles.grid}>
          {lotsList.map(lot => {
            const isSelected = !!lot.id && selectedIds.has(lot.id)
            const imageUrl = getLotImageUrl(lot)
            return (
              <div
                key={lot.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={() => onEditClick(lot)}
              >
                <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => lot.id && handleSelectOne(lot.id)}
                    aria-label={`Select lot ${lot.id}`}
                  />
                </div>
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <button type="button" className={styles.actionBtn} onClick={() => onEditClick(lot)} aria-label="Edit">
                    <Pencil size={15} />
                    <span>Edit</span>
                  </button>
                  <button type="button" className={styles.actionBtn} onClick={() => onCopyClick(lot)} aria-label="Copy">
                    <Copy size={15} />
                    <span>Copy</span>
                  </button>
                  <button type="button" className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => lot.id && handleDeleteClick([lot.id])} aria-label="Delete" disabled={deleteLoading}>
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </div>
                {lot.status === 'draft' && (
                  <div className={styles.draftBadge}>Draft</div>
                )}
                {imageUrl ? (
                  <img
                    src={getImageUrl(imageUrl, 'thumbnail')}
                    alt={`Lot ${lot.id}`}
                    className={styles.lotImage}
                  />
                ) : (
                  <div className={styles.noImage}>No image</div>
                )}
                <div className={styles.cardInfo}>
                  <div className={styles.lotHeader}>
                    <h3 className={styles.lotTitle}>{lot.type || 'Lot'}</h3>
                    <span className={styles.lotStatus}>{lot.status || '-'}</span>
                  </div>
                  <div className={styles.lotProject}>{lot.project?.name || '-'}</div>

                  <div className={styles.lotDetails}>
                    <div className={styles.detailRow}>
                      {lot.bedrooms != null && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Beds</span>
                          <span className={styles.detailValue}>{lot.bedrooms}</span>
                        </div>
                      )}
                      {lot.bathrooms != null && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Baths</span>
                          <span className={styles.detailValue}>{lot.bathrooms}</span>
                        </div>
                      )}
                      {lot.areaSqft != null && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Area</span>
                          <span className={styles.detailValue}>{lot.areaSqft} ft²</span>
                        </div>
                      )}
                      {lot.floor != null && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Floor</span>
                          <span className={styles.detailValue}>{lot.floor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.lotPricing}>
                    <div className={styles.priceMain}>
                      <span className={styles.priceLabel}>Price</span>
                      <span className={styles.priceValue}>{formatPrice(lot.priceFromUs, 'AED')}</span>
                    </div>
                    {lot.priceFromDeveloper != null && (
                      <div className={styles.priceSub}>
                        <span className={styles.priceLabel}>Dev price</span>
                        <span className={styles.priceSubValue}>{formatPrice(lot.priceFromDeveloper, 'AED')}</span>
                      </div>
                    )}
                    {lot.roi != null && (
                      <div className={styles.priceSub}>
                        <span className={styles.priceLabel}>ROI</span>
                        <span className={styles.roiValue}>{lot.roi}%</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.lotDate}>
                    {lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('en-US') : '-'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
