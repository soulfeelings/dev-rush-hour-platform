import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Select } from '../../ui/Select'
import { Toggle } from '../../ui/Toggle'
import { CatalogFilters } from '@/features/CatalogFilters/CatalogFilters'
import PropertyMap from '../../components/PropertyMap'
import ResizableSplitter from '../../components/ResizableSplitter'
import { useListProjects, useListLots } from '../../api'
import { apiProjectsToProperties, apiLotsToPropertiesForMap } from '../../utils/apiAdapters'
import type { CatalogViewMode } from '../../utils/catalogViewMode'
import { ROUTES } from '../../constants/routes'
import { useFilters } from '../../contexts'
import styles from './Catalog.module.scss'
import type { PropertyMapRef } from '../../components/PropertyMap/PropertyMap'
import type { Lot } from '../../api'
import ProjectsView from './components/ProjectsView'
import LotsView from './components/LotsView'
import { LotType } from '../../api/generated/schemas/lotType'
import { ListProjectsSort } from '../../api/generated/schemas/listProjectsSort'
import { ListLotsSort } from '../../api/generated/schemas/listLotsSort'
import type { ListProjectsParams } from '../../api/generated/schemas/listProjectsParams'
import type { ListLotsParams } from '../../api/generated/schemas/listLotsParams'

// Sort option type - 'default' or API sort values
type SortValue = 'default' | ListProjectsSort | ListLotsSort

// Type guards for sort values
const isProjectsSort = (value: SortValue): value is ListProjectsSort => {
  return Object.values(ListProjectsSort).includes(value as ListProjectsSort)
}

const isLotsSort = (value: SortValue): value is ListLotsSort => {
  return Object.values(ListLotsSort).includes(value as ListLotsSort)
}

// Константы для размеров и брейкпоинтов
const GRID_CONSTANTS = {
  // Брейкпоинты экрана (в пикселях)
  BREAKPOINT_MD: 768,
  BREAKPOINT_XL: 1280,

  // Границы ширины панели для определения количества колонок (%)
  PANEL_WIDTH_BREAKPOINT_1: 40, // < 40% - 1 колонка
  PANEL_WIDTH_BREAKPOINT_2: 60, // 40-70% - 2 колонки, > 70% - 3 колонки

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

// Sort options using API constants for type safety
const sortOptions: Array<{ value: SortValue; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: ListProjectsSort.price_asc, label: 'Price: Low to High' },
  { value: ListProjectsSort.price_desc, label: 'Price: High to Low' },
  { value: ListProjectsSort.newest, label: 'Date: Newest First' },
]

