import type { Property } from '../../../data/mockProperties'
import styles from './MarkerPopup.module.scss'

interface MarkerPopupProps {
  property: Property
}

export default function MarkerPopup({ property }: MarkerPopupProps) {
  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <div className={styles.imageContainer}>
          <img src={property.image} alt={property.title} />
        </div>
        <div className={styles.textContent}>
          <p className={styles.title}>{property.title}</p>
          <p className={styles.developer}>{property.developer}</p>
        </div>
      </div>
    </div>
  )
}
