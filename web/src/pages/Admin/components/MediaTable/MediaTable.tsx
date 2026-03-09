import { useState, useRef, useMemo, useEffect } from 'react'
import { Trash2, Upload, Loader } from 'lucide-react'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { useInfiniteMediaList, useMediaUpload, useMediaUrls, deleteMedia } from '../../../../services/media'
import type { MediaItem } from '../../../../services/media'
import { getImageUrl } from '../../../../utils/imageUrl'
import styles from './MediaTable.module.scss'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

type MediaTableProps = {
  onError?: (msg: string) => void
  onSuccess?: (msg: string) => void
}

export function MediaTable({ onError, onSuccess }: MediaTableProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [idsToDelete, setIdsToDelete] = useState<string[]>([])
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMediaList({ status: 'ready' })
  const uploadMutation = useMediaUpload()

  const items: MediaItem[] = useMemo(
    () => data?.pages.flat() ?? [],
    [data],
  )

  const mediaIds = useMemo(() => items.map(m => m.id), [items])
  const { data: urlsData } = useMediaUrls(mediaIds)

  const urlMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (urlsData?.items) {
      for (const item of urlsData.items) {
        map[item.id] = item.url
      }
    }
    return map
  }, [urlsData])

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so same file can be re-selected
    e.target.value = ''

    if (!ALLOWED_TYPES.includes(file.type)) {
      onError?.('Unsupported file type. Please upload JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > MAX_SIZE) {
      onError?.('File is too large. Maximum size is 10 MB.')
      return
    }

    try {
      await uploadMutation.mutateAsync(file)
      onSuccess?.('Image uploaded successfully!')
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(m => m.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setDeleteLoading(true)
    try {
      for (const id of idsToDelete) {
        await deleteMedia(id)
      }
      onSuccess?.(
        idsToDelete.length === 1
          ? 'Image deleted successfully!'
          : `${idsToDelete.length} images deleted successfully!`,
      )
      setSelectedIds(prev => {
        const next = new Set(prev)
        for (const id of idsToDelete) next.delete(id)
        return next
      })
      refetch()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleteLoading(false)
      setDeleteModalOpen(false)
      setIdsToDelete([])
    }
  }

  const isAllSelected = items.length > 0 && selectedIds.size === items.length
  const isSomeSelected = selectedIds.size > 0

  // --- Loading skeleton ---
  if (isLoading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Media</h2>
          <Button disabled iconLeft={<Upload size={16} />}>Upload</Button>
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonThumb} />
              <div className={styles.skeletonInfo}>
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
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Media</h2>
        </div>
        <ErrorState message="Error loading media" onRetry={() => window.location.reload()} variant="inline" />
      </div>
    )
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Media</h2>
        <div className={styles.headerActions}>
          {items.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all"
            />
          )}
          {isSomeSelected && (
            <Button
              variant="secondary"
              onClick={() => handleDeleteClick(Array.from(selectedIds))}
              iconLeft={<Trash2 size={16} />}
            >
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            iconLeft={<Upload size={16} />}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>No media files. Upload an image to get started.</div>
      ) : (
        <>
          <div className={styles.grid}>
            {items.map(item => {
              const url = urlMap[item.id]
              const isSelected = selectedIds.has(item.id)

              return (
                <div
                  key={item.id}
                  className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                >
                  <div className={styles.cardCheckbox}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectOne(item.id)}
                      aria-label={`Select ${item.originalName || item.id}`}
                    />
                  </div>
                  {url ? (
                    <img
                      src={getImageUrl(url, 'thumbnail')}
                      alt={item.originalName || 'media'}
                      className={styles.thumbnail}
                      loading="lazy"
                      onClick={() => setPreviewUrl(getImageUrl(url, 'hero'))}
                    />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>Loading...</div>
                  )}
                  <div className={styles.cardInfo}>
                    <div className={styles.fileName} title={item.originalName || item.id}>
                      {item.originalName || item.id}
                    </div>
                    <div className={styles.fileMeta}>
                      <span>{formatBytes(item.sizeBytes)}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div ref={sentinelRef} className={styles.sentinel}>
            {isFetchingNextPage && <Loader size={20} className={styles.spinner} />}
          </div>
        </>
      )}

      {previewUrl && (
        <div className={styles.preview} onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} alt="Preview" className={styles.previewImage} />
        </div>
      )}

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete">
        <ModalBody>
          <p>
            Are you sure you want to delete{' '}
            {idsToDelete.length === 1 ? 'this image' : `${idsToDelete.length} images`}?
          </p>
          <p className={styles.deleteWarning}>This action cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
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
