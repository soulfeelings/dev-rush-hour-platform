export const ADMIN_ROUTES = {
  BASE: '/admin',
  AUTH: '/admin/auth',
  PROJECTS: '/admin/projects',
  LOTS: '/admin/lots',
  AREAS: '/admin/areas',
  CITIES: '/admin/cities',
  BADGES: '/admin/badges',
  INFRASTRUCTURES: '/admin/infrastructures',
  DEVELOPERS: '/admin/developers',
  MEDIA: '/admin/media',
  TEAM: '/admin/team',
} as const

export const ADMIN_ROUTE_SEGMENTS = {
  PROJECTS: 'projects',
  LOTS: 'lots',
  AREAS: 'areas',
  CITIES: 'cities',
  BADGES: 'badges',
  INFRASTRUCTURES: 'infrastructures',
  DEVELOPERS: 'developers',
  MEDIA: 'media',
  TEAM: 'team',
} as const

export const ADMIN_API_ENDPOINTS = {
  DEVELOPERS: '/admin/developers',
  PROJECTS: '/admin/projects',
  LOTS: '/admin/lots',
  AREAS: '/admin/areas',
  CITIES: '/admin/cities',
  BADGES: '/admin/badges',
  INFRASTRUCTURES: '/admin/infrastructures',
  MEDIA: '/admin/media',
} as const
