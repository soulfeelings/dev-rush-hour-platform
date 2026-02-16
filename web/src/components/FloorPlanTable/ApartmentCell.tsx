import type { Lot } from '../../api'
import { useSettings } from '../../features/Settings/Settings'
import { formatPrice, formatArea } from '../../utils/format'
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
  const { currency, unit } = useSettings()

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
            <span className={styles.areaValue}>{formatArea(lot.areaSqm, unit)}</span>
          </div>
        )}
        {lot.priceFromUs !== undefined && (
          <div className={styles.apartmentPrice}>
            <span className={styles.priceValue}>{formatPrice(lot.priceFromUs, currency)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
