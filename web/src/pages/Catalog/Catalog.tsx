import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Map, LayoutGrid, ChevronRight } from 'lucide-react'
import { Select } from '../../ui/Select'
import { CatalogFilters } from '@/features/CatalogFilters/CatalogFilters'
import PropertyMap from '../../components/PropertyMap'
import { useListProjects, useListAreas } from '../../api'
import { useFilters } from '../../contexts'
import styles from './Catalog.module.scss'
import type { PropertyMapRef } from '../../components/PropertyMap/PropertyMap'
import ProjectsView from './components/ProjectsView'
import { ListProjectsSort } from '../../api/generated/schemas/listProjectsSort'
import type { ListProjectsParams } from '../../api/generated/schemas/listProjectsParams'


// =====================================
// LAYOUT MODE PERSISTENCE
// =====================================

const LAYOUT_MODE_KEY = 'catalog-layout-mode'
const MOBILE_VIEW_KEY = 'catalog-mobile-view'

type MobileView = 'list' | 'map'
type DesktopView = 'split' | 'map'

const loadLayoutMode = (): DesktopView => {
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

const saveLayoutMode = (mode: DesktopView) => {
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
  }
  return 'list'
}

const saveMobileView = (view: MobileView) => {
  try {
    localStorage.setItem(MOBILE_VIEW_KEY, view)
  } catch (error) {
    console.warn('Failed to save mobile view:', error)
  }
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

type SortValue = 'default' | ListProjectsSort

const ALWAYS_FRESH_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
}

// Moved outside component — pure function, no deps on props/state
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

// =====================================
// CATALOG COMPONENT
// =====================================

export default function Catalog() {
  const { filters, updateFilter } = useFilters()
  const [layoutMode, setLayoutMode] = useState<DesktopView>(loadLayoutMode)
  const [mobileView, setMobileView] = useState<MobileView>(loadMobileView)
  const mapRef = useRef<PropertyMapRef | null>(null)
  const isDesktop = useIsDesktop()
  const { t } = useTranslation()

  const sortOptions = useMemo(
    () => [
      { value: 'default' as SortValue, label: t('catalog.sort.default') },
      { value: ListProjectsSort.price_asc as SortValue, label: t('catalog.sort.priceAsc') },
      { value: ListProjectsSort.price_desc as SortValue, label: t('catalog.sort.priceDesc') },
      { value: ListProjectsSort.newest as SortValue, label: t('catalog.sort.dateAsc') },
    ],
    [t]
  )

  const sortValue = (filters.sort || 'default') as SortValue

  // Prepare API params for projects
  const projectsParams = useMemo((): ListProjectsParams => {
    const params: ListProjectsParams = {}

    // Location filters
    if (filters.city) params.city = filters.city
    if (filters.area) params.area = filters.area
    if (filters.developer) params.developer = filters.developer

    // Send bedrooms as comma-separated string for multi-select
    if (filters.bedrooms.length > 0) {
      params.bedrooms = filters.bedrooms.join(',')
    }

    // Send bathrooms as comma-separated string for multi-select
    if (filters.bathrooms.length > 0) {
      params.bathrooms = filters.bathrooms.join(',')
    }

    // Price filters
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

    // Status filter (ready, construction, planning)
    if (filters.status !== 'all') {
      params.status = filters.status as ListProjectsParams['status']
    }

    // Search filter
    if (filters.search) {
      params.search = filters.search
    }

    // Sort
    if (sortValue !== 'default') {
      params.sort = sortValue
    }

    return params
  }, [
    filters.city,
    filters.area,
    filters.developer,
    filters.bedrooms,
    filters.bathrooms,
    filters.priceRange,
    filters.minPrice,
    filters.maxPrice,
    filters.status,
    filters.search,
    sortValue,
  ])

  // Load projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useListProjects(projectsParams, {
    query: ALWAYS_FRESH_QUERY_OPTIONS,
  })

  // Load all areas for city-filtered area dropdown
  const { data: allAreas } = useListAreas()

  // Derive area options: filter by selected city
  const areaOptions = useMemo(() => {
    if (!allAreas) return undefined
    let filtered = allAreas.filter(a => !a.deletedAt)
    if (filters.city) {
      filtered = filtered.filter(a => a.city === filters.city)
    }
    return filtered.map(a => ({ value: a.slug || '', label: a.name || '' }))
  }, [allAreas, filters.city])

  const projects = useMemo(() => {
    if (!projectsData) return []
    let result = [...projectsData]

    if (filters.propertyType !== 'all') {
      result = result.filter(p =>
        p.propertyTypes?.some(t => t.toLowerCase() === filters.propertyType)
      )
    }

    return result
  }, [projectsData, filters.propertyType])

  // Desktop layout mode change handler
  const handleLayoutChange = useCallback((mode: DesktopView) => {
    setLayoutMode(mode)
    saveLayoutMode(mode)

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

  const activeProjects = useMemo(
    () => projects.filter(p => p.status === 'active'),
    [projects]
  )
  const totalResults = activeProjects.length

  const catalogContent = (
    <div className={styles.catalogContent}>
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          {t('catalog.results.count', {
            displayed: totalResults,
            total: totalResults,
          })}
        </span>
        <div className={styles.headerActions}>
          {/* Sorting for both tabs */}
          <div className={styles.sortContainer}>
            <span className={styles.sortLabel}>{t('catalog.sort.label')}</span>
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
        <ProjectsView projects={projects} isLoading={projectsLoading} error={projectsError} />
      </div>
    </div>
  )

  const mapContent = <PropertyMap ref={mapRef} projects={activeProjects} />

  return (
    <div className={styles.container}>
      <CatalogFilters areaOptions={areaOptions} />
      <div className={styles.contentWrapper}>
        {isDesktop ? (
          /* Desktop: CSS Grid layout with mode switching (>=1024px) */
          <div className={styles.pageLayout} data-layout={layoutMode}>
            <div className={styles.mapPanel}>
              {mapContent}
              <button
                className={styles.panelToggle}
                onClick={() => handleLayoutChange(layoutMode === 'map' ? 'split' : 'map')}
                type="button"
                aria-label={layoutMode === 'map' ? 'Show list' : 'Show map'}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className={styles.listPanel}>{catalogContent}</div>
          </div>
        ) : (
          /* Mobile/Tablet: One view at a time with slide (<1024px) */
          <>
            <div
              className={`${styles.mobileLayout} ${mobileView === 'list' ? styles.showList : ''}`}
            >
              <div className={styles.mobileMapView}>{mapContent}</div>
              <div className={styles.mobileListView}>{catalogContent}</div>
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
                  <Map size={18} /> {t('catalog.map.button')}
                </>
              ) : (
                <>
                  <LayoutGrid size={18} /> {t('catalog.list.button')}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
