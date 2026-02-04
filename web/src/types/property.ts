export interface PriceByType {
  type: string
  price: number
}

export interface PropertyBadge {
  id: string
  slug: string
  name: string
  backgroundColor: string
  textColor: string
  icon?: string
}

export interface Property {
  id: string
  title: string
  location: string
  developer: string
  priceFrom: number
  currency: string
  types: string[]
  bedrooms: string[]
  completionDate: string
  area: number
  areaUnit: string
  image: string
  hoverImage?: string
  gallery?: string[]
  logo?: string
  logoUrl?: string
  tags?: string[]
  isRecommended?: boolean
  coordinates: [number, number]
  isFeatured?: boolean
  description?: string
  sale: 'start of sales' | 'sales announcement' | 'sale'
  status: 'active' | 'inactive'
  districtId?: string
  // Новые поля для карточки
  discount?: number // процент скидки, например 25
  roi?: number // процент ROI, например 7
  paymentPlan?: string // план платежей, например "30/10/60"
  pricesByType?: PriceByType[] // цены по типам для hover секции
  badges?: PropertyBadge[] // бейджи проекта
}
