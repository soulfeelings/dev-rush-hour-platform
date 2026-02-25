import { getImageUrl, type ImageVariant } from '../../utils/imageUrl'
import styles from './ImagePreview.module.scss'

type ImagePreviewProps = {
  src: string
  alt: string
  variant?: ImageVariant
}

export function ImagePreview({ src, alt, variant = 'hero' }: ImagePreviewProps) {
  return (
    <div className={styles.imagePreview}>
      <img
        src={getImageUrl(src, variant)}
        alt={alt}
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}
