import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { useListLots, useListProjects } from '../../api'
import { useFilters } from '../../contexts'
import LotCard from '../../components/LotCard'
import { SkeletonCard } from '../../ui/Skeleton'
import { LotType } from '../../api/generated/schemas/lotType'
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
  const { filters, updateFilter } = useFilters()
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

  const sortValue = (filters.sort || 'default') as SortValue

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

  // Helper to convert priceRange to min/max values
  const getPriceRange = (priceRange: string): { min?: number; max?: number } => {
    switch (priceRange) {
      case '0-1m':
        return { min: 0, max: 1000000 }
      case '1-2m':
        return { min: 1000000, max: 2000000 }
      case '2-5m':
        return { min: 2000000, max: 5000000 }
      case '5m+':
        return { min: 5000000 }
      default:
        return {}
    }
  }

  // Prepare API params for lots
  const lotsParams = useMemo((): ListLotsParams => {
    const params: ListLotsParams = {}

    // Use project from URL if available
    if (projectSlug) params.project = projectSlug
    if (filters.area) params.area = filters.area

    if (filters.propertyType !== 'all') {
      params.type = filters.propertyType as LotType
    }

    // Send bedrooms as comma-separated string for multi-select
    if (filters.bedrooms.length > 0) {
      params.bedrooms = filters.bedrooms.join(',')
    }

    // Send bathrooms as comma-separated string for multi-select
    if (filters.bathrooms.length > 0) {
      params.bathrooms = filters.bathrooms.join(',')
    }

    if (filters.priceRange !== 'all') {
      const { min, max } = getPriceRange(filters.priceRange)
      if (min !== undefined) params.priceMin = min
      if (max !== undefined) params.priceMax = max
    }

    if (filters.minPrice) {
      const minPriceNum = parseFloat(filters.minPrice)
      if (!isNaN(minPriceNum)) params.priceMin = minPriceNum
    }
    if (filters.maxPrice) {
      const maxPriceNum = parseFloat(filters.maxPrice)
      if (!isNaN(maxPriceNum)) params.priceMax = maxPriceNum
    }

    if (sortValue !== 'default') {
      params.sort = sortValue
    }

    return params
  }, [projectSlug, filters, sortValue])

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
              onChange={value => updateFilter('sort', value)}
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
