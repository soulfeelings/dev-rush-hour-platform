export const ROUTES = {
  CATALOG: '/catalog',
  PROJECTS: '/catalog/projects',
  APARTMENTS: '/catalog/apartments',
  PROJECT_DETAIL: '/project/:slug',
  LOT_DETAIL: '/lot/:id',
  AREAS: '/areas',
  AREA_DETAIL: '/area/:id',
  DEVELOPER_DETAIL: '/developer/:slug',
  DESIGN_DEMO: '/design-demo',
  ADMIN: '/admin',
} as const

export const getProjectDetailRoute = (slug: string) => `/project/${slug}`
export const getLotDetailRoute = (id: string | number) => `/lot/${id}`
export const getAreaDetailRoute = (id: string | number) => `/area/${id}`
export const getDeveloperDetailRoute = (slug: string) => `/developer/${slug}`
