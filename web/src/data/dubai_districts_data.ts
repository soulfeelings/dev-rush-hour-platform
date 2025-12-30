import dubaiDistricts from './dubai_districts.json'

interface DistrictFeatures {
  waterfront: boolean
  beach_access: boolean
  park_view: boolean
  city_view: boolean
}

interface DistrictProperties {
  name: string
  name_ar: string
  description: string
  category: string
  avg_price_aed: number
  avg_price_usd: number
  property_count: number
  apartment_count: number
  villa_count: number
  population: number
  area_km2: number
  image: string
  developers: string[]
  amenities: string[]
  popular_compounds: string[]
  metro_stations: string[]
  build_year: number
  completion_status: string
  walkability_score: number
  investment_grade: string
  rental_yield: number
  price_trend: string
  features: DistrictFeatures
  tags: string[]
  visible: boolean
  color: string
}

interface GeoJsonFeature {
  id: string
  properties: DistrictProperties
  geometry: {
    type: string
    coordinates: number[][][]
  }
}

export interface District extends DistrictProperties {
  id: string
  geometry: {
    type: string
    coordinates: number[][][]
  }
}

export const districts: District[] = (
  dubaiDistricts as unknown as { features: GeoJsonFeature[] }
).features.map((feature: GeoJsonFeature) => {
  return {
    id: feature.id,
    ...feature.properties,
    geometry: feature.geometry,
  }
})
