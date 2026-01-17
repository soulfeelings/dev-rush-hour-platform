import { Heart, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getLotDetailRoute } from '../constants/routes'
import styles from './ProjectCard.module.scss'
import type { Lot } from '../api'

interface LotWithProject extends Lot {
  project?: {
    name?: string
    slug?: string
    lat?: number
    lng?: number
    image?: string
    developer?: {
      name?: string
      data?: {
        logoUrl?: string
      }
    }
    area?: {
      name?: string
    }
  }
  developer?: {
    name?: string
    data?: {
      logoUrl?: string
    }
  }
  area?: {
    name?: string
    city?: string
  }
}

interface LotCardProps {
  lot: LotWithProject
  onFavoriteClick?: (lotId: string) => void
}

export default function LotCard({ lot, onFavoriteClick }: LotCardProps) {
  const { t } = useTranslation()

  const formatPrice = (price: number, currency: string) => {
    const formatted = (price / 1000000).toFixed(1)
    return `${formatted}M ${currency}`
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (lot.id) {
      onFavoriteClick?.(lot.id)
    }
  }

  const projectName = lot.project?.name || 'Project'
  const developerName = lot.developer?.name || lot.project?.developer?.name || 'Developer'
  const areaName = lot.area?.name || lot.project?.area?.name
  const cityName = lot.area?.city
  const locationParts = [areaName, cityName].filter((part): part is string => Boolean(part))
  const location = locationParts.length ? locationParts.join(', ') : 'Dubai'
  const logoUrl = lot.project?.developer?.data?.logoUrl || lot.developer?.data?.logoUrl
  // Используем изображения лота (как в LotDetail)
  const lotImages = [
    ...(lot.data?.media?.cover?.url ? [lot.data.media.cover.url] : []),
    ...(lot.data?.media?.photos?.map(img => img.url).filter((url): url is string => Boolean(url)) ||
      []),
  ]

  const image = lotImages[0]
  const hasImage = Boolean(image)

  const typeLabel = lot.type ? lot.type.charAt(0).toUpperCase() + lot.type.slice(1) : ''
  const bedroomsLabel = lot.bedrooms ? `${lot.bedrooms} BR` : ''
  const price = lot.priceAmount || 0
  const currency = lot.priceCurrency || 'AED'

  if (!lot.id) {
    return null
  }

  return (
    <Link to={getLotDetailRoute(lot.id)} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {hasImage ? (
            <img src={image} alt={projectName} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Building2 size={48} />
            </div>
          )}
          {logoUrl && (
            <div className={styles.logo}>
              <img src={logoUrl} alt={developerName} />
            </div>
          )}
          <button className={styles.favoriteButton} onClick={handleFavoriteClick} type="button">
            <Heart size={20} />
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.title}>{projectName}</p>
          <p className={styles.developer}>{developerName}</p>
          <p className={styles.location}>{location}</p>
          <p className={styles.priceInfo}>
            {typeLabel} {bedroomsLabel} {t('projectCard.from')} {formatPrice(price, currency)}
          </p>
          {lot.areaSqm && <p className={styles.completionDate}>{lot.areaSqm} sqm</p>}
        </div>
      </div>
    </Link>
  )
}
