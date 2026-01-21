import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getProjectDetailRoute } from '../constants/routes'
import styles from './ProjectCard.module.scss'
import type { Property } from '../types/property'
import { useState } from 'react'

interface ProjectCardProps {
  property: Property
  onFavoriteClick?: (propertyId: string) => void
}

export default function ProjectCard({ property, onFavoriteClick }: ProjectCardProps) {
  const { t } = useTranslation()
  const [isFavorited, setIsFavorited] = useState(false) // Локальное состояние

  const formatPrice = (price: number, currency: string) => {
    const formatted = (price / 1000000).toFixed(1)
    return `${formatted}M ${currency}`
  }

  // Функция для разделения completionDate на первые 2 символа и остальное
  const splitCompletionDate = (dateString: string) => {
    if (dateString.length <= 2) {
      return {
        firstPart: dateString,
        rest: '',
      }
    }

    // Берем первые 2 символа
    const firstPart = dateString.substring(0, 2)
    // Берем остальную часть
    const rest = dateString.substring(2)

    return {
      firstPart,
      rest: rest.trim(), // Убираем лишние пробелы
    }
  }

  {
    /*
  const formatBedrooms = (bedrooms: string[]) => {
    return bedrooms.join(', ')
  }
  */
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Переключаем состояние
    setIsFavorited(!isFavorited)
    onFavoriteClick?.(property.id)
  }

  const { firstPart, rest } = splitCompletionDate(property.completionDate)

  return (
    <Link to={getProjectDetailRoute(property.id)} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img src={property.image} alt={property.title} />
          {property.isRecommended && (
            <span className={styles.recommendedBadge}>{t('projectCard.recommended')}</span>
          )}
          <button
            className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
            onClick={handleFavoriteClick}
            type="button"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={20} />
          </button>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.developerInfo}>
            <div className={styles.developerLogoContainer}>
              {property.logoUrl && (
                <div className={styles.developerLogo}>
                  <img src={property.logoUrl} alt={property.developer} />
                </div>
              )}
            </div>
            <div className={styles.projectNameContainer}>
              <div className={styles.projectTitleRow}>
                <span className={styles.projectTitle}>{property.title}</span>
              </div>
              <div className={styles.developerRow}>
                <span className={styles.developerName}>{property.developer}</span>
              </div>
              <div className={styles.regionRow}>
                <span className={styles.regionName}>{property.location}</span>
              </div>
            </div>
          </div>

          {/* ROI Badge (заглушка 7%) */}
          <div className={styles.roiContainer}>
            <span className={styles.roiValue}>ROI 7%</span>
          </div>
        </div>
        <div className={styles.priceContainer}>
          <div className={styles.priceRow}>
            <div className={styles.attributeContainer}>
              <span className={styles.attributeLabel}>Developer price:</span>
            </div>
            <div className={styles.priceValueContainer}>
              <span className={styles.priceValue}>
                <span className={styles.from}>{t('from')}</span>{' '}
                {formatPrice(property.priceFrom, property.currency)}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.paymentPlanContainer}>
          <div className={styles.dateContainer}>
            <span className={styles.dateValue}>
              <span className={styles.quarter}>{firstPart}</span>
              {rest && <span className={styles.year}> {rest}</span>}
            </span>
          </div>
          <div className={styles.planContainer}>
            <span className={styles.planValue}>
              <span className={styles.planLabel}>PP: </span>
              <span className={styles.planNumbers}>30/10/60</span>
            </span>
          </div>
        </div>

        {/* Блок с дополнительной информацией о цене 
        <div className={styles.content}>
          <p className={styles.priceInfo}>
            {property.types.join(', ')} {formatBedrooms(property.bedrooms)} {t('projectCard.from')}{' '}
            {formatPrice(property.priceFrom, property.currency)}
          </p>
        </div>
        */}
      </div>
    </Link>
  )
}
