import { useState, useRef, useMemo } from 'react'
import { Upload } from 'lucide-react'
import { Button, Checkbox, ErrorState, Modal, ModalBody, ModalFooter } from '../../../../ui'
import { useMediaList, useMediaUpload, useMediaUrls } from '../../../../services/media'
import type { MediaItem } from '../../../../services/media'
import { getImageUrl } from '../../../../utils/imageUrl'
import styles from './MediaPicker.module.scss'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

type MediaPickerProps = {
  open: boolean
  onClose: () => void
  onSelect?: (url: string) => void
  multiple?: boolean
  onSelectMultiple?: (urls: string[]) => void
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  onSelectMultiple,
}: MediaPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null
  )

  const { data: mediaList, isLoading, error } = useMediaList({ status: 'ready', limit: 100 })
  const uploadMutation = useMediaUpload()

  const mediaIds = useMemo(() => (mediaList || []).map(m => m.id), [mediaList])
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

  const items: MediaItem[] = mediaList || []

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    e.target.value = ''
    setUploadError(null)

    const invalidType = files.find(f => !ALLOWED_TYPES.includes(f.type))
    if (invalidType) {
      setUploadError(`"${invalidType.name}" is unsupported. Please upload JPEG, PNG, WebP, or GIF.`)
      return
    }
    const tooLarge = files.find(f => f.size > MAX_SIZE)
    if (tooLarge) {
      setUploadError(`"${tooLarge.name}" is too large. Maximum size is 10 MB.`)
      return
    }

    setUploadProgress({ done: 0, total: files.length })
    const errors: string[] = []

    for (const file of files) {
      try {
        await uploadMutation.mutateAsync(file)
        setUploadProgress(prev => (prev ? { ...prev, done: prev.done + 1 } : null))
      } catch (err) {
        errors.push(err instanceof Error ? err.message : `Failed to upload "${file.name}"`)
      }
    }

    setUploadProgress(null)
    if (errors.length > 0) {
      setUploadError(errors.join(' • '))
    }
  }

  const handleSelectOne = (id: string) => {
    if (multiple) {
      const next = new Set(selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setSelectedIds(next)
    } else {
      // Single mode: select immediately and close
      const url = urlMap[id]
      if (url && onSelect) {
        onSelect(url)
        onClose()
      }
    }
  }

  const handleConfirmMultiple = () => {
    if (multiple && onSelectMultiple) {
      const urls = Array.from(selectedIds).map(id => urlMap[id]).filter(Boolean)
      onSelectMultiple(urls)
      setSelectedIds(new Set())
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedIds(new Set())
    setUploadError(null)
    setUploadProgress(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Select Media" size="large">
      <ModalBody>
        <div className={styles.header}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProgress !== null}
            iconLeft={<Upload size={16} />}
            variant="secondary"
            size="sm"
          >
            {uploadProgress
              ? `Uploading ${uploadProgress.done}/${uploadProgress.total}...`
              : 'Upload Images'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
        </div>

        {uploadError && <ErrorState message={uploadError} variant="inline" />}

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonThumb} />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message="Error loading media" onRetry={() => window.location.reload()} variant="inline" />
        ) : items.length === 0 ? (
          <div className={styles.empty}>No media files. Upload an image to get started.</div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => {
              const url = urlMap[item.id]
              const isSelected = selectedIds.has(item.id)

              return (
                <div
                  key={item.id}
                  className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleSelectOne(item.id)}
                >
                  {multiple && (
                    <div
                      className={styles.cardCheckbox}
                      onClick={e => {
                        e.stopPropagation()
                        handleSelectOne(item.id)
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Select ${item.originalName || item.id}`}
                      />
                    </div>
                  )}
                  {url ? (
                    <img
                      src={getImageUrl(url, 'thumbnail')}
                      alt={item.originalName || 'media'}
                      className={styles.thumbnail}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>Loading...</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ModalBody>

      {multiple && (
        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmMultiple}
            disabled={selectedIds.size === 0}
          >
            Select ({selectedIds.size})
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
