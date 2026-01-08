// Централизованные иконки для использования во всех компонентах
// SVG иконки для недвижимости

interface IconProps {
  size?: number
  className?: string
}

// Иконка спальни
export const IconBed = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
  </svg>
)

// Иконка ванной комнаты
export const IconBath = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1zM6 12V5a2 2 0 0 1 2-2h3v2.25M4 21l1-1.5M20 21l-1-1.5" />
  </svg>
)

// Иконка этажа (дом)
export const IconFloor = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

// Иконка площади
export const IconArea = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
)

// Иконка локации
export const IconLocation = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

// Иконка щита (безопасность)
export const IconShield = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

// Иконка дома
export const IconHome = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

// Иконка пользователей
export const IconUsers = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

// Иконка закрытия (X)
export const IconX = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

// Иконка сервиса
export const IconService = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width={size}
    height={size}
    className={className}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
)

// Реэкспорт lucide-react иконок для View (вид из окна)
export {
  Eye as IconEye,
  Mountain as IconMountain,
  Building2 as IconBuilding,
  Waves as IconWaves,
  TreePalm as IconPalm,
  Flower2 as IconGarden,
  Droplets as IconPool,
  Sailboat as IconMarina,
  Landmark as IconLandmark,
  MapPin as IconMapPin,
} from 'lucide-react'

// Маппинг view на иконки
import {
  Eye,
  Mountain,
  Building2,
  Waves,
  TreePalm,
  Flower2,
  Droplets,
  Sailboat,
  Landmark,
  MapPin,
} from 'lucide-react'

export const viewIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'Marina View': Sailboat,
  'City View': Building2,
  'Panoramic Sea View': Waves,
  'Sea View': Waves,
  'Garden View': Flower2,
  'Street View': MapPin,
  'Pool View': Droplets,
  'Beach Front': TreePalm,
  'Island View': TreePalm,
  'Palm View': TreePalm,
  'Fountain View': Droplets,
  'Panoramic City View': Building2,
  'Direct Beach Access': TreePalm,
  'Burj Khalifa View': Landmark,
  'Mountain View': Mountain,
}

export const getViewIcon = (view: string) => {
  return viewIconMap[view] || Eye
}

