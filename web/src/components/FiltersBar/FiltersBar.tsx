import { useState } from 'react'
import { Search, SlidersHorizontal, Plane, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import { Tag } from '../../ui/Tag'
import type { CatalogViewMode } from '../../utils/catalogViewMode'
import styles from './FiltersBar.module.scss'

interface FiltersBarProps {
  viewMode?: CatalogViewMode
  onViewModeChange?: (mode: CatalogViewMode) => void
}

export default function FiltersBar({ viewMode, onViewModeChange }: FiltersBarProps) {
  const { t } = useTranslation()
  const [activeFilters, setActiveFilters] = useState<string[]>(['advancement'])

  const propertyTypeOptions = [
    { value: 'all', label: t('filters.propertyType.all') },
    { value: 'primary', label: t('filters.propertyType.primary') },
    { value: 'secondary', label: t('filters.propertyType.secondary') },
  ]

  const priceOptions = [
    { value: 'all', label: t('filters.price.all') },
    { value: '0-1m', label: t('filters.price.under1m') },
    { value: '1-2m', label: t('filters.price.1to2m') },
    { value: '2-5m', label: t('filters.price.2to5m') },
    { value: '5m+', label: t('filters.price.5mPlus') },
  ]

  const bedroomsOptions = [
    { value: 'all', label: t('filters.bedrooms.all') },
    { value: 'studio', label: t('filters.bedrooms.studio') },
    { value: '1', label: t('filters.bedrooms.one') },
    { value: '2', label: t('filters.bedrooms.two') },
    { value: '3', label: t('filters.bedrooms.three') },
    { value: '4+', label: t('filters.bedrooms.fourPlus') },
  ]

  const statusOptions = [
    { value: 'all', label: t('filters.status.all') },
    { value: 'ready', label: t('filters.status.ready') },
    { value: 'construction', label: t('filters.status.construction') },
    { value: 'planning', label: t('filters.status.planning') },
  ]

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  return (
    <div className={styles.filtersBar}>
      {viewMode && onViewModeChange && (
        <div className={styles.viewModeToggle}>
          <button
            type="button"
            className={`${styles.toggleButton} ${viewMode === 'projects' ? styles.active : ''}`}
            onClick={() => onViewModeChange('projects')}
          >
            Projects
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${viewMode === 'lots' ? styles.active : ''}`}
            onClick={() => onViewModeChange('lots')}
          >
            Lots
          </button>
        </div>
      )}

      <Button variant="primary" size="sm">
        <Plane size={16} />
        {t('filters.location.dubai')}
      </Button>

      <Button variant="secondary" size="sm">
        <Search size={16} />
        {t('filters.search.button')}
      </Button>

      {activeFilters.includes('advancement') && (
        <Tag onRemove={() => removeFilter('advancement')}>{t('filters.advancement.button')}</Tag>
      )}

      <Select
        options={propertyTypeOptions}
        value="all"
        onChange={() => {}}
        placeholder={t('filters.propertyType.placeholder')}
      />

      <Select
        options={priceOptions}
        value="all"
        onChange={() => {}}
        placeholder={t('filters.price.placeholder')}
      />

      <Select
        options={bedroomsOptions}
        value="all"
        onChange={() => {}}
        placeholder={t('filters.bedrooms.placeholder')}
      />

      <Select
        options={statusOptions}
        value="all"
        onChange={() => {}}
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
