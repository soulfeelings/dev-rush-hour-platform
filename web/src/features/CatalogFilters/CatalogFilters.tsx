import styles from './CatalogFilters.module.scss'
import { useMemo } from 'react'
import { Plane, X, Map, Columns2, LayoutGrid } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFilters, type FilterValues } from '../../contexts'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import { CatalogFiltersSkeleton } from './CatalogFiltersSkeleton'

export type LayoutMode = 'split' | 'map' | 'list'

interface CatalogFiltersProps {
  layoutMode?: LayoutMode
  onLayoutChange?: (mode: LayoutMode) => void
}

export const CatalogFilters = ({ layoutMode = 'split', onLayoutChange }: CatalogFiltersProps) => {
  const { t } = useTranslation()
  const { filters, options, updateFilter, resetFilters, isLoading } = useFilters()

  const propertyTypeOptions = options?.propertyTypes
    ? options.propertyTypes.map(pt => ({ value: pt.value || '', label: pt.label || '' }))
    : [
        { value: 'all', label: t('filters.propertyType.all') },
        { value: 'apartment', label: t('filters.propertyType.apartment') },
      ]

  const priceOptions = options?.priceRanges
    ? options.priceRanges.map(pr => ({ value: pr.value || '', label: pr.label || '' }))
    : [
        { value: 'all', label: t('filters.price.all') },
        { value: '0-1m', label: t('filters.price.under1m') },
        { value: '1-2m', label: t('filters.price.1to2m') },
        { value: '2-5m', label: t('filters.price.2to5m') },
        { value: '5m+', label: t('filters.price.5mPlus') },
      ]

  const bedroomsOptions = options?.bedrooms
    ? options.bedrooms.map(b => ({ value: b.value || '', label: b.label || '' }))
    : [
        { value: 'all', label: t('filters.bedrooms.all') },
        { value: 'studio', label: t('filters.bedrooms.studio') },
        { value: '1', label: t('filters.bedrooms.one') },
        { value: '2', label: t('filters.bedrooms.two') },
        { value: '3', label: t('filters.bedrooms.three') },
        { value: '4+', label: t('filters.bedrooms.fourPlus') },
      ]

  const statusOptions = options?.statuses
    ? options.statuses.map(s => ({ value: s.value || '', label: s.label || '' }))
    : [
        { value: 'all', label: t('filters.status.all') },
        { value: 'ready', label: t('filters.status.ready') },
        { value: 'construction', label: t('filters.status.construction') },
        { value: 'planning', label: t('filters.status.planning') },
      ]

  const cityOptions = options?.cities
    ? [
        { value: '', label: t('filters.location.all') },
        ...options.cities.map(c => ({ value: c.value || '', label: c.label || '' })),
      ]
    : [{ value: '', label: t('filters.location.all') }]

  const activeFilters = useMemo(() => {
    const active: string[] = []
    if (filters.propertyType !== 'all') active.push('propertyType')
    if (filters.priceRange !== 'all') active.push('priceRange')
    if (filters.bedrooms !== 'all') active.push('bedrooms')
    if (filters.status !== 'all') active.push('status')
    return active
  }, [filters])

  const clearAllFilters = () => {
    resetFilters()
  }

  if (isLoading) {
    return <CatalogFiltersSkeleton />
  }

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.filtersBar}>
        <Select
          options={cityOptions}
          value={filters.city || ''}
          onChange={value => updateFilter('city', value || null)}
          placeholder={t('filters.location.all')}
          triggerVariant="primary"
          triggerSize="sm"
          triggerIconLeft={<Plane size={16} />}
          hideChevronRight
        />

        <Select
          options={propertyTypeOptions}
          value={filters.propertyType}
          onChange={value => updateFilter('propertyType', value as FilterValues['propertyType'])}
          placeholder={t('filters.propertyType.placeholder')}
        />

        <Select
          options={priceOptions}
          value={filters.priceRange}
          onChange={value => updateFilter('priceRange', value as FilterValues['priceRange'])}
          placeholder={t('filters.price.placeholder')}
        />

        <Select
          options={bedroomsOptions}
          value={filters.bedrooms}
          onChange={value => updateFilter('bedrooms', value as FilterValues['bedrooms'])}
          placeholder={t('filters.bedrooms.placeholder')}
        />

        <Select
          options={statusOptions}
          value={filters.status}
          onChange={value => updateFilter('status', value as FilterValues['status'])}
          placeholder={t('filters.status.placeholder')}
        />

        <div className={styles.rightActions}>
          {activeFilters.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<X size={14} />}
              onClick={clearAllFilters}
            >
              {t('filters.clearFilters.button')}
            </Button>
          )}

          {/* Layout mode switcher */}
          {onLayoutChange && (
            <div className={styles.layoutSwitcher}>
              <button
                className={`${styles.layoutButton} ${layoutMode === 'map' ? styles.active : ''}`}
                onClick={() => onLayoutChange('map')}
                aria-pressed={layoutMode === 'map'}
                type="button"
                title="Map view"
              >
                <Map size={16} />
              </button>
              <button
                className={`${styles.layoutButton} ${layoutMode === 'split' ? styles.active : ''}`}
                onClick={() => onLayoutChange('split')}
                aria-pressed={layoutMode === 'split'}
                type="button"
                title="Split view"
              >
                <Columns2 size={16} />
              </button>
              <button
                className={`${styles.layoutButton} ${layoutMode === 'list' ? styles.active : ''}`}
                onClick={() => onLayoutChange('list')}
                aria-pressed={layoutMode === 'list'}
                type="button"
                title="List view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
