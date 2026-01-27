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
  discount?: number // процент скидки, например 25
}
