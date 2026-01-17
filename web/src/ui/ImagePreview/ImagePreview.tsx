import styles from './ImagePreview.module.scss'

type ImagePreviewProps = {
  src: string
  alt: string
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <div className={styles.imagePreview}>
      <img
        src={src}
        alt={alt}
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}
