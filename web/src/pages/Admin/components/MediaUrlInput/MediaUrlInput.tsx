import { Button, Input, ImagePreview, Typography } from '../../../../ui'
import { Image as ImageIcon } from 'lucide-react'
import { ImageUploadButton } from '../ImageUploadButton/ImageUploadButton'
import styles from './MediaUrlInput.module.scss'

type MediaUrlInputProps = {
  label: string
  value: string
  onChange: (url: string) => void
  onBrowse: () => void
  placeholder?: string
  error?: string
}

export function MediaUrlInput({
  label,
  value,
  onChange,
  onBrowse,
  placeholder = 'https://example.com/image.jpg',
  error,
}: MediaUrlInputProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onBrowse}
            iconLeft={<ImageIcon size={16} />}
          >
            Browse
          </Button>
          <ImageUploadButton onUpload={onChange} />
        </div>
      </div>
      <Input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        error={error}
        sublabel={
          <Typography as="p" size="small" color="inherit">
            You can add here a url from the internet
          </Typography>
        }
      />
      {value && <ImagePreview src={value} alt={`${label} preview`} />}
    </div>
  )
}
