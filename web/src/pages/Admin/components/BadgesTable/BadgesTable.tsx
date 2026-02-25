import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AdminApi } from '../../../../api'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter, Badge } from '../../../../ui'
import type { Badge as BadgeSchema } from '../../../../api/generated/schemas/badge'
import { TableSkeleton } from '../TableSkeleton'
import { TableActionButtons } from '../TableActionButtons'
import styles from './BadgesTable.module.scss'

const { useAdminListBadges } = AdminApi

type BadgesTableProps = {
  onNewClick: () => void
  onEditClick: (badge: BadgeSchema) => void
  onDelete: (ids: string[]) => void
  deleteLoading?: boolean
}

export function BadgesTable({
  onNewClick,
  onEditClick,
  onDelete,
  deleteLoading,
}: BadgesTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | undefined>(undefined)
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
        <TableSkeleton
          headers={['', '', 'Preview', 'Name', 'Slug', 'Status', 'Sort Order']}
          columns={[
            { width: '40px' },
            { isActions: true, width: '50px' },
            { width: '150px' },
            {},
            {},
            {},
            {},
          ]}
          minWidth="750px"
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="Error loading badges" onRetry={() => window.location.reload()} variant="inline" />
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Badges</h2>
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
      {badgesList.length === 0 ? (
        <div className={styles.empty}>No badges</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all badges"
                />
              </th>
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
                className={badge.id && selectedIds.has(badge.id) ? styles.selectedRow : ''}
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={!!badge.id && selectedIds.has(badge.id)}
                    onChange={() => badge.id && handleSelectOne(badge.id)}
                    aria-label={`Select ${badge.name}`}
                  />
                </td>
                <td className={styles.actionsCell}>
                  <TableActionButtons
                    show={hoveredRowId === badge.id}
                    onEdit={() => onEditClick(badge)}
                    onDelete={() => badge.id && handleDeleteClick([badge.id])}
                    deleteLoading={deleteLoading}
                  />
                </td>
                <td>
                  <Badge
                    text={badge.name || 'Badge'}
                    backgroundColor={badge.backgroundColor || '#000000'}
                    textColor={badge.textColor || '#FFFFFF'}
                    iconName={badge.icon}
                    iconColor={badge.iconColor}
                    size="small"
                  />
                </td>
                <td>{badge.name || '-'}</td>
                <td>{badge.slug || '-'}</td>
                <td>{badge.sortOrder ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
