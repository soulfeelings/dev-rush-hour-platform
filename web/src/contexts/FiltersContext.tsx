import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
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
}

// Filter options will be fetched using the generated hook

export function FiltersProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)

  const { data: options, isLoading, error } = useGetFilterOptions()

  // Sync filters with URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const newFilters = { ...defaultFilters }

    if (params.get('city')) newFilters.city = params.get('city')
    if (params.get('area')) newFilters.area = params.get('area')
    if (params.get('developer')) newFilters.developer = params.get('developer')
    if (params.get('project')) newFilters.project = params.get('project')
    if (params.get('type')) {
      const type = params.get('type')
      if (['apartment', 'villa', 'townhouse', 'penthouse', 'duplex'].includes(type || '')) {
        newFilters.propertyType = type as FilterValues['propertyType']
      }
    }
    if (params.get('bedrooms')) {
      const beds = params.get('bedrooms')
      if (['studio', '1', '2', '3', '4+'].includes(beds || '')) {
        newFilters.bedrooms = beds as FilterValues['bedrooms']
      }
    }
    if (params.get('bathrooms')) {
      const baths = params.get('bathrooms')
      if (['1', '2', '3', '4+'].includes(baths || '')) {
        newFilters.bathrooms = baths as FilterValues['bathrooms']
      }
    }
    if (params.get('minPrice')) newFilters.minPrice = params.get('minPrice') || ''
    if (params.get('maxPrice')) newFilters.maxPrice = params.get('maxPrice') || ''

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(newFilters)
  }, [location.search])

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
