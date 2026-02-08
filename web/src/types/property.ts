/**
 * View model types for UI components.
 * These types flatten and transform the API types (Project, Badge, etc.)
 * to provide a simpler interface for components with required fields.
 * Transformation happens in src/utils/apiAdapters.ts
 */

export interface PriceByType {
  type: string
  price: number
}

/** View model for Badge - ensures required fields for safe component usage */
export interface PropertyBadge {
  id: string
  slug: string
  name: string
  backgroundColor: string
  textColor: string
  icon?: string
  iconColor?: string
}

/** View model for Project - flattened structure for UI components */
export interface Property {
  id: string
  title: string
  location?: string
  developer?: string
  priceFrom?: number
  currency?: string
  types?: string[]
  bedrooms?: string[]
  completionDate?: string
  area?: number
  areaUnit?: string
  image?: string
  hoverImage?: string
  gallery?: string[]
  logoUrl?: string
  tags?: string[]
  isRecommended?: boolean
  coordinates?: [number, number]
  isFeatured?: boolean
  description?: string
  sale?: 'start of sales' | 'sales announcement' | 'sale'
  status: 'active' | 'inactive'
  districtId?: string
  discount?: number
  roi?: number
  paymentPlan?: string
  pricesByType?: PriceByType[]
  badges?: PropertyBadge[]
}
