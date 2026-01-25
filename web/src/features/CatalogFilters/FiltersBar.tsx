import { useMemo } from 'react'
import { Search, SlidersHorizontal, Plane, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFilters, type FilterValues } from '../../contexts'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import styles from './FiltersBar.module.scss'

export default function FiltersBar() {
  const { t } = useTranslation()
  const { filters, options, updateFilter, resetFilters } = useFilters()

  const propertyTypeOptions = options?.propertyTypes
    ? options.propertyTypes.map(pt => ({ value: pt.value || '', label: pt.label || '' }))
    : [
        { value: 'all', label: t('filters.propertyType.all') },
        { value: 'apartment', label: t('filters.propertyType.apartment') },
        { value: 'villa', label: t('filters.propertyType.villa') },
        { value: 'townhouse', label: t('filters.propertyType.townhouse') },
        { value: 'penthouse', label: t('filters.propertyType.penthouse') },
        { value: 'duplex', label: t('filters.propertyType.duplex') },
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

  return (
    <div className={styles.filtersBar}>
      <Button variant="primary" size="sm">
        <Plane size={16} />
        {t('filters.location.dubai')}
      </Button>

      <Button variant="secondary" size="sm">
        <Search size={16} />
        {t('filters.search.button')}
      </Button>

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

      <Button variant="secondary" size="sm" className={styles.moreFiltersButton}>
        <SlidersHorizontal size={16} />
        {t('filters.moreFilters.button')}
        {activeFilters.length > 0 && <span className={styles.badge}>{activeFilters.length}</span>}
      </Button>

      {activeFilters.length > 0 && (
        <button type="button" className={styles.clearButton} onClick={clearAllFilters}>
          {t('filters.clearFilters.button')}
          <X size={14} />
        </button>
      )}
    </div>
  )
}
