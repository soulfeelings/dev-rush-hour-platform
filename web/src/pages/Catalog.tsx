import { useState } from 'react'
import { Map } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Select } from '../ui/Select'
import FiltersBar from '../components/FiltersBar'
import FeaturedPropertyCarousel from '../components/FeaturedPropertyCarousel'
import ProjectCard from '../components/ProjectCard'
import PropertyMap from '../components/PropertyMap'
import ResizableSplitter from '../components/ResizableSplitter'
import { mockProperties, featuredProperties } from '../data/mockProperties'
import styles from './Catalog.module.scss'

export default function Catalog() {
  const { t } = useTranslation()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>()
  const [sortValue, setSortValue] = useState('default')
  const [isMapOpen, setIsMapOpen] = useState(false)

  const sortOptions = [
    { value: 'default', label: t('catalog.sort.default') },
    { value: 'price-asc', label: t('catalog.sort.priceAsc') },
    { value: 'price-desc', label: t('catalog.sort.priceDesc') },
    { value: 'date-asc', label: t('catalog.sort.dateAsc') },
    { value: 'date-desc', label: t('catalog.sort.dateDesc') },
  ]

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
      <FeaturedPropertyCarousel properties={featuredProperties} />
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          {t('catalog.results.count', { displayed: displayedResults, total: totalResults })}
        </span>
        <div className={styles.headerActions}>
          <div className={styles.sortContainer}>
            <Select
              options={sortOptions}
              value={sortValue}
              onChange={setSortValue}
              placeholder={t('catalog.sort.placeholder')}
            />
          </div>
          <button className={styles.mapButton} onClick={() => setIsMapOpen(true)} type="button">
            <Map size={18} />
            {t('catalog.map.button')}
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
      {isMapOpen && (
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
      )}
    </div>
  )
}
