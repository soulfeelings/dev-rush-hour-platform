import type { Project } from '../api/generated/schemas/project'
import type { Badge } from '../api/generated/schemas/badge'

export function getProjectSlug(project: Project): string {
  return project.slug || project.id || ''
}

export function getCoordinates(project: Project): [number, number] | undefined {
  if (project.lat !== undefined && project.lng !== undefined) {
    return [project.lat, project.lng]
  }
  return undefined
}

export function getDiscount(project: Project): number | undefined {
  const ourPrice = project.priceFromUs
  const developerPrice = project.priceFromDeveloper
  if (ourPrice && developerPrice && developerPrice > ourPrice) {
    return Math.round((1 - ourPrice / developerPrice) * 100)
  }
  return undefined
}

export function getDescriptionText(project: Project): string | undefined {
  const desc = project.description
  return typeof desc === 'string' ? desc : undefined
}

export interface ValidBadge {
  id: string
  slug: string
  name: string
  backgroundColor: string
  textColor: string
  icon?: string
  iconColor?: string
}

export function getValidBadges(badges?: Badge[]): ValidBadge[] {
  if (!badges) return []
  return badges
    .filter((b): b is Badge & { id: string; name: string } => !!b.id && !!b.name)
    .map(b => ({
      id: b.id,
      slug: b.slug ?? '',
      name: b.name,
      backgroundColor: b.backgroundColor ?? '#000000',
      textColor: b.textColor ?? '#FFFFFF',
      icon: b.icon,
      iconColor: b.iconColor,
    }))
}
