import { useState, useEffect } from 'react'
import { Map } from 'lucide-react'
import { Select } from '../ui/Select'
import FiltersBar from '../components/FiltersBar'
import ProjectCard from '../components/ProjectCard'
import PropertyMap from '../components/PropertyMap'
import ResizableSplitter from '../components/ResizableSplitter'
import { mockProperties } from '../data/mockProperties'
import styles from './Catalog.module.scss'

// Константы для размеров и брейкпоинтов
const GRID_CONSTANTS = {
  // Брейкпоинты экрана (в пикселях)
  BREAKPOINT_MD: 768,
  BREAKPOINT_XL: 1280,

  // Границы ширины панели для определения количества колонок (%)
  PANEL_WIDTH_BREAKPOINT_1: 40, // < 40% - 1 колонка
  PANEL_WIDTH_BREAKPOINT_2: 70, // 40-70% - 2 колонки, > 70% - 3 колонки

  // Размеры панелей ResizableSplitter (%)
  INITIAL_LEFT_WIDTH: 40,
  MIN_LEFT_WIDTH: 30,
  MIN_RIGHT_WIDTH: 20,
} as const

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
  const [panelWidth, setPanelWidth] = useState(GRID_CONSTANTS.INITIAL_LEFT_WIDTH)
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getGridColumns = (catalogWidth: number, screenWidth: number) => {
    // Определяем максимальное количество колонок на основе размера экрана
    const maxColumnsByScreen = screenWidth >= GRID_CONSTANTS.BREAKPOINT_XL ? 3 :
                               screenWidth >= GRID_CONSTANTS.BREAKPOINT_MD ? 2 : 1

    // Определяем желаемое количество колонок на основе ширины каталога
    let desiredColumnsByWidth = 1
    if (catalogWidth >= GRID_CONSTANTS.PANEL_WIDTH_BREAKPOINT_1 &&
        catalogWidth < GRID_CONSTANTS.PANEL_WIDTH_BREAKPOINT_2) {
      desiredColumnsByWidth = 2
    } else if (catalogWidth >= GRID_CONSTANTS.PANEL_WIDTH_BREAKPOINT_2) {
      desiredColumnsByWidth = 3
    }

    // Возвращаем минимальное значение из двух расчетов
    return Math.min(maxColumnsByScreen, desiredColumnsByWidth)
  }

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
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${getGridColumns(100 - panelWidth, screenWidth)}, 1fr)` }}
      >
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
            leftPanel={mapContent}
            rightPanel={catalogContent}
            initialLeftWidth={GRID_CONSTANTS.INITIAL_LEFT_WIDTH}
            minLeftWidth={GRID_CONSTANTS.MIN_LEFT_WIDTH}
            minRightWidth={GRID_CONSTANTS.MIN_RIGHT_WIDTH}
            onWidthChange={setPanelWidth}
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
