import { useMemo, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLotDetailRoute } from '../../constants/routes'
import type { Lot } from '../../api'
import styles from './FloorPlanTable.module.scss'

interface FloorPlanTableProps {
  lots: Lot[]
}

// Моковые данные для тестирования - 9 этажей, по 9 квартир на этаже
const mockLots: Lot[] = [
  // Этаж 9
  {
    id: '1',
    floor: 9,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 85,
    priceAmount: 2500000,
    priceCurrency: 'AED',
  },
  {
    id: '2',
    floor: 9,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 120,
    priceAmount: 3500000,
    priceCurrency: 'AED',
  },
  {
    id: '3',
    floor: 9,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 65,
    priceAmount: 1800000,
    priceCurrency: 'AED',
  },
  {
    id: '4',
    floor: 9,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 150,
    priceAmount: 4500000,
    priceCurrency: 'AED',
  },
  {
    id: '5',
    floor: 9,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 90,
    priceAmount: 2700000,
    priceCurrency: 'AED',
  },
  {
    id: '6',
    floor: 9,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 140,
    priceAmount: 4200000,
    priceCurrency: 'AED',
  },
  {
    id: '7',
    floor: 9,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 70,
    priceAmount: 2000000,
    priceCurrency: 'AED',
  },
  {
    id: '8',
    floor: 9,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 88,
    priceAmount: 2600000,
    priceCurrency: 'AED',
  },
  {
    id: '9',
    floor: 9,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 155,
    priceAmount: 4600000,
    priceCurrency: 'AED',
  },
  // Этаж 8
  {
    id: '10',
    floor: 8,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 87,
    priceAmount: 2550000,
    priceCurrency: 'AED',
  },
  {
    id: '11',
    floor: 8,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 118,
    priceAmount: 3300000,
    priceCurrency: 'AED',
  },
  {
    id: '12',
    floor: 8,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 60,
    priceAmount: 1700000,
    priceCurrency: 'AED',
  },
  {
    id: '13',
    floor: 8,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 160,
    priceAmount: 4800000,
    priceCurrency: 'AED',
  },
  {
    id: '14',
    floor: 8,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 92,
    priceAmount: 2800000,
    priceCurrency: 'AED',
  },
  {
    id: '15',
    floor: 8,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 135,
    priceAmount: 4000000,
    priceCurrency: 'AED',
  },
  {
    id: '16',
    floor: 8,
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 55,
    priceAmount: 1500000,
    priceCurrency: 'AED',
  },
  {
    id: '17',
    floor: 8,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 89,
    priceAmount: 2650000,
    priceCurrency: 'AED',
  },
  {
    id: '18',
    floor: 8,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 165,
    priceAmount: 4900000,
    priceCurrency: 'AED',
  },
  // Этаж 7
  {
    id: '19',
    floor: 7,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 86,
    priceAmount: 2520000,
    priceCurrency: 'AED',
  },
  {
    id: '20',
    floor: 7,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 115,
    priceAmount: 3400000,
    priceCurrency: 'AED',
  },
  {
    id: '21',
    floor: 7,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 68,
    priceAmount: 1850000,
    priceCurrency: 'AED',
  },
  {
    id: '22',
    floor: 7,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 158,
    priceAmount: 4700000,
    priceCurrency: 'AED',
  },
  {
    id: '23',
    floor: 7,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 91,
    priceAmount: 2850000,
    priceCurrency: 'AED',
  },
  {
    id: '24',
    floor: 7,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 142,
    priceAmount: 4100000,
    priceCurrency: 'AED',
  },
  {
    id: '25',
    floor: 7,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 72,
    priceAmount: 2100000,
    priceCurrency: 'AED',
  },
  {
    id: '26',
    floor: 7,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 93,
    priceAmount: 2750000,
    priceCurrency: 'AED',
  },
  {
    id: '27',
    floor: 7,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 162,
    priceAmount: 4850000,
    priceCurrency: 'AED',
  },
  // Этаж 6
  {
    id: '28',
    floor: 6,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 88,
    priceAmount: 2600000,
    priceCurrency: 'AED',
  },
  {
    id: '29',
    floor: 6,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 125,
    priceAmount: 3600000,
    priceCurrency: 'AED',
  },
  {
    id: '30',
    floor: 6,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 70,
    priceAmount: 2000000,
    priceCurrency: 'AED',
  },
  {
    id: '31',
    floor: 6,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 152,
    priceAmount: 4550000,
    priceCurrency: 'AED',
  },
  {
    id: '32',
    floor: 6,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 94,
    priceAmount: 2820000,
    priceCurrency: 'AED',
  },
  {
    id: '33',
    floor: 6,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 138,
    priceAmount: 4050000,
    priceCurrency: 'AED',
  },
  {
    id: '34',
    floor: 6,
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 58,
    priceAmount: 1600000,
    priceCurrency: 'AED',
  },
  {
    id: '35',
    floor: 6,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 90,
    priceAmount: 2700000,
    priceCurrency: 'AED',
  },
  {
    id: '36',
    floor: 6,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 168,
    priceAmount: 5000000,
    priceCurrency: 'AED',
  },
  // Этаж 5
  {
    id: '37',
    floor: 5,
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 45,
    priceAmount: 800000,
    priceCurrency: 'AED',
  },
  {
    id: '38',
    floor: 5,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 95,
    priceAmount: 2900000,
    priceCurrency: 'AED',
  },
  {
    id: '39',
    floor: 5,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 65,
    priceAmount: 1900000,
    priceCurrency: 'AED',
  },
  {
    id: '40',
    floor: 5,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 122,
    priceAmount: 3550000,
    priceCurrency: 'AED',
  },
  {
    id: '41',
    floor: 5,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 96,
    priceAmount: 2920000,
    priceCurrency: 'AED',
  },
  {
    id: '42',
    floor: 5,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 148,
    priceAmount: 4400000,
    priceCurrency: 'AED',
  },
  {
    id: '43',
    floor: 5,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 67,
    priceAmount: 1950000,
    priceCurrency: 'AED',
  },
  {
    id: '44',
    floor: 5,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 92,
    priceAmount: 2780000,
    priceCurrency: 'AED',
  },
  {
    id: '45',
    floor: 5,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 130,
    priceAmount: 3800000,
    priceCurrency: 'AED',
  },
  // Этаж 4
  {
    id: '46',
    floor: 4,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 87,
    priceAmount: 2550000,
    priceCurrency: 'AED',
  },
  {
    id: '47',
    floor: 4,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 118,
    priceAmount: 3300000,
    priceCurrency: 'AED',
  },
  {
    id: '48',
    floor: 4,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 68,
    priceAmount: 1850000,
    priceCurrency: 'AED',
  },
  {
    id: '49',
    floor: 4,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 145,
    priceAmount: 4350000,
    priceCurrency: 'AED',
  },
  {
    id: '50',
    floor: 4,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 89,
    priceAmount: 2630000,
    priceCurrency: 'AED',
  },
  {
    id: '51',
    floor: 4,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 132,
    priceAmount: 3850000,
    priceCurrency: 'AED',
  },
  {
    id: '52',
    floor: 4,
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 52,
    priceAmount: 950000,
    priceCurrency: 'AED',
  },
  {
    id: '53',
    floor: 4,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 91,
    priceAmount: 2730000,
    priceCurrency: 'AED',
  },
  {
    id: '54',
    floor: 4,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 155,
    priceAmount: 4650000,
    priceCurrency: 'AED',
  },
  // Этаж 3
  {
    id: '55',
    floor: 3,
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 50,
    priceAmount: 900000,
    priceCurrency: 'AED',
  },
  {
    id: '56',
    floor: 3,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 89,
    priceAmount: 2650000,
    priceCurrency: 'AED',
  },
  {
    id: '57',
    floor: 3,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 93,
    priceAmount: 2750000,
    priceCurrency: 'AED',
  },
  {
    id: '58',
    floor: 3,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 120,
    priceAmount: 3500000,
    priceCurrency: 'AED',
  },
  {
    id: '59',
    floor: 3,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 66,
    priceAmount: 1920000,
    priceCurrency: 'AED',
  },
  {
    id: '60',
    floor: 3,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 150,
    priceAmount: 4500000,
    priceCurrency: 'AED',
  },
  {
    id: '61',
    floor: 3,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 88,
    priceAmount: 2580000,
    priceCurrency: 'AED',
  },
  {
    id: '62',
    floor: 3,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 128,
    priceAmount: 3750000,
    priceCurrency: 'AED',
  },
  {
    id: '63',
    floor: 3,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 64,
    priceAmount: 1880000,
    priceCurrency: 'AED',
  },
  // Этаж 2
  {
    id: '64',
    floor: 2,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 62,
    priceAmount: 1750000,
    priceCurrency: 'AED',
  },
  {
    id: '65',
    floor: 2,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 122,
    priceAmount: 3550000,
    priceCurrency: 'AED',
  },
  {
    id: '66',
    floor: 2,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 86,
    priceAmount: 2520000,
    priceCurrency: 'AED',
  },
  {
    id: '67',
    floor: 2,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 142,
    priceAmount: 4250000,
    priceCurrency: 'AED',
  },
  {
    id: '68',
    floor: 2,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 90,
    priceAmount: 2680000,
    priceCurrency: 'AED',
  },
  {
    id: '69',
    floor: 2,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 126,
    priceAmount: 3700000,
    priceCurrency: 'AED',
  },
  {
    id: '70',
    floor: 2,
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 48,
    priceAmount: 850000,
    priceCurrency: 'AED',
  },
  {
    id: '71',
    floor: 2,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 87,
    priceAmount: 2560000,
    priceCurrency: 'AED',
  },
  {
    id: '72',
    floor: 2,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 160,
    priceAmount: 4800000,
    priceCurrency: 'AED',
  },
  // Этаж 1
  {
    id: '73',
    floor: 1,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 91,
    priceAmount: 2850000,
    priceCurrency: 'AED',
  },
  {
    id: '74',
    floor: 1,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 64,
    priceAmount: 1880000,
    priceCurrency: 'AED',
  },
  {
    id: '75',
    floor: 1,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 128,
    priceAmount: 3700000,
    priceCurrency: 'AED',
  },
  {
    id: '76',
    floor: 1,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 148,
    priceAmount: 4450000,
    priceCurrency: 'AED',
  },
  {
    id: '77',
    floor: 1,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 92,
    priceAmount: 2800000,
    priceCurrency: 'AED',
  },
  {
    id: '78',
    floor: 1,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 124,
    priceAmount: 3620000,
    priceCurrency: 'AED',
  },
  {
    id: '79',
    floor: 1,
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 46,
    priceAmount: 820000,
    priceCurrency: 'AED',
  },
  {
    id: '80',
    floor: 1,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 89,
    priceAmount: 2640000,
    priceCurrency: 'AED',
  },
  {
    id: '81',
    floor: 1,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 162,
    priceAmount: 4850000,
    priceCurrency: 'AED',
  },
]

