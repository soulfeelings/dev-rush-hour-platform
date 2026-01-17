import { useMemo, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLotDetailRoute } from '../../constants/routes'
import type { Lot } from '../../api'
import { mockLots } from './mockLots'
import { useFloorsData } from './useFloorsData'
import { ApartmentCell } from './ApartmentCell'
import { FloorLabel } from './FloorLabel'
import { ApartmentHeader } from './ApartmentHeader'
import { EmptyCell } from './EmptyCell'
import styles from './FloorPlanTable.module.scss'

interface FloorPlanTableProps {
  lots: Lot[]
}

// Флаг для использования моковых данных (только для разработки)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_LOTS === 'true'

export default function FloorPlanTable({ lots }: FloorPlanTableProps) {
  const navigate = useNavigate()
  const [hoveredApartmentId, setHoveredApartmentId] = useState<string | null>(null)

  // Используем реальные данные или моки (если включен флаг для разработки)
  const displayLots = USE_MOCK_DATA ? mockLots : lots

  const floorsData = useFloorsData(displayLots)

  const maxApartmentsPerFloor = useMemo(() => {
    return Math.max(...floorsData.map(f => f.lots.length), 0)
  }, [floorsData])

  const handleApartmentClick = (lotId: string | undefined) => {
    if (lotId) {
      navigate(getLotDetailRoute(lotId))
    }
  }

  return (
    <div
      className={styles.floorPlanTable}
      style={{
        gridTemplateColumns: `80px repeat(${maxApartmentsPerFloor}, 1fr)`,
      }}
    >
      <div className={styles.floorColumnHeader}>Floor</div>
      {Array.from({ length: maxApartmentsPerFloor }, (_, i) => (
        <ApartmentHeader key={i} index={i} />
      ))}
      {floorsData.map(({ floor, lots: floorLots }) => (
        <Fragment key={`floor-row-${floor}`}>
          <FloorLabel floor={floor} />
          {Array.from({ length: maxApartmentsPerFloor }, (_, index) => {
            const lot = floorLots[index]
            if (!lot) {
              return <EmptyCell key={`empty-${floor}-${index}`} floor={floor} index={index} />
            }
            const apartmentId = lot.id || `apartment-${floor}-${index}`
            const isHovered = hoveredApartmentId === apartmentId

            return (
              <ApartmentCell
                key={apartmentId}
                lot={lot}
                isHovered={isHovered}
                onMouseEnter={() => setHoveredApartmentId(apartmentId)}
                onMouseLeave={() => setHoveredApartmentId(null)}
                onClick={() => handleApartmentClick(lot.id)}
              />
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