export default function Catalog() {
  const location = useLocation()
  const navigate = useNavigate()
  const { filters, updateFilter } = useFilters()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>()
  const [panelWidth, setPanelWidth] = useState(loadSplitterPosition())
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const mapRef = useRef<PropertyMapRef | null>(null)

  // Get sort value from filters context (synced with URL)
  const sortValue = (filters.sort || 'default') as SortValue

  // Определяем viewMode из URL
  const viewMode: CatalogViewMode = location.pathname.includes('/apartments') ? 'lots' : 'projects'

  // Helper to convert priceRange to min/max values
  const getPriceRange = (priceRange: string): { min?: number; max?: number } => {
    switch (priceRange) {
      case '0-1m':
        return { min: 0, max: 1000000 }
      case '1-2m':
        return { min: 1000000, max: 2000000 }
      case '2-5m':
        return { min: 2000000, max: 5000000 }
      case '5m+':
        return { min: 5000000 }
      default:
        return {}
    }
  }

  // Подготавливаем параметры для API запросов
  const projectsParams = useMemo((): ListProjectsParams => {
    const params: ListProjectsParams = {}

    if (filters.area) params.area = filters.area
    if (filters.developer) params.developer = filters.developer

    // Handle bedrooms filter
    if (filters.bedrooms !== 'all') {
      const bedsNum =
        filters.bedrooms === 'studio'
          ? 0
          : filters.bedrooms === '4+'
            ? 4
            : parseInt(filters.bedrooms)
      if (!isNaN(bedsNum)) params.bedrooms = bedsNum
    }

    // Handle price range preset
    if (filters.priceRange !== 'all') {
      const { min, max } = getPriceRange(filters.priceRange)
      if (min !== undefined) params.priceMin = min
      if (max !== undefined) params.priceMax = max
    }

    // Handle custom min/max prices (override preset if specified)
    if (filters.minPrice) {
      const minPriceNum = parseFloat(filters.minPrice)
      if (!isNaN(minPriceNum)) params.priceMin = minPriceNum
    }
    if (filters.maxPrice) {
      const maxPriceNum = parseFloat(filters.maxPrice)
      if (!isNaN(maxPriceNum)) params.priceMax = maxPriceNum
    }

    // Handle sorting - only set if not default
    if (sortValue !== 'default' && isProjectsSort(sortValue)) {
      params.sort = sortValue
    }

    return params
  }, [
    filters.area,
    filters.developer,
    filters.bedrooms,
    filters.priceRange,
    filters.minPrice,
    filters.maxPrice,
    sortValue,
  ])

  const lotsParams = useMemo((): ListLotsParams => {
    const params: ListLotsParams = {}

    if (filters.area) params.area = filters.area
    if (filters.project) params.project = filters.project

    // Handle property type filter
    if (filters.propertyType !== 'all') {
      // Map propertyType to API type (only 'apartment' is supported in API)
      if (filters.propertyType === 'apartment') {
        params.type = LotType.apartment
      }
    }

    // Handle bedrooms filter
    if (filters.bedrooms !== 'all') {
      const bedsNum =
        filters.bedrooms === 'studio'
          ? 0
          : filters.bedrooms === '4+'
            ? 4
            : parseInt(filters.bedrooms)
      if (!isNaN(bedsNum)) params.bedrooms = bedsNum
    }

    // Handle price range preset
    if (filters.priceRange !== 'all') {
      const { min, max } = getPriceRange(filters.priceRange)
      if (min !== undefined) params.priceMin = min
      if (max !== undefined) params.priceMax = max
    }

    // Handle custom min/max prices (override preset if specified)
    if (filters.minPrice) {
      const minPriceNum = parseFloat(filters.minPrice)
      if (!isNaN(minPriceNum)) params.priceMin = minPriceNum
    }
    if (filters.maxPrice) {
      const maxPriceNum = parseFloat(filters.maxPrice)
      if (!isNaN(maxPriceNum)) params.priceMax = maxPriceNum
    }

    // Handle sorting - only set if it's a valid lots sort value
    if (sortValue !== 'default' && isLotsSort(sortValue)) {
      params.sort = sortValue
    }

    return params
  }, [filters, sortValue])

  // Загружаем проекты только если открыта вкладка проектов
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useListProjects(projectsParams, {
    query: {
      enabled: viewMode === 'projects',
    },
  })
  const projects = useMemo(() => {
    if (!projectsData) return []
    return apiProjectsToProperties(projectsData)
  }, [projectsData])

  // Загружаем лоты только если открыта вкладка лотов
  const {
    data: lotsData,
    isLoading: lotsLoading,
    error: lotsError,
  } = useListLots(lotsParams, {
    query: {
      enabled: viewMode === 'lots',
    },
  })

  const lots = useMemo(() => {
    if (!lotsData?.items) return []
    return lotsData.items as Lot[]
  }, [lotsData])

  // Преобразуем лоты в Property для карты (используя координаты проектов)
  // Для карты нужно загружать проекты даже если открыта вкладка лотов
  const { data: projectsDataForMap } = useListProjects(projectsParams, {
    query: {
      enabled: viewMode === 'lots',
    },
  })
  const projectsForMap = useMemo(() => {
    if (!projectsDataForMap) return []
    return apiProjectsToProperties(projectsDataForMap)
  }, [projectsDataForMap])

  const lotPropertiesForMap = useMemo(() => {
    if (viewMode !== 'lots' || !lotsData?.items || !projectsForMap.length) return []

    // Группируем лоты по projectId для отображения одного маркера на проект
    const lotsByProjectId = new Map<string, (typeof lots)[0][]>()
    lots.forEach(lot => {
      if (lot.projectId) {
        const existing = lotsByProjectId.get(lot.projectId) || []
        lotsByProjectId.set(lot.projectId, [...existing, lot])
      }
    })

    // Преобразуем лоты, добавляя данные проектов из уже загруженных проектов
    const lotsWithProjects: Array<(typeof lots)[0] & { project?: unknown }> = []

    lotsByProjectId.forEach((projectLots, projectId) => {
      // Ищем проект в уже загруженных проектах
      // projectId может быть UUID, а id проекта может быть slug
      // Пока используем простую проверку по id
      const project = projectsForMap.find(p => p.id === projectId)

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
            status: project.status === 'active' ? 'active' : 'archived',
          },
        })
      })
    })

    return apiLotsToPropertiesForMap(lotsWithProjects)
  }, [lotsData, viewMode, lots, projectsForMap])

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getGridColumns = (
    catalogWidth: number,
    screenWidth: number,
    isLotsMode: boolean = false
  ) => {
    // Для лотов всегда 1 колонка
    if (isLotsMode) {
      return 1
    }

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

  const handleLotFavoriteClick = (lotId: string) => {
    console.log('Lot favorite clicked:', lotId)
  }

  const handleViewModeChange = useCallback(
    (mode: CatalogViewMode) => {
      const route = mode === 'lots' ? ROUTES.APARTMENTS : ROUTES.PROJECTS
      navigate(route)
    },
    [navigate]
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
      <Toggle
        options={[
          { value: 'projects', label: 'Projects' },
          { value: 'lots', label: 'Lots' },
        ]}
        value={viewMode}
        onChange={handleViewModeChange}
        className={styles.viewModeToggle}
      />
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          {displayedResults} of {totalResults} results
        </span>
        <div className={styles.headerActions}>
          <div className={styles.sortContainer}>
            Sorting
            <Select
              options={sortOptions}
              value={sortValue}
              onChange={value => updateFilter('sort', value)}
              placeholder="Sort"
              triggerSize="xs"
            />
          </div>
        </div>
      </div>
      <div className={styles.viewContainer}>
        <div className={`${styles.viewPanel} ${viewMode === 'projects' ? styles.active : ''}`}>
          <ProjectsView
            panelWidth={panelWidth}
            screenWidth={screenWidth}
            getGridColumns={getGridColumns}
            properties={projects}
            isLoading={projectsLoading}
            error={projectsError}
          />
        </div>
        <div className={`${styles.viewPanel} ${viewMode === 'lots' ? styles.active : ''}`}>
          <LotsView
            panelWidth={panelWidth}
            screenWidth={screenWidth}
            onFavoriteClick={handleLotFavoriteClick}
            getGridColumns={(catalogWidth, screenWidth) =>
              getGridColumns(catalogWidth, screenWidth, true)
            }
            lots={lots}
            isLoading={lotsLoading}
            error={lotsError}
          />
        </div>
      </div>
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
      <CatalogFilters />
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
