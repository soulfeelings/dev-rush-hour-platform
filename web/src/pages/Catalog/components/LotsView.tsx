import { useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LotCard from '../../../components/LotCard'
import { LotsViewSkeleton } from './LotsViewSkeleton'
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
      {filteredLots.map(lot => (
        <LotCard key={lot.id} lot={lot} onFavoriteClick={onFavoriteClick} />
      ))}
    </div>
  )
}
