import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '../../../../ui'
import { useMediaUpload } from '../../../../services/media'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

type ImageUploadButtonProps = {
  onUpload: (url: string) => void
  multiple?: boolean
  onUploadMultiple?: (urls: string[]) => void
  disabled?: boolean
}

export function ImageUploadButton({
  onUpload,
  multiple = false,
  onUploadMultiple,
  disabled = false,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const uploadMutation = useMediaUpload()

  const handleClick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    setError(null)

    const invalidType = files.find(f => !ALLOWED_TYPES.includes(f.type))
    if (invalidType) {
      setError('Only JPEG, PNG, WebP, and GIF files are allowed')
      return
    }

    const tooLarge = files.find(f => f.size > MAX_SIZE)
    if (tooLarge) {
      setError('File size must be 10 MB or less')
      return
    }

    try {
      if (multiple && onUploadMultiple) {
        const results = await Promise.all(files.map(f => uploadMutation.mutateAsync(f)))
        onUploadMultiple(results.map(r => r.url))
      } else {
        const result = await uploadMutation.mutateAsync(files[0])
        onUpload(result.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleClick}
        disabled={disabled || uploadMutation.isPending}
        iconLeft={<Upload size={16} />}
      >
        {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
      </Button>
      {error && (
        <span style={{ display: 'block', color: 'var(--color-error, #e53e3e)', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  )
}
