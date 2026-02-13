import type { Lot } from '../api'
import type { FilterValues } from '../contexts'

export const filterAndSortLots = (lots: Lot[], filters: FilterValues): Lot[] => {
  const filtered = lots.filter(lot => {
    // Only show active lots
    if (lot.status !== 'active') return false

    // Type filter (lotType)
    if (filters.lotType !== 'all') {
      if (lot.type !== filters.lotType) return false
    }

    // Developer filter
    if (filters.developer) {
      const devId = lot.developerId || lot.developer?.id || lot.project?.developer?.id
      if (devId !== filters.developer) return false
    }

    // Price filter (against ourPrice if set, otherwise priceAmount)
    const effectivePrice = lot.ourPrice ?? lot.priceAmount ?? 0
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice)
      if (!isNaN(min) && effectivePrice < min) return false
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice)
      if (!isNaN(max) && effectivePrice > max) return false
    }

    // Bedrooms filter (multi-select)
    if (filters.bedrooms.length > 0) {
      const beds = lot.bedrooms
      const match = filters.bedrooms.some(b => {
        if (b === 'studio') return beds === 0
        if (b === '7+') return (beds ?? 0) >= 7
        return beds === parseInt(b, 10)
      })
      if (!match) return false
    }

    // Bathrooms filter (multi-select)
    if (filters.bathrooms.length > 0) {
      const baths = lot.bathrooms
      const match = filters.bathrooms.some(b => {
        if (b === '7+') return (baths ?? 0) >= 7
        return baths === parseInt(b, 10)
      })
      if (!match) return false
    }

    // ROI filter (roiMin — minimum ROI in percent)
    if (filters.roiMin) {
      const minRoi = parseFloat(filters.roiMin)
      if (!isNaN(minRoi)) {
        const lotRoi = lot.roi ?? null
        if (lotRoi === null || lotRoi < minRoi) return false
      }
    }

    // Search filter (project name, developer, area)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const projectName = lot.project?.name?.toLowerCase() ?? ''
      const developerName = (lot.developer?.name || lot.project?.developer?.name)?.toLowerCase() ?? ''
      const areaName = (lot.area?.name || lot.project?.area?.name)?.toLowerCase() ?? ''
      if (!projectName.includes(q) && !developerName.includes(q) && !areaName.includes(q)) {
        return false
      }
    }

    return true
  })

  // Sort lots
  if (filters.sort && filters.sort !== 'default') {
    return filtered.sort((a, b) => {
      // Helper: get effective price
      const getPrice = (lot: Lot) => lot.ourPrice ?? lot.priceAmount ?? 0

      switch (filters.sort) {
        case 'price_asc':
          return getPrice(a) - getPrice(b)
        case 'price_desc':
          return getPrice(b) - getPrice(a)
        case 'newest': {
          // Sort by updated_at or created_at
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
          return dateB - dateA
        }
        default:
          return 0
      }
    })
  }

  return filtered
}
