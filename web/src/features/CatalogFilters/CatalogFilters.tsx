import FiltersBar from './FiltersBar'
import styles from './CatalogFilters.module.scss'

export const CatalogFilters = () => {
  return (
    <div className={styles.filtersWrapper}>
      <FiltersBar />
    </div>
  )
}
