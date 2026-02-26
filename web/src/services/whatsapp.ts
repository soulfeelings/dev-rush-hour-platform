import { formatPrice, formatArea } from '../utils/format'

const PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '971544313048'

export function openWhatsApp(text: string) {
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, '_blank')
}

export interface ProjectMessageParams {
  projectName?: string
  areaName?: string
  developerName?: string
  price?: number
  currency?: Parameters<typeof formatPrice>[1]
  projectLink?: string | null
  lang?: string
}

export function buildProjectMessage(params: ProjectMessageParams): string {
  console.log('[buildProjectMessage] params:', params)
  return [
    "Hello! I'm a user from Rush Hour Platform. I'm interested in this project:",
    `- Project: ${params.projectName || '-'}`,
    params.areaName ? `- Area: ${params.areaName}` : null,
    params.developerName ? `- Developer: ${params.developerName}` : null,
    params.price && params.currency
      ? `- Price: ${formatPrice(params.price, params.currency)}`
      : null,
    '',
    params.projectLink ? `Project: ${params.projectLink}` : null,
    '',
    params.lang ? `User language: ${params.lang}` : null,
  ]
    .filter(v => v != null)
    .join('\n')
}

export interface LotMessageParams {
  projectName?: string
  areaName?: string
  typeLabel?: string
  bedrooms?: number
  bathrooms?: number
  areaSqm?: number
  floor?: number
  price?: number
  currency?: Parameters<typeof formatPrice>[1]
  unit?: Parameters<typeof formatArea>[1]
  lotLink?: string | null
  projectLink?: string | null
  lang?: string
}

export function buildLotMessage(params: LotMessageParams): string {
  console.log('[buildLotMessage] params:', params)
  return [
    "Hello! I'm a user from Rush Hour Platform. I'm interested in this property:",
    `- Project: ${params.projectName || '-'}`,
    params.areaName ? `- Area: ${params.areaName}` : null,
    params.typeLabel ? `- Type: ${params.typeLabel}` : null,
    params.bedrooms != null ? `- Bedrooms: ${params.bedrooms}` : null,
    params.bathrooms != null ? `- Bathrooms: ${params.bathrooms}` : null,
    params.areaSqm != null && params.unit
      ? `- Size: ${formatArea(params.areaSqm, params.unit)}`
      : null,
    params.floor != null ? `- Floor: ${params.floor}` : null,
    params.price && params.currency
      ? `- Price: ${formatPrice(params.price, params.currency)}`
      : null,
    '',
    params.lotLink ? `Lot: ${params.lotLink}` : null,
    params.projectLink ? `Project: ${params.projectLink}` : null,
    '',
    params.lang ? `User language: ${params.lang}` : null,
  ]
    .filter(v => v != null)
    .join('\n')
}
