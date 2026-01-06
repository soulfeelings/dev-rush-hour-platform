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
  const image = media?.cover?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
  const gallery = media?.gallery?.map(item => item.url)

  // Получаем координаты
  const coordinates: [number, number] = [
    apiProject.lat ? Number(apiProject.lat) : 25.1972,
    apiProject.lng ? Number(apiProject.lng) : 55.2744
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
    tags
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
