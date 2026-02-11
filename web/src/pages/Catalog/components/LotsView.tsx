import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const activeLots = lots.filter(lot => lot.status === 'active')

  if (isLoading) {
    return <LotsViewSkeleton />
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>
          {t('error.loadingError', {
            message: error instanceof Error ? error.message : t('error.unknownError'),
          })}
        </p>
        <button onClick={() => window.location.reload()}>{t('error.retry')}</button>
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
