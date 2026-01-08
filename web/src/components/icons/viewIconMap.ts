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

export const viewIconMap = {
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
} as const

export const getViewIcon = (
  view: string
): React.ComponentType<{ size?: number; className?: string }> =>
  viewIconMap[view as keyof typeof viewIconMap] || Eye
