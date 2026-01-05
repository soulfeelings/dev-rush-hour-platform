import type { components } from '../api'
import type { Property } from '../data/mockProperties'

type ApiProject = components['schemas']['Project']

// Функция для преобразования API Project в Property формат
export function apiProjectToProperty(apiProject: ApiProject): Property {
  // Извлекаем данные из API ответа
  const specs = apiProject.data?.specs as any
  const media = apiProject.data?.media
  const description = apiProject.data?.description

  // Получаем основные поля
  // Используем slug как ID для навигации к деталям проекта
  const id = apiProject.slug || apiProject.id || ''
  const title = apiProject.name || ''
  const location = 'Dubai' // Пока заглушка, потом можно получить из area
  const developer = 'Developer' // Пока заглушка, потом можно получить из developer
  const status = apiProject.status === 'ready' ? 'active' : 'inactive'

  // Получаем specs данные
  const priceFrom = specs?.priceFrom || 0
  const currency = specs?.currency || 'AED'
  const types = specs?.types || ['Первичная']
  const bedrooms = specs?.bedrooms || ['Ст']
  const completionDate = specs?.completionDate || '2025-01-01'

  // Получаем изображение
  const image = media?.cover?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'

  // Получаем координаты
  const coordinates: [number, number] = [
    apiProject.lat ? Number(apiProject.lat) : 25.1972,
    apiProject.lng ? Number(apiProject.lng) : 55.2744
  ]

  // Получаем sale из базы данных или определяем по умолчанию
  const sale = getSaleFromStatus(apiProject.status)

  return {
    id,
    title,
    location,
    developer,
    priceFrom,
    currency,
    types,
    bedrooms,
    completionDate,
    area: specs?.area || 0,
    areaUnit: specs?.areaUnit || 'sq. ft.',
    image,
    coordinates,
    sale,
    status,
    description: typeof description === 'string' ? description : '',
    isRecommended: specs?.isRecommended || false,
    isFeatured: specs?.isFeatured || false,
    tags: specs?.tags || []
  }
}

// Вспомогательная функция для определения sale статуса
function getSaleFromStatus(status?: string): Property['sale'] {
  switch (status) {
    case 'ready':
      return 'sale'
    case 'construction':
      return 'start of sales'
    case 'planning':
      return 'sales announcement'
    default:
      return 'sale'
  }
}

// Функция для преобразования массива API проектов
export function apiProjectsToProperties(apiProjects: ApiProject[]): Property[] {
  return apiProjects.map(apiProjectToProperty)
}
