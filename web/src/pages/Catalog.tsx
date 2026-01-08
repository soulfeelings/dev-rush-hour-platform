import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Select } from '../ui/Select'
import FiltersBar from '../components/FiltersBar'
import ProjectCard from '../components/ProjectCard'
import LotCard from '../components/LotCard'
import PropertyMap from '../components/PropertyMap'
import ResizableSplitter from '../components/ResizableSplitter'
import { useListProjects, useListLots } from '../api'
import { apiProjectsToProperties, apiLotsToPropertiesForMap } from '../utils/apiAdapters'
import { loadCatalogViewMode, saveCatalogViewMode } from '../utils/catalogViewMode'
import type { CatalogViewMode } from '../utils/catalogViewMode'
import styles from './Catalog.module.scss'
import type { PropertyMapRef } from '../components/PropertyMap/PropertyMap'
import type { Lot } from '../api'

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

// Ключ для localStorage
const SPLITTER_POSITION_KEY = 'catalog-splitter-position'

// Функции для работы с localStorage
const saveSplitterPosition = (position: number) => {
  try {
    localStorage.setItem(SPLITTER_POSITION_KEY, position.toString())
  } catch (error) {
    console.warn('Failed to save splitter position:', error)
  }
}

const loadSplitterPosition = (): number => {
  try {
    const saved = localStorage.getItem(SPLITTER_POSITION_KEY)
    return saved ? parseFloat(saved) : GRID_CONSTANTS.INITIAL_LEFT_WIDTH
  } catch (error) {
    console.warn('Failed to load splitter position:', error)
    return GRID_CONSTANTS.INITIAL_LEFT_WIDTH
  }
}

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
  const [panelWidth, setPanelWidth] = useState(loadSplitterPosition())
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [viewMode, setViewMode] = useState<CatalogViewMode>(loadCatalogViewMode)
  const mapRef = useRef<PropertyMapRef | null>(null)

  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useListProjects()
  const projects = useMemo(() => {
    if (!projectsData) return []
    return apiProjectsToProperties(projectsData)
  }, [projectsData])

  const { data: lotsData, isLoading: lotsLoading, error: lotsError } = useListLots(
    {},
    {
      query: {
        enabled: viewMode === 'lots',
      },
    }
  )

  const lots = useMemo(() => {
    if (!lotsData?.items) return []
    return lotsData.items as Lot[]
  }, [lotsData])

  // Преобразуем лоты в Property для карты (используя координаты проектов)
  const lotPropertiesForMap = useMemo(() => {
    if (viewMode !== 'lots' || !lotsData?.items || !projects.length) return []
    
    // Группируем лоты по projectId для отображения одного маркера на проект
    const lotsByProjectId = new Map<string, typeof lots[0][]>()
    lots.forEach(lot => {
      if (lot.projectId) {
        const existing = lotsByProjectId.get(lot.projectId) || []
        lotsByProjectId.set(lot.projectId, [...existing, lot])
      }
    })

    // Преобразуем лоты, добавляя данные проектов из уже загруженных проектов
    const lotsWithProjects: Array<typeof lots[0] & { project?: unknown }> = []
    
    lotsByProjectId.forEach((projectLots, projectId) => {
      // Ищем проект в уже загруженных проектах
      // projectId может быть UUID, а id проекта может быть slug
      // Пока используем простую проверку по id
      const project = projects.find(p => p.id === projectId)
      
      if (!project) {
        // Если проект не найден, пропускаем эти лоты для карты
        return
      }

      // Для каждого лота добавляем данные проекта
      projectLots.forEach(lot => {
        lotsWithProjects.push({
          ...lot,
          project: {
            name: project.title,
            slug: project.id,
            lat: project.coordinates[0],
            lng: project.coordinates[1],
            sale: project.sale,
            status: project.status,
            developer: project.developer
              ? {
                  name: project.developer,
                  data: {
                    logoUrl: project.logoUrl,
                  },
                }
              : undefined,
            area: project.location
              ? {
                  name: project.location,
                }
              : undefined,
            image: project.image,
          },
        })
      })
    })

    return apiLotsToPropertiesForMap(lotsWithProjects)
  }, [lotsData, viewMode, lots, projects])

  const loading = viewMode === 'projects' ? projectsLoading : lotsLoading
  const error = viewMode === 'projects' ? projectsError : lotsError

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getGridColumns = (catalogWidth: number, screenWidth: number) => {
    // Определяем максимальное количество колонок на основе размера экрана
    const maxColumnsByScreen =
      screenWidth >= GRID_CONSTANTS.BREAKPOINT_XL
        ? 3
        : screenWidth >= GRID_CONSTANTS.BREAKPOINT_MD
          ? 2
          : 1

    // Определяем желаемое количество колонок на основе ширины каталога
    let desiredColumnsByWidth = 1
    if (
      catalogWidth >= GRID_CONSTANTS.PANEL_WIDTH_BREAKPOINT_1 &&
      catalogWidth < GRID_CONSTANTS.PANEL_WIDTH_BREAKPOINT_2
    ) {
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

  const handleLotFavoriteClick = (lotId: string) => {
    console.log('Lot favorite clicked:', lotId)
  }

  const handleViewModeChange = useCallback(
    (mode: CatalogViewMode) => {
      setViewMode(mode)
      saveCatalogViewMode(mode)
    },
    [setViewMode]
  )

  const handleFinishResizing = useCallback((width: number) => {
    saveSplitterPosition(width)
    // Обновляем карту после изменения размера
    mapRef.current?.refreshMap()
  }, [])

  const activeProperties = projects.filter(p => p.status === 'active')
  const regularProperties = activeProperties.filter(p => !p.isFeatured)
  const activeLots = lots.filter(lot => lot.status === 'active')

  const totalResults = viewMode === 'projects' ? activeProperties.length : activeLots.length
  const displayedResults = viewMode === 'projects' ? regularProperties.length : activeLots.length

  const catalogContent = (
    <div className={styles.catalogContent}>
      {/* <FeaturedPropertyCarousel properties={featuredProperties} /> */}
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'projects' ? styles.active : ''}`}
            onClick={() => handleViewModeChange('projects')}
            type="button"
          >
            Projects
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'lots' ? styles.active : ''}`}
            onClick={() => handleViewModeChange('lots')}
            type="button"
          >
            Lots
          </button>
        </div>
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
        </div>
      </div>
      {loading ? (
        <div className={styles.loading}>
          <p>{viewMode === 'projects' ? 'Загрузка проектов...' : 'Загрузка лотов...'}</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>Ошибка загрузки: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>Повторить</button>
        </div>
      ) : (
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${getGridColumns(100 - panelWidth, screenWidth)}, 1fr)`,
          }}
        >
          {viewMode === 'projects' ? (
            regularProperties.map(property => (
              <ProjectCard
                key={property.id}
                property={property}
                onFavoriteClick={handleFavoriteClick}
              />
            ))
          ) : (
            activeLots.map(lot => (
              <LotCard key={lot.id} lot={lot} onFavoriteClick={handleLotFavoriteClick} />
            ))
          )}
        </div>
      )}
    </div>
  )

  const mapContent = (
    <PropertyMap
      ref={mapRef}
      properties={viewMode === 'projects' ? activeProperties : lotPropertiesForMap}
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
            initialLeftWidth={panelWidth}
            minLeftWidth={GRID_CONSTANTS.MIN_LEFT_WIDTH}
            minRightWidth={GRID_CONSTANTS.MIN_RIGHT_WIDTH}
            onWidthChange={setPanelWidth}
            onFinishResizing={handleFinishResizing}
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
