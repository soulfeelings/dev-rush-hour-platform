import { useState, useRef, useMemo } from 'react'
import { Upload } from 'lucide-react'
import { Button, Checkbox, Modal, ModalBody, ModalFooter } from '../../../../ui'
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
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input
    e.target.value = ''
    setUploadError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Unsupported file type. Please upload JPEG, PNG, WebP, or GIF.')
      return
    }
    if (file.size > MAX_SIZE) {
      setUploadError('File is too large. Maximum size is 10 MB.')
      return
    }

    try {
      await uploadMutation.mutateAsync(file)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
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
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Select Media" size="large">
      <ModalBody>
        <div className={styles.header}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            iconLeft={<Upload size={16} />}
            variant="secondary"
            size="sm"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
        </div>

        {uploadError && <div className={styles.error}>{uploadError}</div>}

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonThumb} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorState}>Error loading media</div>
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
