import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter, Badge } from '../../../../ui'
import type { Badge as BadgeSchema } from '../../../../api/generated/schemas/badge'
import { TableActionButtons } from '../TableActionButtons'
import { CachedSection } from '../CachedSection/CachedSection'
import styles from './BadgesTable.module.scss'

const { useAdminListBadges } = AdminApi

type BadgesTableProps = {
  onNewClick: () => void
  onEditClick: (badge: BadgeSchema) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
  drafts?: Array<{ id: string; displayName: string }>
  onDraftClick?: (id: string) => void
  onDraftDiscard?: (id: string) => void
}

export function BadgesTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
  drafts,
  onDraftClick,
  onDraftDiscard,
}: BadgesTableProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [badgesToDelete, setBadgesToDelete] = useState<string[]>([])
  const {
    data: badges,
    isLoading,
    error,
  } = useAdminListBadges({
    query: { enabled: true },
  })

  const badgesList = badges || []

  const handleSelectAll = () => {
    if (selectedIds.size === badgesList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(badgesList.map(b => b.id).filter((id): id is string => !!id)))
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
    setBadgesToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete(badgesToDelete)
    setDeleteModalOpen(false)
    setBadgesToDelete([])
    setSelectedIds(new Set())
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setBadgesToDelete([])
  }

  const isAllSelected = badgesList.length > 0 && selectedIds.size === badgesList.length
  const isSomeSelected = selectedIds.size > 0

  const getBadgeNamesToDelete = () => {
    return badgesToDelete.map(id => badgesList.find(b => b.id === id)?.name || id).join(', ')
  }

  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Badges</h2>
          <Button onClick={onNewClick}>New</Button>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
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
    return <ErrorState message="Error loading badges" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      {drafts && drafts.length > 0 && onDraftClick && onDraftDiscard && (
        <CachedSection drafts={drafts} onDraftClick={onDraftClick} onDraftDiscard={onDraftDiscard} />
      )}
      <div className={styles.header}>
        <h2 className={styles.title}>Badges</h2>
        <div className={styles.headerActions}>
          {badgesList.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all badges"
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
      {badgesList.length === 0 ? (
        <div className={styles.empty}>No badges</div>
      ) : (
        <div className={styles.grid}>
          {badgesList.map(badge => {
            const isSelected = !!badge.id && selectedIds.has(badge.id)

            return (
              <div
                key={badge.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onMouseOver={() => setHoveredCardId(badge.id)}
                onMouseLeave={() => setHoveredCardId(undefined)}
                onClick={() => onEditClick(badge)}
              >
                <div className={styles.cardCheckbox} onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => badge.id && handleSelectOne(badge.id)}
                    aria-label={`Select ${badge.name}`}
                  />
                </div>
                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  <TableActionButtons
                    show={hoveredCardId === badge.id}
                    onEdit={() => onEditClick(badge)}
                    onDelete={() => badge.id && handleDeleteClick([badge.id])}
                    deleteLoading={deleteLoading}
                  />
                </div>
                <div className={styles.badgePreview}>
                  <Badge
                    text={badge.name || 'Badge'}
                    backgroundColor={badge.backgroundColor || '#000000'}
                    textColor={badge.textColor || '#FFFFFF'}
                    iconName={badge.icon}
                    iconColor={badge.iconColor}
                    size="small"
                  />
                </div>
                <h3 className={styles.badgeName}>{badge.name || '-'}</h3>
                <div className={styles.badgeSlug}>{badge.slug || '-'}</div>
                <div className={styles.badgeSortOrder}>Order: {badge.sortOrder ?? 0}</div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={deleteModalOpen} onClose={handleCancelDelete} title="Confirm Delete">
        <ModalBody>
          <p>
            Are you sure you want to delete{' '}
            {badgesToDelete.length === 1 ? 'this badge' : `${badgesToDelete.length} badges`}?
          </p>
          <p className={styles.deleteItemNames}>{getBadgeNamesToDelete()}</p>
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
