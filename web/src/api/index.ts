// Публичный API
export * from './generated/rushHourRealEstatePlatformAPI'

// Админский API - экспортируем отдельно, чтобы избежать конфликтов имен
export * as AdminApi from './generated/admin/rushHourRealEstatePlatformAPI'

// Схемы и типы
export * from './generated/schemas'

// Клиенты и утилиты
export { apiClient } from './client'
export { customInstance } from './mutator'
export { adminInstance } from './adminMutator'
export { queryClient } from './queryClient'
