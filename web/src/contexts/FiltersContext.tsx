import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGetFilterOptions } from '../api/generated/rushHourRealEstatePlatformAPI'

import type { FilterOptions } from '../api/generated/schemas/filterOptions'
import type { FilterOption } from '../api/generated/schemas/filterOption'

export type FilterValues = {
  city: string | null
  area: string | null
  developer: string | null
  project: string | null
  propertyType: 'all' | 'apartment' | 'villa' | 'townhouse' | 'penthouse' | 'duplex'
  bedrooms: 'all' | 'studio' | '1' | '2' | '3' | '4+'
  bathrooms: 'all' | '1' | '2' | '3' | '4+'
  priceRange: 'all' | '0-1m' | '1-2m' | '2-5m' | '5m+'
  minPrice: string
  maxPrice: string
  status: 'all' | 'ready' | 'construction' | 'planning'
  sort: string
}

type FiltersContextType = {
  filters: FilterValues
  options: FilterOptions | undefined
  isLoading: boolean
  error: Error | null
  updateFilter: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void
  resetFilters: () => void
  getFilteredAreas: () => FilterOption[]
  getFilteredProjects: () => FilterOption[]
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

const defaultFilters: FilterValues = {
  city: null,
  area: null,
  developer: null,
  project: null,
  propertyType: 'all',
  bedrooms: 'all',
  bathrooms: 'all',
  priceRange: 'all',
  minPrice: '',
  maxPrice: '',
  status: 'all',
  sort: 'default',
}

// Helper to parse filters from URL
const parseFiltersFromURL = (search: string): FilterValues => {
  const params = new URLSearchParams(search)
  const filters = { ...defaultFilters }

  if (params.get('city')) filters.city = params.get('city')
  if (params.get('area')) filters.area = params.get('area')
  if (params.get('developer')) filters.developer = params.get('developer')
  if (params.get('project')) filters.project = params.get('project')

  const type = params.get('type')
  if (type && ['apartment', 'villa', 'townhouse', 'penthouse', 'duplex'].includes(type)) {
    filters.propertyType = type as FilterValues['propertyType']
  }

  const beds = params.get('bedrooms')
  if (beds && ['studio', '1', '2', '3', '4+'].includes(beds)) {
    filters.bedrooms = beds as FilterValues['bedrooms']
  }

  const baths = params.get('bathrooms')
  if (baths && ['1', '2', '3', '4+'].includes(baths)) {
    filters.bathrooms = baths as FilterValues['bathrooms']
  }

  const priceRange = params.get('priceRange')
  if (priceRange && ['0-1m', '1-2m', '2-5m', '5m+'].includes(priceRange)) {
    filters.priceRange = priceRange as FilterValues['priceRange']
  }

  if (params.get('minPrice')) filters.minPrice = params.get('minPrice') || ''
  if (params.get('maxPrice')) filters.maxPrice = params.get('maxPrice') || ''

  const status = params.get('status')
  if (status && ['ready', 'construction', 'planning'].includes(status)) {
    filters.status = status as FilterValues['status']
  }

  const sort = params.get('sort')
  if (sort) filters.sort = sort

  return filters
}

// Helper to build URL params from filters
const buildURLParams = (filters: FilterValues): URLSearchParams => {
  const params = new URLSearchParams()

  if (filters.city) params.set('city', filters.city)
  if (filters.area) params.set('area', filters.area)
  if (filters.developer) params.set('developer', filters.developer)
  if (filters.project) params.set('project', filters.project)
  if (filters.propertyType !== 'all') params.set('type', filters.propertyType)
  if (filters.bedrooms !== 'all') params.set('bedrooms', filters.bedrooms)
  if (filters.bathrooms !== 'all') params.set('bathrooms', filters.bathrooms)
  if (filters.priceRange !== 'all') params.set('priceRange', filters.priceRange)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.sort !== 'default') params.set('sort', filters.sort)

  return params
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FilterValues>(() => parseFiltersFromURL(location.search))
  const isInitialMount = useRef(true)

  const { data: options, isLoading, error } = useGetFilterOptions()

  // Sync filters FROM URL when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newFilters = parseFiltersFromURL(location.search)
    setFilters(newFilters)
  }, [location.search])

  // Sync filters TO URL when filters change
  useEffect(() => {
    // Skip on initial mount to avoid duplicate navigation
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const params = buildURLParams(filters)
    const newSearch = params.toString()
    const currentSearch = location.search.replace(/^\?/, '')

    // Only navigate if the search params actually changed
    if (newSearch !== currentSearch) {
      navigate(
        { pathname: location.pathname, search: newSearch ? `?${newSearch}` : '' },
        { replace: true }
      )
    }
  }, [filters, navigate, location.pathname, location.search])

  const updateFilter = useCallback(
    <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
      setFilters(prev => {
        const newFilters = { ...prev, [key]: value }

        // Reset dependent filters
        if (key === 'city') {
          newFilters.area = null
          newFilters.project = null
        }
        if (key === 'area') {
          newFilters.project = null
        }
        if (key === 'developer') {
          newFilters.project = null
        }

        return newFilters
      })
    },
    []
  )

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const getFilteredAreas = useCallback((): FilterOption[] => {
    if (!options?.areas) return []
    if (!filters.city) return options.areas

    // Filter areas by city - for now return all, will be filtered by citySlug after migration
    return options.areas
  }, [options, filters.city])

  const getFilteredProjects = useCallback((): FilterOption[] => {
    if (!options?.projects) return []

    return options.projects.filter(() => {
      // Filter by city, area, developer when those filters are implemented
      return true
    })
  }, [options])

  return (
    <FiltersContext.Provider
      value={{
        filters,
        options,
        isLoading,
        error: error as Error | null,
        updateFilter,
        resetFilters,
        getFilteredAreas,
        getFilteredProjects,
      }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFilters = () => {
  const context = useContext(FiltersContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider')
  }
  return context
}
