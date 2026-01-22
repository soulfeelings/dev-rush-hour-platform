import type { Lot } from '../../api'
import { formatPrice } from './formatPrice'
import styles from './FloorPlanTable.module.scss'

interface ApartmentCellProps {
  lot: Lot
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

export const ApartmentCell = ({
  lot,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ApartmentCellProps) => {
  const price = formatPrice(lot.priceAmount, lot.priceCurrency)

  return (
    <div
      className={`${styles.apartmentCell} ${isHovered ? styles.hovered : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: lot.id ? 'pointer' : 'default' }}
    >
      <div className={styles.apartmentInfo}>
        {lot.bedrooms !== undefined && lot.bedrooms !== null && (
          <div className={styles.apartmentType}>
            {lot.bedrooms === 0 ? 'Studio' : `${lot.bedrooms}BR`}
          </div>
        )}
        {lot.areaSqm !== undefined && lot.areaSqm !== null && (
          <div className={styles.apartmentArea}>
            <span className={styles.areaValue}>{lot.areaSqm}</span>
            <span className={styles.areaUnit}>m²</span>
          </div>
        )}
        {lot.priceAmount !== undefined && (
          <div className={styles.apartmentPrice}>
            <span className={styles.priceValue}>{price.value}</span>
            <span className={styles.priceCurrency}>{price.currency}</span>
          </div>
        )}
      </div>
    </div>
  )
}
