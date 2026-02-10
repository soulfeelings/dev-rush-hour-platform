import LotCard from '../../../components/LotCard'
import { LotsViewSkeleton } from './LotsViewSkeleton'
import styles from '../Catalog.module.scss'
import type { Lot } from '../../../api'

interface LotsViewProps {
  lots: Lot[]
  isLoading: boolean
  error: unknown
  onFavoriteClick: (lotId: string) => void
}

export default function LotsView({ lots, isLoading, error, onFavoriteClick }: LotsViewProps) {
  const activeLots = lots.filter(lot => lot.status === 'active')

  if (isLoading) {
    return <LotsViewSkeleton />
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
    <div className={styles.lotsGrid}>
      {activeLots.map(lot => (
        <LotCard key={lot.id} lot={lot} onFavoriteClick={onFavoriteClick} />
      ))}
    </div>
  )
}
