import { useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LotCard from '../../../components/LotCard'
import { LotsViewSkeleton } from './LotsViewSkeleton'
import { ErrorState } from '../../../ui'
import styles from '../Catalog.module.scss'
import type { Lot } from '../../../api'
import type { FilterValues } from '../../../contexts'
import { filterAndSortLots } from '../../../utils/lotFilters'

interface LotsViewProps {
  lots: Lot[]
  filters: FilterValues
  isLoading: boolean
  error: unknown
  onFavoriteClick: (lotId: string) => void
  setDisplayedCount: (count: number) => void
}

export default function LotsView({
  lots,
  filters,
  isLoading,
  error,
  onFavoriteClick,
  setDisplayedCount,
}: LotsViewProps) {
  const { t } = useTranslation()

  const filteredLots = useMemo(() => filterAndSortLots(lots, filters), [lots, filters])

  useEffect(() => {
    setDisplayedCount(filteredLots.length)
  }, [filteredLots.length, setDisplayedCount])

  if (isLoading) {
    return <LotsViewSkeleton />
  }

  if (error) {
    const msg = error instanceof Error ? error.message : undefined
    return (
      <ErrorState
        title={t(msg?.toLowerCase().includes('fetch') ? 'error.titleNetwork' : 'error.title')}
        message={t('error.loadingError', { message: msg || t('error.unknownError') })}
        onRetry={() => window.location.reload()}
        retryLabel={t('error.retry')}
      />
    )
  }

  return (
    <div className={styles.lotsGrid}>
      {filteredLots.map(lot => (
        <LotCard key={lot.id} lot={lot} onFavoriteClick={onFavoriteClick} />
      ))}
    </div>
  )
}
