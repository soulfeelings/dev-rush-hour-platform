import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Map, LayoutGrid, ChevronRight } from 'lucide-react'
import { Select } from '../../ui/Select'
import { Toggle } from '../../ui/Toggle'
import { CatalogFilters, type LayoutMode } from '@/features/CatalogFilters/CatalogFilters'
import PropertyMap from '../../components/PropertyMap'
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

// =====================================
// LAYOUT MODE PERSISTENCE
// =====================================

const LAYOUT_MODE_KEY = 'catalog-layout-mode'
const MOBILE_VIEW_KEY = 'catalog-mobile-view'

type MobileView = 'list' | 'map'

const loadLayoutMode = (): LayoutMode => {
  try {
    const saved = localStorage.getItem(LAYOUT_MODE_KEY)
    if (saved === 'split' || saved === 'map') {
      return saved
    }
  } catch (error) {
    console.warn('Failed to load layout mode:', error)
  }
  return 'split'
}

const saveLayoutMode = (mode: LayoutMode) => {
  try {
    localStorage.setItem(LAYOUT_MODE_KEY, mode)
  } catch (error) {
    console.warn('Failed to save layout mode:', error)
  }
}

const loadMobileView = (): MobileView => {
  try {
    const saved = localStorage.getItem(MOBILE_VIEW_KEY)
    if (saved === 'list' || saved === 'map') {
      return saved
    }
  } catch (error) {
    console.warn('Failed to load mobile view:', error)
    return 'list'
  }
  return 'list' // Default to list view on mobile
}

const saveMobileView = (view: MobileView) => {
  try {
    localStorage.setItem(MOBILE_VIEW_KEY, view)
  } catch (error) {
    console.warn('Failed to save mobile view:', error)
  }
  return 'list'
}

// Breakpoint for desktop layout (matches $breakpoint-lg)
const DESKTOP_BREAKPOINT = 1024

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= DESKTOP_BREAKPOINT : true
  )

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isDesktop
}

// =====================================
// SORT OPTIONS
// =====================================

type SortValue = 'default' | ListProjectsSort | ListLotsSort

const isProjectsSort = (value: SortValue): value is ListProjectsSort => {
  return Object.values(ListProjectsSort).includes(value as ListProjectsSort)
}

const isLotsSort = (value: SortValue): value is ListLotsSort => {
  return Object.values(ListLotsSort).includes(value as ListLotsSort)
}

const sortOptions: Array<{ value: SortValue; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: ListProjectsSort.price_asc, label: 'Price: Low to High' },
  { value: ListProjectsSort.price_desc, label: 'Price: High to Low' },
  { value: ListProjectsSort.newest, label: 'Date: Newest First' },
]

// =====================================
// CATALOG COMPONENT
// =====================================

