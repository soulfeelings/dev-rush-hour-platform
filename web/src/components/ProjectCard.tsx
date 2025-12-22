import { Heart } from 'lucide-react'
import styles from './ProjectCard.module.scss'
import type { Property } from '../data/mockProperties'

interface ProjectCardProps {
  property: Property
  onFavoriteClick?: (propertyId: string) => void
}

export default function ProjectCard({ property, onFavoriteClick }: ProjectCardProps) {
  const formatPrice = (price: number, currency: string) => {
    const formatted = (price / 1000000).toFixed(1)
    return `${formatted} млн ${currency}`
  }

  const formatBedrooms = (bedrooms: string[]) => {
    return bedrooms.join(', ')
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={property.image} alt={property.title} />
        {property.isRecommended && (
          <span className={styles.recommendedBadge}>РЕКОМЕНДОВАНО</span>
        )}
        {property.logo && <div className={styles.logo}>{property.logo}</div>}
        <button
          className={styles.favoriteButton}
          onClick={() => onFavoriteClick?.(property.id)}
          type="button"
        >
          <Heart size={20} />
        </button>
      </div>
      <div className={styles.content}>
        <p className={styles.developer}>{property.developer}</p>
        <p className={styles.location}>{property.location}</p>
        <p className={styles.priceInfo}>
          {property.types.join(', ')} {formatBedrooms(property.bedrooms)} от{' '}
          {formatPrice(property.priceFrom, property.currency)}
        </p>
        <p className={styles.completionDate}>{property.completionDate}</p>
      </div>
    </div>
  )
}
