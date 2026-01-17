import { useMemo } from 'react'
import { useListLots } from '../../../api'
import LotCard from '../../../components/LotCard'
import { SkeletonCard } from '../../../ui/Skeleton'
import styles from '../Catalog.module.scss'
import type { Lot } from '../../../api'

interface LotsViewProps {
  panelWidth: number
  screenWidth: number
  onFavoriteClick: (lotId: string) => void
  getGridColumns: (catalogWidth: number, screenWidth: number) => number
  enabled?: boolean
}

export default function LotsView({
  panelWidth,
  screenWidth,
  onFavoriteClick,
  getGridColumns,
  enabled = true,
}: LotsViewProps) {
  const {
    data: lotsData,
    isLoading,
    error,
  } = useListLots(
    {},
    {
      query: {
        enabled,
      },
    }
  )

  const lots = useMemo(() => {
    if (!lotsData?.items) return []
    return lotsData.items as Lot[]
  }, [lotsData])

  const activeLots = lots.filter(lot => lot.status === 'active')

  if (isLoading) {
    return (
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${getGridColumns(100 - panelWidth, screenWidth)}, 1fr)`,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} imageHeight={180} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Ошибка загрузки: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    )
  }

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${getGridColumns(100 - panelWidth, screenWidth)}, 1fr)`,
      }}
    >
      {activeLots.map(lot => (
        <LotCard key={lot.id} lot={lot} onFavoriteClick={onFavoriteClick} />
      ))}
    </div>
  )
}
