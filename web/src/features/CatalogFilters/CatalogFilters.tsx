import styles from './CatalogFilters.module.scss'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { Plane, X, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFilters, type FilterValues } from '@/contexts'
import { Button } from '@/ui/Button'
import { Select, type SelectOption } from '@/ui/Select'
import { PriceSelect, BedsBathsSelect } from '@/components/Filters'
import { CatalogFiltersSkeleton } from './CatalogFiltersSkeleton'
import type { FilterOption } from '@/api/generated/schemas/filterOption'
import { useDebounce } from '@/hooks'

type FilterConfig = {
  apiOptions: FilterOption[] | undefined
  allLabel: string
  fallback: SelectOption[]
  emptyValue?: string
}

const mapFilterOptions = ({
  apiOptions,
  allLabel,
  fallback,
  emptyValue = 'all',
}: FilterConfig): SelectOption[] => {
  if (!apiOptions) return fallback
  return apiOptions.map(opt => ({
    value: opt.value || '',
    label: opt.value === emptyValue ? allLabel : opt.label || '',
  }))
}

export const CatalogFilters = () => {
  const { t } = useTranslation()
  const { filters, options, updateFilter, resetFilters, isLoading } = useFilters()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Sync debounced search to filters
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilter('search', debouncedSearch)
    }
  }, [debouncedSearch, filters.search, updateFilter])

  // Sync filters.search to local input when URL changes
  useEffect(() => {
    if (filters.search !== searchInput && filters.search !== debouncedSearch) {
      setSearchInput(filters.search)
    }
  }, [filters.search])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true)
  }, [])

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false)
  }, [])

  const filterOptions = useMemo(
    () => ({
      status: mapFilterOptions({
        apiOptions: options?.statuses,
        allLabel: t('filters.status.all'),
        fallback: [
          { value: 'all', label: t('filters.status.all') },
          { value: 'ready', label: t('filters.status.ready') },
          { value: 'construction', label: t('filters.status.construction') },
          { value: 'planning', label: t('filters.status.planning') },
        ],
      }),
      city: mapFilterOptions({
        apiOptions: options?.cities ? [{ value: '', label: '' }, ...options.cities] : undefined,
        allLabel: t('filters.location.all'),
        fallback: [{ value: '', label: t('filters.location.all') }],
        emptyValue: '',
      }),
      area: mapFilterOptions({
        apiOptions: options?.areas ? [{ value: '', label: '' }, ...options.areas] : undefined,
        allLabel: t('filters.area.all'),
        fallback: [{ value: '', label: t('filters.area.all') }],
        emptyValue: '',
      }),
      project: mapFilterOptions({
        apiOptions: options?.projects ? [{ value: '', label: '' }, ...options.projects] : undefined,
        allLabel: t('filters.project.all'),
        fallback: [{ value: '', label: t('filters.project.all') }],
        emptyValue: '',
      }),
      propertyType: mapFilterOptions({
        apiOptions: options?.propertyTypes,
        allLabel: t('filters.propertyType.all'),
        fallback: [
          { value: 'all', label: t('filters.propertyType.all') },
          { value: 'apartment', label: t('filters.propertyType.apartment') },
          { value: 'villa', label: t('filters.propertyType.villa') },
          { value: 'townhouse', label: t('filters.propertyType.townhouse') },
          { value: 'penthouse', label: t('filters.propertyType.penthouse') },
          { value: 'duplex', label: t('filters.propertyType.duplex') },
          { value: 'triplex', label: t('filters.propertyType.triplex') },
        ],
      }),
    }),
    [options, t]
  )

  const hasActiveFilters = useMemo(() => {
    return (
      filters.minPrice !== '' ||
      filters.maxPrice !== '' ||
      filters.bedrooms.length > 0 ||
      filters.bathrooms.length > 0 ||
      filters.status !== 'all' ||
      filters.search !== '' ||
      filters.area !== null ||
      filters.project !== null ||
      filters.propertyType !== 'all'
    )
  }, [filters])

  const handleClearFilters = useCallback(() => {
    setSearchInput('')
    resetFilters()
  }, [resetFilters])

  if (isLoading) {
    return <CatalogFiltersSkeleton />
  }

  return (
    <div className={styles.filtersWrapper}>
      {isSearchFocused && <div className={styles.searchOverlay} onClick={handleSearchBlur} />}
      <div className={styles.filtersBar}>
        <div className={`${styles.searchWrapper} ${isSearchFocused ? styles.searchFocused : ''}`}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder={t('filters.search.placeholder')}
            className={styles.searchInput}
          />
        </div>

        <Select
          options={filterOptions.city}
          value={filters.city || ''}
          onChange={value => updateFilter('city', value || null)}
          placeholder={t('filters.location.all')}
          triggerVariant="primary"
          triggerSize="xs"
          triggerIconLeft={<Plane size={16} />}
          hideChevronRight
        />

        <Select
          options={filterOptions.project}
          value={filters.project || ''}
          onChange={value => updateFilter('project', value || null)}
          placeholder={t('filters.project.all')}
          triggerSize="xs"
          searchable
          clearable
          defaultValue=""
        />

        <Select
          options={filterOptions.area}
          value={filters.area || ''}
          onChange={value => updateFilter('area', value || null)}
          placeholder={t('filters.area.all')}
          triggerSize="xs"
          searchable
          clearable
          defaultValue=""
        />

        <Select
          options={filterOptions.propertyType}
          value={filters.propertyType}
          onChange={value => updateFilter('propertyType', (value || 'all') as FilterValues['propertyType'])}
          placeholder={t('filters.propertyType.all')}
          triggerSize="xs"
          clearable
          defaultValue="all"
        />

        <PriceSelect
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={value => updateFilter('minPrice', value)}
          onMaxPriceChange={value => updateFilter('maxPrice', value)}
          placeholder={t('filters.price.placeholder')}
          size="xs"
          clearable
        />

        <BedsBathsSelect
          bedrooms={filters.bedrooms}
          bathrooms={filters.bathrooms}
          onBedroomsChange={value => updateFilter('bedrooms', value)}
          onBathroomsChange={value => updateFilter('bathrooms', value)}
          placeholder={t('filters.bathrooms.placeholder')}
          size="xs"
          clearable
        />

        <Select
          options={filterOptions.status}
          value={filters.status}
          onChange={value => updateFilter('status', value as FilterValues['status'])}
          placeholder={t('filters.status.placeholder')}
          triggerSize="xs"
          clearable
          defaultValue="all"
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
    </div>
  )
}
