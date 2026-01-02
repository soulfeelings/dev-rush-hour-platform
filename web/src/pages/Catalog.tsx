import { useState } from 'react'
import { Map } from 'lucide-react'
import { Select } from '../ui/Select'
import FiltersBar from '../components/FiltersBar'
import ProjectCard from '../components/ProjectCard'
import PropertyMap from '../components/PropertyMap'
import ResizableSplitter from '../components/ResizableSplitter'
import { mockProperties } from '../data/mockProperties'
import styles from './Catalog.module.scss'

const sortOptions = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'date-asc', label: 'Дата: сначала новые' },
  { value: 'date-desc', label: 'Дата: сначала старые' },
]

export default function Catalog() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>()
  const [sortValue, setSortValue] = useState('default')
  const [isMapOpen, setIsMapOpen] = useState(false)

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId === selectedPropertyId ? undefined : propertyId)
  }

  const handleFavoriteClick = (propertyId: string) => {
    console.log('Favorite clicked:', propertyId)
  }

  const regularProperties = mockProperties.filter(p => !p.isFeatured)
  const totalResults = mockProperties.length
  const displayedResults = regularProperties.length

  const catalogContent = (
    <div className={styles.catalogContent}>
      {/* <FeaturedPropertyCarousel properties={featuredProperties} /> */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          {displayedResults} из {totalResults} результатов
        </span>
        <div className={styles.headerActions}>
          <div className={styles.sortContainer}>
            <Select
              options={sortOptions}
              value={sortValue}
              onChange={setSortValue}
              placeholder="Сортировать"
            />
          </div>
          <button className={styles.mapButton} onClick={() => setIsMapOpen(true)} type="button">
            <Map size={18} />
            Карта
          </button>
        </div>
      </div>
      <div className={styles.grid}>
        {regularProperties.map(property => (
          <ProjectCard
            key={property.id}
            property={property}
            onFavoriteClick={handleFavoriteClick}
          />
        ))}
      </div>
    </div>
  )

  const mapContent = (
    <PropertyMap
      properties={mockProperties}
      selectedPropertyId={selectedPropertyId}
      onPropertyClick={handlePropertyClick}
    />
  )

  return (
    <div className={styles.container}>
      <div className={styles.filtersWrapper}>
        <FiltersBar />
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.desktopLayout}>
          <ResizableSplitter
            leftPanel={catalogContent}
            rightPanel={mapContent}
            initialLeftWidth={60}
            minLeftWidth={30}
            minRightWidth={20}
          />
        </div>
        <div className={styles.mobileLayout}>{catalogContent}</div>
      </div>
      {/* {isMapOpen && (
        <div className={styles.mapModalOverlay} onClick={() => setIsMapOpen(false)}>
          <div className={styles.mapModal} onClick={e => e.stopPropagation()}>
            <button
              className={styles.mapCloseButton}
              onClick={() => setIsMapOpen(false)}
              type="button"
            >
              ×
            </button>
            <div className={styles.mapModalContent}>{mapContent}</div>
          </div>
        </div>
      )} */}
    </div>
  )
}
