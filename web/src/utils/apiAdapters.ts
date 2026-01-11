import type { Property } from '../types/property'

// Тип для API проекта (фактическая структура из backend)
interface ApiProject {
  id?: string
  slug?: string
  name?: string
  status?: string
  sale?: string
  developerId?: string
  areaId?: string
  lat?: number
  lng?: number
  data?: {
    description?: string
    specs?: Record<string, unknown>
    featuresAmenities?: unknown[]
    media?: {
      cover?: {
        url?: string
      }
      gallery?: Array<{
        url: string
      }>
    }
    // Эти поля находятся в корне data, не в specs
    isRecommended?: boolean
    isFeatured?: boolean
    tags?: string[]
  }
  // Вложенные данные от бэкенда (если включены)
  developer?: {
    name?: string
    data?: {
      logoUrl?: string
    }
  }
  area?: {
    name?: string
    city?: string
  }
  createdAt?: string
  updatedAt?: string
}

// Функция для преобразования API Project в Property формат
export function apiProjectToProperty(apiProject: ApiProject): Property {
  // Извлекаем данные из API ответа
  const specs = apiProject.data?.specs as Record<string, unknown> | undefined
  const media = apiProject.data?.media
  const description = apiProject.data?.description

  // Получаем основные поля
  // Используем slug как ID для навигации к деталям проекта
  const id = apiProject.slug || apiProject.id || ''
  const title = apiProject.name || ''
  const location = apiProject.area?.name || 'Dubai'
  const developer = apiProject.developer?.name || 'Developer'
  const logoUrl = apiProject.developer?.data?.logoUrl
  const status = apiProject.status === 'active' ? 'active' : 'inactive'

  // Получаем specs данные
  const priceFrom = (specs?.priceFrom as number) ?? 0
  const currency = (specs?.currency as string) ?? 'AED'
  const types = (specs?.types as string[]) ?? ['Первичная']
  const bedrooms = (specs?.bedrooms as string[]) ?? ['Ст']
  const completionDate = (specs?.completionDate as string) ?? '2025-01-01'

  // Получаем изображение
  const image =
    media?.cover?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
  const gallery = media?.gallery?.map(item => item.url)

  // Получаем координаты
  const coordinates: [number, number] = [
    apiProject.lat ? Number(apiProject.lat) : 25.1972,
    apiProject.lng ? Number(apiProject.lng) : 55.2744,
  ]

  // Получаем sale из базы данных
  const sale = getSaleFromStatus(apiProject.sale)

  // isRecommended, isFeatured, tags находятся в корне data, не в specs!
  const isRecommended = apiProject.data?.isRecommended ?? false
  const isFeatured = apiProject.data?.isFeatured ?? false
  const tags = apiProject.data?.tags ?? []

  return {
    id,
    title,
    location,
    developer,
    logoUrl,
    priceFrom,
    currency,
    types,
    bedrooms,
    completionDate,
    area: (specs?.area as number) ?? 0,
    areaUnit: (specs?.areaUnit as string) ?? 'sq. ft.',
    image,
    gallery,
    coordinates,
    sale,
    status,
    description: typeof description === 'string' ? description : '',
    isRecommended,
    isFeatured,
    tags,
  }
}

// Вспомогательная функция для определения sale статуса
function getSaleFromStatus(sale?: string): Property['sale'] {
  switch (sale) {
    case 'sale':
      return 'sale'
    case 'start of sales':
      return 'start of sales'
    case 'sales announcement':
      return 'sales announcement'
    default:
      return 'sale'
  }
}

// Функция для преобразования массива API проектов
export function apiProjectsToProperties(apiProjects: unknown[]): Property[] {
  return (apiProjects as ApiProject[]).map(apiProjectToProperty)
}

// Тип для API лота с вложенными данными
interface ApiLot {
  id?: string
  projectId?: string
  type?: string
  bedrooms?: number
  bathrooms?: number
  areaSqm?: number
  floor?: number
  priceCurrency?: string
  priceAmount?: number
  data?: {
    media?: {
      cover?: {
        url?: string
      }
      photos?: Array<{
        url?: string
      }>
    }
  }
  project?: {
    id?: string
    slug?: string
    name?: string
    lat?: number
    lng?: number
    sale?: string
    status?: string
    developer?: {
      name?: string
      data?: {
        logoUrl?: string
      }
    }
    area?: {
      name?: string
    }
  }
  developer?: {
    name?: string
    data?: {
      logoUrl?: string
    }
  }
  area?: {
    name?: string
  }
}

// Функция для преобразования лота в Property для карты (использует координаты проекта)
export function apiLotToPropertyForMap(apiLot: ApiLot): Property | null {
  // Для карты нужны координаты проекта
  const project = apiLot.project
  if (!project || project.lat === undefined || project.lng === undefined) {
    return null
  }

  const projectName = project.name || 'Project'
  const developerName = project.developer?.name || apiLot.developer?.name || 'Developer'
  const location = project.area?.name || apiLot.area?.name || 'Dubai'
  const logoUrl = project.developer?.data?.logoUrl || apiLot.developer?.data?.logoUrl

  const typeLabel = apiLot.type ? apiLot.type.charAt(0).toUpperCase() + apiLot.type.slice(1) : ''
  const bedroomsLabel = apiLot.bedrooms ? `${apiLot.bedrooms} BR` : ''
  const price = apiLot.priceAmount || 0
  const currency = apiLot.priceCurrency || 'AED'

  const image =
    apiLot.data?.media?.cover?.url ||
    apiLot.data?.media?.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'

  const coordinates: [number, number] = [
    project.lat ? Number(project.lat) : 25.1972,
    project.lng ? Number(project.lng) : 55.2744,
  ]

  const sale = getSaleFromStatus(project.sale)
  const status = project.status === 'active' ? 'active' : 'inactive'

  return {
    id: apiLot.id || '',
    title: `${projectName} - ${typeLabel} ${bedroomsLabel}`.trim(),
    location,
    developer: developerName,
    logoUrl,
    priceFrom: price,
    currency,
    types: [typeLabel],
    bedrooms: bedroomsLabel ? [bedroomsLabel] : [],
    completionDate: '',
    area: apiLot.areaSqm || 0,
    areaUnit: 'sqm',
    image,
    coordinates,
    sale,
    status,
    description: '',
    isRecommended: false,
    isFeatured: false,
    tags: [],
  }
}

// Функция для преобразования массива лотов в Property для карты
export function apiLotsToPropertiesForMap(apiLots: unknown[]): Property[] {
  return (apiLots as ApiLot[])
    .map(apiLotToPropertyForMap)
    .filter((property): property is Property => property !== null)
}
