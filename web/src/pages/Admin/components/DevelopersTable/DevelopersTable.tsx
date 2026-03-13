import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import type { Developer } from '../../../../api/generated/schemas/developer'
import { TableActionButtons } from '../TableActionButtons'
import { CachedSection } from '../CachedSection/CachedSection'
import { getImageUrl } from '../../../../utils/imageUrl'
import styles from './DevelopersTable.module.scss'

const { useAdminListDevelopers } = AdminApi

type DevelopersTableProps = {
  onNewClick: () => void
  onEditClick: (developer: Developer) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
  drafts?: Array<{ id: string; displayName: string }>
  onDraftClick?: (id: string) => void
  onDraftDiscard?: (id: string) => void
}

export function DevelopersTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
  drafts,
  onDraftClick,
  onDraftDiscard,
}: DevelopersTableProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [developersToDelete, setDevelopersToDelete] = useState<string[]>([])
  const {
    data: developers,
    isLoading,
    error,
  } = useAdminListDevelopers({
    query: { enabled: true },
  })

  const developersList = developers || []

  const handleSelectAll = () => {
    if (selectedIds.size === developersList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(developersList.map(d => d.id).filter((id): id is string => !!id)))
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
    setDevelopersToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(developersToDelete)
    setDeleteModalOpen(false)
    setDevelopersToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setDevelopersToDelete([])
  }

  const isAllSelected = developersList.length > 0 && selectedIds.size === developersList.length
  const isSomeSelected = selectedIds.size > 0

  const getDeveloperNamesToDelete = () => {
    return developersToDelete
      .map(id => developersList.find(d => d.id === id)?.name || id)
      .join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Developers</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLogo} />
              <div className={`${styles.skeletonLine} ${styles.wide}`} />
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.short}`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading developers" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      {drafts && drafts.length > 0 && onDraftClick && onDraftDiscard && (
        <CachedSection drafts={drafts} onDraftClick={onDraftClick} onDraftDiscard={onDraftDiscard} />
      )}
      <div className={styles.header}>
        <h2 className={styles.title}>Developers</h2>
        <div className={styles.headerActions}>
          {developersList.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all developers"
            />
          )}
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
      {developersList.length === 0 ? (
        <div className={styles.empty}>No developers</div>
      ) : (
        <div className={styles.grid}>
          {developersList.map(developer => {
            const isSelected = !!developer.id && selectedIds.has(developer.id)

            return (
              <div
                key={developer.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onMouseOver={() => setHoveredCardId(developer.id)}
                onMouseLeave={() => setHoveredCardId(undefined)}
                onClick={() => onEditClick(developer)}
              >
                <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => developer.id && handleSelectOne(developer.id)}
                    aria-label={`Select ${developer.name}`}
                  />
                </div>
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <TableActionButtons
                    show={hoveredCardId === developer.id}
                    onEdit={() => onEditClick(developer)}
                    onDelete={() => developer.id && handleDeleteClick([developer.id])}
                    deleteLoading={deleteLoading}
                  />
                </div>
                {developer.logoUrl ? (
                  <img
                    src={getImageUrl(developer.logoUrl!, 'thumbnail')}
                    alt={`${developer.name} logo`}
                    className={styles.logoImage}
                  />
                ) : (
                  <div className={styles.noLogo}>No logo</div>
                )}
                <h3 className={styles.developerName}>{developer.name || '-'}</h3>
                <div className={styles.developerSlug}>{developer.slug || '-'}</div>
                {developer.status && <div className={styles.developerStatus}>{developer.status}</div>}
                <div className={styles.developerDate}>
                  {developer.createdAt
                    ? new Date(developer.createdAt).toLocaleDateString('en-US')
                    : '-'}
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
            {developersToDelete.length === 1
              ? 'this developer'
              : `${developersToDelete.length} developers`}
            ?
          </p>
          <p className={styles.deleteItemNames}>{getDeveloperNamesToDelete()}</p>
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
