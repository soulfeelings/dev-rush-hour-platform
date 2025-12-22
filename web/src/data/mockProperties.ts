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
  logo?: string
  tags?: string[]
  isRecommended?: boolean
  coordinates: [number, number]
  isFeatured?: boolean
  description?: string
}

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Sea Legend Tower One: Меблированная 3-комнатная квартира',
    location: 'Dubai Marina',
    developer: 'Segrex Development L.L.C Агентство',
    priceFrom: 1200000,
    currency: 'AED',
    types: ['Первичная'],
    bedrooms: ['3К'],
    completionDate: '2025-12-31',
    area: 1533.25,
    areaUnit: 'sq. ft.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    logo: 'Segrex',
    tags: ['9 декабря', 'Акция для клиентов'],
    isRecommended: true,
    isFeatured: true,
    description: 'Полностью меблированная 3-комнатная квартира площадью 1,533.25 sq. ft. в Sea Legend Tower One',
    coordinates: [25.0772, 55.1398],
  },
  {
    id: '2',
    title: 'Colibri Views',
    location: 'Al Jazeera Al Hamra Industrial',
    developer: 'Major Developments',
    priceFrom: 1100000,
    currency: 'AED',
    types: ['Первичная'],
    bedrooms: ['Ст', '1К', '2К'],
    completionDate: '2029-Q1',
    area: 0,
    areaUnit: '',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    logo: 'COLIBRI VIEWS',
    isRecommended: true,
    coordinates: [25.2048, 55.2708],
  },
  {
    id: '3',
    title: 'Luz Ora Residences',
    location: 'Dubai Islands',
    developer: 'DIA Developments',
    priceFrom: 1600000,
    currency: 'AED',
    types: ['Первичная'],
    bedrooms: ['1К', '2К', '4К'],
    completionDate: '2027-Q2',
    area: 0,
    areaUnit: '',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    logo: 'Luz Ora Residences',
    isRecommended: true,
    coordinates: [25.2048, 55.2708],
  },
  {
    id: '4',
    title: 'Palm Jumeirah Residence',
    location: 'Palm Jumeirah',
    developer: 'Emaar Properties',
    priceFrom: 2500000,
    currency: 'AED',
    types: ['Первичная'],
    bedrooms: ['2К', '3К', '4К'],
    completionDate: '2026-Q3',
    area: 0,
    areaUnit: '',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    isRecommended: true,
    coordinates: [25.1124, 55.1390],
  },
  {
    id: '5',
    title: 'Downtown Dubai Tower',
    location: 'Downtown Dubai',
    developer: 'Emaar Properties',
    priceFrom: 1800000,
    currency: 'AED',
    types: ['Первичная'],
    bedrooms: ['1К', '2К', '3К'],
    completionDate: '2028-Q1',
    area: 0,
    areaUnit: '',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
    isRecommended: false,
    coordinates: [25.1972, 55.2744],
  },
]

export const featuredProperties = mockProperties.filter(p => p.isFeatured)

