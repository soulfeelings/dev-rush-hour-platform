import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './LotCard.module.scss'
import LotCardCarousel from './LotCardCarousel'
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

  // Пока используем одну картинку несколько раз для тестирования карусели
  const firstImage =
    lotImages.length > 0
      ? lotImages[0]
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
  const images = [firstImage, firstImage, firstImage, firstImage]

  const typeLabel = lot.type ? lot.type.charAt(0).toUpperCase() + lot.type.slice(1) : ''
  const bedroomsLabel = lot.bedrooms ? `${lot.bedrooms} BR` : ''
  const price = lot.priceAmount || 0
  const currency = lot.priceCurrency || 'AED'
  const priceText = formatPrice(price, currency)
  const roomsAndArea = [bedroomsLabel, lot.areaSqm ? `${lot.areaSqm} sqm` : '']
    .filter(Boolean)
    .join(' • ')
  const projectInfo = [projectName, developerName, location].filter(Boolean).join(' • ')

  return (
    <Link to={`/lot/${lot.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <LotCardCarousel images={images} alt={projectName} />
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
          <h1 className={styles.price}>{priceText}</h1>
          <h2 className={styles.details}>{roomsAndArea || typeLabel}</h2>
          <h3 className={styles.info}>{projectInfo}</h3>
        </div>
      </div>
    </Link>
  )
}