export default function FloorPlanTable({ lots }: FloorPlanTableProps) {
  const navigate = useNavigate()
  const [hoveredApartmentId, setHoveredApartmentId] = useState<string | null>(null)

  // Используем моковые данные для тестирования (временно всегда используем моки)
  const displayLots = mockLots ?? lots

  const floorsData = useMemo(() => {
    const floorsMap = new Map<number, Lot[]>()

    displayLots.forEach(lot => {
      const floor = lot.floor ?? 0
      if (!floorsMap.has(floor)) {
        floorsMap.set(floor, [])
      }
      floorsMap.get(floor)!.push(lot)
    })

    const sortedFloors = Array.from(floorsMap.entries()).sort((a, b) => b[0] - a[0])

    return sortedFloors.map(([floor, floorLots]) => ({
      floor,
      lots: floorLots.sort((a, b) => {
        const aBedrooms = a.bedrooms ?? 0
        const bBedrooms = b.bedrooms ?? 0
        if (aBedrooms !== bBedrooms) return aBedrooms - bBedrooms
        const aArea = a.areaSqm ?? 0
        const bArea = b.areaSqm ?? 0
        return aArea - bArea
      }),
    }))
  }, [displayLots])

  const maxApartmentsPerFloor = useMemo(() => {
    return Math.max(...floorsData.map(f => f.lots.length), 0)
  }, [floorsData])

  const handleApartmentClick = (lotId: string | undefined) => {
    if (lotId) {
      navigate(getLotDetailRoute(lotId))
    }
  }

  const formatPrice = (amount: number | undefined, currency: string | undefined) => {
    if (amount === undefined) return { value: '-', currency: '' }
    const currencySymbol = currency || 'AED'
    return {
      value: `${(amount / 1000000).toFixed(1)}M`,
      currency: currencySymbol,
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
        <div key={i} className={styles.apartmentHeader}>
          Apartment {i + 1}
        </div>
      ))}
      {floorsData.map(({ floor, lots: floorLots }) => (
        <Fragment key={`floor-row-${floor}`}>
          <div className={styles.floorLabel}>{floor}</div>
          {Array.from({ length: maxApartmentsPerFloor }, (_, index) => {
            const lot = floorLots[index]
            if (!lot) {
              return <div key={`empty-${floor}-${index}`} className={styles.emptyCell} />
            }
            const apartmentId = lot.id || `apartment-${floor}-${index}`
            const isHovered = hoveredApartmentId === apartmentId

            return (
              <div
                key={apartmentId}
                className={`${styles.apartmentCell} ${isHovered ? styles.hovered : ''}`}
                onClick={() => handleApartmentClick(lot.id)}
                onMouseEnter={() => setHoveredApartmentId(apartmentId)}
                onMouseLeave={() => setHoveredApartmentId(null)}
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
                      <span className={styles.priceValue}>
                        {formatPrice(lot.priceAmount, lot.priceCurrency).value}
                      </span>
                      <span className={styles.priceCurrency}>
                        {formatPrice(lot.priceAmount, lot.priceCurrency).currency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
