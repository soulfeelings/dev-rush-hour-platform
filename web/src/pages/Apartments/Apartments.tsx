import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { PriceSelect, BedsBathsSelect } from '../../components/Filters'
import { useListLots, useGetFilterOptions, useListAreas } from '../../api'
import LotCard, { LotCardSkeleton } from '../../components/LotCard'
import { ErrorState } from '../../ui'
import { ListLotsSort } from '../../api/generated/schemas/listLotsSort'
import type { ListLotsParams } from '../../api/generated/schemas/listLotsParams'
import type { LotType } from '../../api/generated/schemas/lotType'
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
  const { t } = useTranslation()

  // Filter state — each initialized from URL params
  const [city, setCity] = useState<string | null>(() => searchParams.get('city'))
  const [area, setArea] = useState<string | null>(() => searchParams.get('area'))
  const [project, setProject] = useState<string | null>(() => searchParams.get('project'))
  const [propertyType, setPropertyType] = useState<string | null>(() => searchParams.get('type'))
  const [bedrooms, setBedrooms] = useState<string[]>(() => {
    const val = searchParams.get('bedrooms')
    return val ? val.split(',') : []
  })
  const [bathrooms, setBathrooms] = useState<string[]>(() => {
    const val = searchParams.get('bathrooms')
    return val ? val.split(',') : []
  })
  const [minPrice, setMinPrice] = useState(() => searchParams.get('priceMin') || '')
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('priceMax') || '')
  const [sortValue, setSortValue] = useState<SortValue>(
    () => (searchParams.get('sort') as SortValue) || 'default'
  )

  // Sync state → URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (area) params.set('area', area)
    if (project) params.set('project', project)
    if (propertyType) params.set('type', propertyType)
    if (bedrooms.length > 0) params.set('bedrooms', bedrooms.join(','))
    if (bathrooms.length > 0) params.set('bathrooms', bathrooms.join(','))
    if (minPrice) params.set('priceMin', minPrice)
    if (maxPrice) params.set('priceMax', maxPrice)
    if (sortValue !== 'default') params.set('sort', sortValue)
    setSearchParams(params, { replace: true })
  }, [city, area, project, propertyType, bedrooms, bathrooms, minPrice, maxPrice, sortValue, setSearchParams])

  const sortOptions: Array<{ value: SortValue; label: string }> = useMemo(
    () => [
      { value: 'default', label: t('apartments.sort.default') },
      { value: ListLotsSort.price_asc, label: t('apartments.sort.priceAsc') },
      { value: ListLotsSort.price_desc, label: t('apartments.sort.priceDesc') },
      { value: ListLotsSort.newest, label: t('apartments.sort.newest') },
    ],
    [t]
  )

  // Filter options from API
  const { data: filterOptions } = useGetFilterOptions()

  // Area options with city cascading
  const { data: allAreas } = useListAreas()

  const areaOptions = useMemo(() => {
    if (!allAreas) return []
    let filtered = allAreas.filter(a => !a.deletedAt)
    if (city) {
      filtered = filtered.filter(a => a.city === city)
    }
    return filtered.map(a => ({ value: a.slug || '', label: a.name || '' }))
  }, [allAreas, city])

  // City options
  const cityOptions = useMemo(() => {
    if (!filterOptions?.cities) return []
    return [
      { value: '', label: t('filters.location.all') },
      ...filterOptions.cities.map(c => ({ value: c.value || '', label: c.label || '' })),
    ]
  }, [filterOptions?.cities, t])

  // Project options
  const projectOptions = useMemo(() => {
    if (!filterOptions?.projects) return []
    return [
      { value: '', label: t('filters.project.all') },
      ...filterOptions.projects.map(p => ({ value: p.value || '', label: p.label || '' })),
    ]
  }, [filterOptions?.projects, t])

  // Property type options
  const propertyTypeOptions = useMemo(() => {
    if (!filterOptions?.propertyTypes) return [
      { value: '', label: t('filters.propertyType.all') },
    ]
    return [
      { value: '', label: t('filters.propertyType.all') },
      ...filterOptions.propertyTypes
        .filter(pt => pt.value !== 'all')
        .map(pt => ({ value: pt.value || '', label: pt.label || '' })),
    ]
  }, [filterOptions?.propertyTypes, t])

  // Area select options with "All" prefix
  const areaSelectOptions = useMemo(() => {
    return [
      { value: '', label: t('filters.area.all') },
      ...areaOptions,
    ]
  }, [areaOptions, t])

  // Prepare API params for lots
  const lotsParams = useMemo((): ListLotsParams => {
    const params: ListLotsParams = {}
    if (area) params.area = area
    if (project) params.project = project
    if (propertyType) params.type = propertyType as LotType
    if (bedrooms.length > 0) params.bedrooms = bedrooms.join(',')
    if (bathrooms.length > 0) params.bathrooms = bathrooms.join(',')
    if (minPrice) {
      const val = parseFloat(minPrice)
      if (!isNaN(val)) params.priceMin = val
    }
    if (maxPrice) {
      const val = parseFloat(maxPrice)
      if (!isNaN(val)) params.priceMax = val
    }
    if (sortValue !== 'default') params.sort = sortValue
    return params
  }, [area, project, propertyType, bedrooms, bathrooms, minPrice, maxPrice, sortValue])

  // Load lots
  const { data: lotsData, isLoading, error } = useListLots(lotsParams, {
    query: ALWAYS_FRESH_QUERY_OPTIONS,
  })

  const lots = useMemo(() => {
    if (!lotsData?.items) return []
    return lotsData.items as Lot[]
  }, [lotsData])

  const activeLots = lots.filter(lot => lot.status === 'active')

  // Cascade: city change resets area and project
  const handleCityChange = (value: string) => {
    setCity(value || null)
    setArea(null)
    setProject(null)
  }

  const hasActiveFilters = useMemo(() => {
    return !!(
      city ||
      area ||
      project ||
      propertyType ||
      bedrooms.length > 0 ||
      bathrooms.length > 0 ||
      minPrice ||
      maxPrice
    )
  }, [city, area, project, propertyType, bedrooms, bathrooms, minPrice, maxPrice])

  const handleClearFilters = () => {
    setCity(null)
    setArea(null)
    setProject(null)
    setPropertyType(null)
    setBedrooms([])
    setBathrooms([])
    setMinPrice('')
    setMaxPrice('')
  }

  const handleFavoriteClick = (lotId: string) => {
    console.log('Lot favorite clicked:', lotId)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filtersBar}>
          <Select
            options={cityOptions}
            value={city || ''}
            onChange={value => handleCityChange(value)}
            placeholder={t('filters.location.all')}
            triggerSize="xs"
          />
          <Select
            options={areaSelectOptions}
            value={area || ''}
            onChange={value => setArea(value || null)}
            placeholder={t('filters.area.all')}
            triggerSize="xs"
            searchable
            clearable
            defaultValue=""
          />
          <Select
            options={projectOptions}
            value={project || ''}
            onChange={value => setProject(value || null)}
            placeholder={t('filters.project.all')}
            triggerSize="xs"
            searchable
            clearable
            defaultValue=""
          />
          <Select
            options={propertyTypeOptions}
            value={propertyType || ''}
            onChange={value => setPropertyType(value || null)}
            placeholder={t('filters.propertyType.all')}
            triggerSize="xs"
            clearable
            defaultValue=""
          />
          <BedsBathsSelect
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            onBedroomsChange={setBedrooms}
            onBathroomsChange={setBathrooms}
            placeholder={t('filters.bathrooms.placeholder')}
            size="xs"
            clearable
          />
          <PriceSelect
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            placeholder={t('filters.price.placeholder')}
            size="xs"
            clearable
          />
          <div className={styles.rightActions}>
            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="xs"
                iconLeft={<X size={14} />}
                onClick={handleClearFilters}
              >
                {t('filters.clearFilters.button')}
              </Button>
            )}
          </div>
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
            {Array.from({ length: 6 }).map((_, i) => (
              <LotCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title={t(error instanceof Error && error.message?.toLowerCase().includes('fetch') ? 'error.titleNetwork' : 'error.title')}
            message={error instanceof Error ? error.message : t('error.unknownError')}
            onRetry={() => window.location.reload()}
            retryLabel={t('error.retry')}
          />
        ) : activeLots.length === 0 ? (
          <div className={styles.empty}>
            <p>{t('apartments.empty')}</p>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={handleClearFilters}>
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
