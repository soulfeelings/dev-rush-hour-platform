import * as L from 'leaflet'
import type { Property } from '../../types/property'

/**
 * Конфигурация порогов зума и соответствующих размеров
 */
const ZOOM_THRESHOLDS = {
  SMALL: 12,
  MEDIUM: 14,
}

const getMarkerConfig = (isRecommended: boolean, zoom: number, isSelected: boolean) => {
  if (isSelected) {
    return {
      size: 52,
      isSolid: false,
    }
  }

  if (isRecommended) {
    return {
      size: 50,
      isSolid: false,
    }
  }

  if (zoom < ZOOM_THRESHOLDS.SMALL) {
    return { size: 20, isSolid: true }
  }

  if (zoom < ZOOM_THRESHOLDS.MEDIUM) {
    return { size: 36, isSolid: false }
  }

  return { size: 46, isSolid: false }
}

const getStatusColor = (sale: Property['sale'] | string, isSelected: boolean) => {
  if (isSelected) {
    return '#dc2626'
  }

  switch (sale) {
    case 'sale':
      return '#2563eb'
    case 'start of sales':
      return '#e5a732'
    case 'sales announcement':
      return '#ef4444'
    default:
      return '#94a3b8'
  }
}

export const createPropertyMarkerIcon = (
  isRecommended: boolean,
  sale: Property['sale'] | string,
  logoUrl: string | undefined,
  zoom: number,
  isSelected: boolean = false
) => {
  const { size, isSolid } = getMarkerConfig(isRecommended, zoom, isSelected)
  const borderRadius = isRecommended ? '50%' : '2px'
  const color = getStatusColor(sale, isSelected)

  const backgroundStyle = isSolid
    ? `background: ${color};`
    : logoUrl
      ? `background-image: url('${logoUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: #ffffff;`
      : 'background: #ffffff;'

  const borderWidth = 4

  return L.divIcon({
    className: '',
    html: `<div style="width: ${size}px; height: ${size}px; ${backgroundStyle} border: ${borderWidth}px solid ${color}; border-radius: ${borderRadius}; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); cursor: pointer; overflow: hidden;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export { getMarkerConfig }
