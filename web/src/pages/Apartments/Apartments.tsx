import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { useListLots, useListProjects } from '../../api'
import LotCard from '../../components/LotCard'
import { SkeletonCard } from '../../ui/Skeleton'
import { ListLotsSort } from '../../api/generated/schemas/listLotsSort'
import type { ListLotsParams } from '../../api/generated/schemas/listLotsParams'
import type { Lot } from '../../api'
import styles from './Apartments.module.scss'

// =====================================
// SORT OPTIONS
// =====================================

type SortValue = 'default' | ListLotsSort

const ALWAYS_FRESH_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
}

// =====================================
// APARTMENTS PAGE
// =====================================

export default function Apartments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortValue, setSortValue] = useState<SortValue>('default')
  const { t } = useTranslation()

  const sortOptions: Array<{ value: SortValue; label: string }> = useMemo(
    () => [
      { value: 'default', label: t('apartments.sort.default') },
      { value: ListLotsSort.price_asc, label: t('apartments.sort.priceAsc') },
      { value: ListLotsSort.price_desc, label: t('apartments.sort.priceDesc') },
      { value: ListLotsSort.newest, label: t('apartments.sort.newest') },
    ],
    [t]
  )

  // Get project from URL params
  const projectSlug = searchParams.get('project')

  // Get project name for display
  const { data: projectsData } = useListProjects(
    {},
    {
      query: {
        enabled: !!projectSlug,
      },
    }
  )

  const projectName = useMemo(() => {
    if (!projectSlug || !projectsData) return null
    const project = projectsData.find(p => p.slug === projectSlug)
    return project?.name || projectSlug
  }, [projectSlug, projectsData])

  // Prepare API params for lots
  const lotsParams = useMemo((): ListLotsParams => {
    const params: ListLotsParams = {}

    if (projectSlug) params.project = projectSlug

    if (sortValue !== 'default') {
      params.sort = sortValue
    }

    return params
  }, [projectSlug, sortValue])

  // Load lots
  const { data: lotsData, isLoading, error } = useListLots(lotsParams, {
    query: ALWAYS_FRESH_QUERY_OPTIONS,
  })

  const lots = useMemo(() => {
    if (!lotsData?.items) return []
    return lotsData.items as Lot[]
  }, [lotsData])

  const activeLots = lots.filter(lot => lot.status === 'active')

  const handleClearProject = () => {
    searchParams.delete('project')
    setSearchParams(searchParams)
  }

  const handleFavoriteClick = (lotId: string) => {
    console.log('Lot favorite clicked:', lotId)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t('apartments.title')}</h1>
          {projectName && (
            <div className={styles.projectFilter}>
              <span className={styles.projectLabel}>
                {t('apartments.inProject', { name: projectName })}
              </span>
              <Button
                variant="ghost"
                size="xs"
                iconLeft={<X size={14} />}
                onClick={handleClearProject}
                aria-label={t('apartments.clearProject')}
              />
            </div>
          )}
        </div>

        <div className={styles.resultsHeader}>
          <span className={styles.resultsCount}>
            {t('apartments.resultsCount', { count: activeLots.length })}
          </span>
          <div className={styles.sortContainer}>
            <span className={styles.sortLabel}>{t('apartments.sortBy')}</span>
            <Select
              options={sortOptions}
              value={sortValue}
              onChange={value => setSortValue(value as SortValue)}
              placeholder={t('apartments.sortBy')}
              triggerSize="xs"
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} imageHeight={180} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>
              {t('apartments.error', {
                message: error instanceof Error ? error.message : t('apartments.errorUnknown'),
              })}
            </p>
            <button onClick={() => window.location.reload()}>{t('apartments.retry')}</button>
          </div>
        ) : activeLots.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('apartments.empty')}</p>
            {projectSlug && (
              <Button variant="secondary" size="sm" onClick={handleClearProject}>
                {t('apartments.viewAll')}
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {activeLots.map(lot => (
              <LotCard key={lot.id} lot={lot} onFavoriteClick={handleFavoriteClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
