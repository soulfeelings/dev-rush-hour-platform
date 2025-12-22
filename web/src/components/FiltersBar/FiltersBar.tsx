import { Search, Filter, Plane } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import styles from './FiltersBar.module.scss'

const propertyTypeOptions = [
  { value: 'all', label: 'Тип объекта' },
  { value: 'primary', label: 'Первичная' },
  { value: 'secondary', label: 'Вторичная' },
]

const priceOptions = [
  { value: 'all', label: 'Стоимость' },
  { value: '0-1m', label: 'До 1 млн AED' },
  { value: '1-2m', label: '1-2 млн AED' },
  { value: '2-5m', label: '2-5 млн AED' },
  { value: '5m+', label: 'От 5 млн AED' },
]

const bedroomsOptions = [
  { value: 'all', label: 'Спальни' },
  { value: 'studio', label: 'Студия' },
  { value: '1', label: '1 спальня' },
  { value: '2', label: '2 спальни' },
  { value: '3', label: '3 спальни' },
  { value: '4+', label: '4+ спальни' },
]

const statusOptions = [
  { value: 'all', label: 'Статус продаж' },
  { value: 'ready', label: 'Готов' },
  { value: 'construction', label: 'Строится' },
  { value: 'planning', label: 'Планируется' },
]

export default function FiltersBar() {
  return (
    <div className={styles.filtersBar}>
      <Button variant="secondary" size="sm" className={styles.locationButton}>
        <Plane size={16} />
        Dubai
      </Button>
      <button className={styles.searchButton} type="button">
        <Search size={18} />
        Поиск
      </button>
      <button className={styles.filterButton} type="button">
        Авансирование
      </button>
      <div className={styles.selectWrapper}>
        <Select
          options={propertyTypeOptions}
          value="all"
          onChange={() => {}}
          placeholder="Тип объекта"
        />
      </div>
      <div className={styles.selectWrapper}>
        <Select options={priceOptions} value="all" onChange={() => {}} placeholder="Стоимость" />
      </div>
      <div className={styles.selectWrapper}>
        <Select options={bedroomsOptions} value="all" onChange={() => {}} placeholder="Спальни" />
      </div>
      <div className={styles.selectWrapper}>
        <Select options={statusOptions} value="all" onChange={() => {}} placeholder="Статус продаж" />
      </div>
      <button className={styles.moreFiltersButton} type="button">
        <Filter size={16} />
        Еще фильтры
      </button>
    </div>
  )
}

