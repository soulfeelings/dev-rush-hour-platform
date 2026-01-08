export type CatalogViewMode = 'projects' | 'lots'

const STORAGE_KEY = 'catalog-view-mode'

export const loadCatalogViewMode = (): CatalogViewMode => {
  if (typeof window === 'undefined') {
    return 'projects'
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'lots' ? 'lots' : 'projects'
  } catch (error) {
    console.warn('Failed to load catalog view mode:', error)
    return 'projects'
  }
}

export const saveCatalogViewMode = (mode: CatalogViewMode) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch (error) {
    console.warn('Failed to save catalog view mode:', error)
  }
}

