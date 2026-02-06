import type { Property, PriceByType, PropertyBadge } from '../types/property'
import type { Project } from '../api/generated/schemas/project'
import type { LotListItem } from '../api/generated/schemas/lotListItem'

// Функция для преобразования API Project в Property формат
export function apiProjectToProperty(apiProject: Project): Property {
  const specs = apiProject.data?.specs as Record<string, unknown> | undefined
  const media = apiProject.data?.media
  const description = apiProject.data?.description

  // Transform badges
  const badges: PropertyBadge[] = (apiProject.badges ?? [])
    .filter(b => b.id && b.name)
    .map(b => ({
      id: b.id!,
      slug: b.slug ?? '',
      name: b.name!,
      backgroundColor: b.backgroundColor ?? '#000000',
      textColor: b.textColor ?? '#FFFFFF',
      icon: b.icon,
    }))

  // Coordinates tuple
  const coordinates: [number, number] | undefined =
    apiProject.lat !== undefined && apiProject.lng !== undefined
      ? [apiProject.lat, apiProject.lng]
      : undefined

  return {
    id: apiProject.slug || apiProject.id || '',
    title: apiProject.name || '',
    location: apiProject.area?.name,
    developer: apiProject.developer?.name,
    logoUrl: media?.logo?.url,
    priceFrom: apiProject.data?.ourPrice ?? (specs?.priceFrom as number | undefined),
    currency: specs?.currency as string | undefined,
    types: specs?.types as string[] | undefined,
    bedrooms: specs?.bedrooms as string[] | undefined,
    completionDate:
      apiProject.data?.completionDate ?? (specs?.completionDate as string | undefined),
    area: specs?.area as number | undefined,
    areaUnit: specs?.areaUnit as string | undefined,
    image: media?.cover?.url,
    hoverImage: media?.hover?.url,
    gallery: media?.gallery?.map(item => item.url).filter((url): url is string => !!url),
    coordinates,
    sale: getSaleFromStatus(apiProject.sale),
    status: apiProject.status === 'active' ? 'active' : 'inactive',
    description: typeof description === 'string' ? description : undefined,
    isRecommended: apiProject.data?.isRecommended,
    isFeatured: apiProject.data?.isFeatured,
    tags: apiProject.data?.tags,
    discount: specs?.discount as number | undefined,
    roi: apiProject.data?.roi ?? (specs?.roi as number | undefined),
    paymentPlan: apiProject.data?.paymentPlan ?? (specs?.paymentPlan as string | undefined),
    pricesByType: specs?.pricesByType as PriceByType[] | undefined,
    badges: badges.length > 0 ? badges : undefined,
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
      return undefined
  }
}

// Функция для преобразования массива API проектов
export function apiProjectsToProperties(apiProjects: Project[]): Property[] {
  return apiProjects.map(apiProjectToProperty)
}

// Функция для преобразования лота в Property для карты (использует координаты проекта)
export function apiLotToPropertyForMap(apiLot: LotListItem): Property | null {
  const project = apiLot.project
  // Для карты нужны координаты проекта
  if (!project || project.lat === undefined || project.lng === undefined) {
    return null
  }

  const logoUrl =
    project.data?.media?.logo?.url ||
    ((project.developer?.data as Record<string, unknown>)?.logoUrl as string | undefined) ||
    ((apiLot.developer?.data as Record<string, unknown>)?.logoUrl as string | undefined)

  const typeLabel = apiLot.type ? apiLot.type.charAt(0).toUpperCase() + apiLot.type.slice(1) : ''
  const bedroomsLabel = apiLot.bedrooms ? `${apiLot.bedrooms} BR` : ''

  return {
    id: apiLot.id || '',
    title: [project.name, typeLabel, bedroomsLabel].filter(Boolean).join(' - '),
    location: project.area?.name || apiLot.area?.name,
    developer: project.developer?.name || apiLot.developer?.name,
    logoUrl,
    priceFrom: apiLot.priceAmount,
    currency: apiLot.priceCurrency,
    types: typeLabel ? [typeLabel] : undefined,
    bedrooms: bedroomsLabel ? [bedroomsLabel] : undefined,
    completionDate: undefined,
    area: apiLot.areaSqm,
    areaUnit: apiLot.areaSqm ? 'sqm' : undefined,
    image: apiLot.data?.media?.cover?.url || apiLot.data?.media?.photos?.[0]?.url,
    coordinates: [project.lat, project.lng],
    sale: getSaleFromStatus(project.sale),
    status: project.status === 'active' ? 'active' : 'inactive',
  }
}

// Функция для преобразования массива лотов в Property для карты
export function apiLotsToPropertiesForMap(apiLots: LotListItem[]): Property[] {
  return apiLots
    .map(apiLotToPropertyForMap)
    .filter((property): property is Property => property !== null)
}