export default function Catalog() {
  const location = useLocation()
  const navigate = useNavigate()
  const { filters, updateFilter } = useFilters()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>()
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(loadLayoutMode)
  const [mobileView, setMobileView] = useState<MobileView>(loadMobileView)
  const mapRef = useRef<PropertyMapRef | null>(null)
  const isDesktop = useIsDesktop()

  const sortValue = (filters.sort || 'default') as SortValue
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

  // Prepare API params for projects
  const projectsParams = useMemo((): ListProjectsParams => {
    const params: ListProjectsParams = {}

    if (filters.area) params.area = filters.area
    if (filters.developer) params.developer = filters.developer

    if (filters.bedrooms !== 'all') {
      const bedsNum =
        filters.bedrooms === 'studio'
          ? 0
          : filters.bedrooms === '4+'
            ? 4
            : parseInt(filters.bedrooms)
      if (!isNaN(bedsNum)) params.bedrooms = bedsNum
    }

    if (filters.priceRange !== 'all') {
      const { min, max } = getPriceRange(filters.priceRange)
      if (min !== undefined) params.priceMin = min
      if (max !== undefined) params.priceMax = max
    }

    if (filters.minPrice) {
      const minPriceNum = parseFloat(filters.minPrice)
      if (!isNaN(minPriceNum)) params.priceMin = minPriceNum
    }
    if (filters.maxPrice) {
      const maxPriceNum = parseFloat(filters.maxPrice)
      if (!isNaN(maxPriceNum)) params.priceMax = maxPriceNum
    }

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

  // Prepare API params for lots
  const lotsParams = useMemo((): ListLotsParams => {
    const params: ListLotsParams = {}

    if (filters.area) params.area = filters.area
    if (filters.project) params.project = filters.project

    if (filters.propertyType !== 'all') {
      if (filters.propertyType === 'apartment') {
        params.type = LotType.apartment
      }
    }

    if (filters.bedrooms !== 'all') {
      const bedsNum =
        filters.bedrooms === 'studio'
          ? 0
          : filters.bedrooms === '4+'
            ? 4
            : parseInt(filters.bedrooms)
      if (!isNaN(bedsNum)) params.bedrooms = bedsNum
    }

    if (filters.priceRange !== 'all') {
      const { min, max } = getPriceRange(filters.priceRange)
      if (min !== undefined) params.priceMin = min
      if (max !== undefined) params.priceMax = max
    }

    if (filters.minPrice) {
      const minPriceNum = parseFloat(filters.minPrice)
      if (!isNaN(minPriceNum)) params.priceMin = minPriceNum
    }
    if (filters.maxPrice) {
      const maxPriceNum = parseFloat(filters.maxPrice)
      if (!isNaN(maxPriceNum)) params.priceMax = maxPriceNum
    }

    if (sortValue !== 'default' && isLotsSort(sortValue)) {
      params.sort = sortValue
    }

    return params
  }, [filters, sortValue])

  // Load projects (only when projects tab is active)
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

  // Load lots (only when lots tab is active)
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

  // Load projects for map in lots view (need coordinates)
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

    const lotsByProjectId = new globalThis.Map<string, Lot[]>()
    lots.forEach((lot: Lot) => {
      if (lot.projectId) {
        const existing = lotsByProjectId.get(lot.projectId) || []
        lotsByProjectId.set(lot.projectId, [...existing, lot])
      }
    })

    const lotsWithProjects: Array<Lot & { project?: unknown }> = []

    lotsByProjectId.forEach((projectLots: Lot[], projectId: string) => {
      const project = projectsForMap.find(p => p.id === projectId)

      if (!project) {
        return
      }

      projectLots.forEach((lot: Lot) => {
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

  // Desktop layout mode change handler
  const handleLayoutChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode)
    saveLayoutMode(mode)

    // Refresh map when becoming visible
    if (mode === 'split' || mode === 'map') {
      setTimeout(() => mapRef.current?.refreshMap(), 350)
    }
  }, [])

  // Mobile view toggle handler
  const handleMobileViewToggle = useCallback(() => {
    const newView = mobileView === 'list' ? 'map' : 'list'
    setMobileView(newView)
    saveMobileView(newView)

    if (newView === 'map') {
      setTimeout(() => mapRef.current?.refreshMap(), 300)
    }
  }, [mobileView])

  // Refresh map when switching between desktop/mobile layouts
  useEffect(() => {
    setTimeout(() => mapRef.current?.refreshMap(), 350)
  }, [isDesktop])

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

  const activeProperties = projects.filter(p => p.status === 'active')
  const activeLots = lots.filter(lot => lot.status === 'active')

  const totalResults = viewMode === 'projects' ? activeProperties.length : activeLots.length
  const displayedResults =
    viewMode === 'projects' ? activeProperties.filter(p => !p.isFeatured).length : activeLots.length

  const catalogContent = (
    <div className={styles.catalogContent}>
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
          <ProjectsView properties={projects} isLoading={projectsLoading} error={projectsError} />
        </div>
        <div className={`${styles.viewPanel} ${viewMode === 'lots' ? styles.active : ''}`}>
          <LotsView
            lots={lots}
            isLoading={lotsLoading}
            error={lotsError}
            onFavoriteClick={handleLotFavoriteClick}
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
      <CatalogFilters layoutMode={layoutMode} onLayoutChange={handleLayoutChange} />
      <div className={styles.contentWrapper}>
        {isDesktop ? (
          /* Desktop: CSS Grid layout with mode switching (≥1024px) */
          <div className={styles.pageLayout} data-layout={layoutMode}>
            <div className={styles.listPanel}>{catalogContent}</div>
            <button
              className={styles.panelToggle}
              onClick={() => handleLayoutChange(layoutMode === 'map' ? 'split' : 'map')}
              type="button"
              aria-label={layoutMode === 'map' ? 'Show list' : 'Show map'}
            >
              <ChevronRight size={18} />
            </button>
            <div className={styles.mapPanel}>{mapContent}</div>
          </div>
        ) : (
          /* Mobile/Tablet: One view at a time with slide (<1024px) */
          <>
            <div
              className={`${styles.mobileLayout} ${mobileView === 'list' ? styles.showList : ''}`}
            >
              <div className={styles.mobileListView}>{catalogContent}</div>
              <div className={styles.mobileMapView}>{mapContent}</div>
            </div>

            {/* Floating toggle button */}
            <button
              className={styles.floatingToggle}
              onClick={handleMobileViewToggle}
              type="button"
              aria-label={mobileView === 'list' ? 'Show map' : 'Show list'}
            >
              {mobileView === 'list' ? (
                <>
                  <Map size={18} /> Map
                </>
              ) : (
                <>
                  <LayoutGrid size={18} /> List
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
