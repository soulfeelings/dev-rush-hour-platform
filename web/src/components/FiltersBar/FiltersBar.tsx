import { Search, Filter, Plane } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import styles from './FiltersBar.module.scss'

export default function FiltersBar() {
  const { t } = useTranslation()

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
  return (
    <div className={styles.filtersBar}>
      <Button variant="secondary" size="sm" className={styles.locationButton}>
        <Plane size={16} />
        {t('filters.location.dubai')}
      </Button>
      <button className={styles.searchButton} type="button">
        <Search size={18} />
        {t('filters.search.button')}
      </button>
      <button className={styles.filterButton} type="button">
        {t('filters.advancement.button')}
      </button>
      <div className={styles.selectWrapper}>
        <Select
          options={propertyTypeOptions}
          value="all"
          onChange={() => {}}
          placeholder={t('filters.propertyType.placeholder')}
        />
      </div>
      <div className={styles.selectWrapper}>
        <Select
          options={priceOptions}
          value="all"
          onChange={() => {}}
          placeholder={t('filters.price.placeholder')}
        />
      </div>
      <div className={styles.selectWrapper}>
        <Select
          options={bedroomsOptions}
          value="all"
          onChange={() => {}}
          placeholder={t('filters.bedrooms.placeholder')}
        />
      </div>
      <div className={styles.selectWrapper}>
        <Select
          options={statusOptions}
          value="all"
          onChange={() => {}}
          placeholder={t('filters.status.placeholder')}
        />
      </div>
      <button className={styles.moreFiltersButton} type="button">
        <Filter size={16} />
        {t('filters.moreFilters.button')}
      </button>
    </div>
  )
}
