import LotCard from '../../../components/LotCard'
import { SkeletonCard } from '../../../ui/Skeleton'
import styles from '../Catalog.module.scss'
import type { Lot } from '../../../api'

interface LotsViewProps {
  panelWidth: number
  screenWidth: number
  onFavoriteClick: (lotId: string) => void
  getGridColumns: (catalogWidth: number, screenWidth: number) => number
  lots: Lot[]
  isLoading: boolean
  error: unknown
}

export default function LotsView({
  panelWidth,
  screenWidth,
  onFavoriteClick,
  getGridColumns,
  lots,
  isLoading,
  error,
}: LotsViewProps) {
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
        <p>Loading error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
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
