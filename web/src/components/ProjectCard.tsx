import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { getProjectDetailRoute } from '../constants/routes'
import { Typography } from '../ui/Typography'
import styles from './ProjectCard.module.scss'
import type { Property } from '../types/property'

export interface CardBadge {
  text: string
  backgroundColor: string
  icon?: ReactNode
}

interface ProjectCardProps {
  property: Property
  badges?: CardBadge[]
  onFavoriteClick?: (propertyId: string) => void
}

const formatPrice = (price: number, currency: string) => {
  const formatted = (price / 1000000).toFixed(1)
  return `${formatted}M ${currency}`
}

const splitCompletionDate = (dateString: string) => {
  if (dateString.length <= 2) {
    return {
      firstPart: dateString,
      rest: '',
    }
  }

  const firstPart = dateString.substring(0, 2)
  const rest = dateString.substring(2)

  return {
    firstPart,
    rest: rest.trim(),
  }
}

export const ProjectCard = ({ property, badges = [], onFavoriteClick }: ProjectCardProps) => {
  const { t } = useTranslation()
  const [isFavorited, setIsFavorited] = useState(false)

  const { firstPart, rest } = splitCompletionDate(property.completionDate)
  const secondaryImage = property.gallery?.[0]

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteClick?.(property.id)
  }

  return (
    <Link to={getProjectDetailRoute(property.id)} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          {/* Область картинок */}
          <div className={styles.imagesWrapper}>
            {/* Основная картинка */}
            <div className={styles.imageContainer}>
              <img src={property.image} alt={property.title} />
            </div>

            {/* Вторая картинка (появляется при hover) */}
            {secondaryImage && (
              <div className={styles.secondaryImageContainer}>
                <img src={secondaryImage} alt={`${property.title} - additional`} />
              </div>
            )}

            {/* Бейджи */}
            {badges.length > 0 && (
              <div className={styles.badgesContainer}>
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className={styles.badge}
                    style={{ backgroundColor: badge.backgroundColor }}
                  >
                    {badge.icon && <span className={styles.badgeIcon}>{badge.icon}</span>}
                    <Typography size="small" color="white">
                      {badge.text}
                    </Typography>
                  </span>
                ))}
              </div>
            )}

            {/* Кнопка избранного */}
            <button
              type="button"
              className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
              onClick={handleFavoriteClick}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart />
            </button>
          </div>

          {/* Информационная секция */}
          <div className={styles.infoSection}>
            {/* Верхний блок: логотип + название + ROI */}
            <div className={styles.headerRow}>
              <div className={styles.developerInfo}>
                <div className={styles.developerLogoContainer}>
                  {property.logoUrl && (
                    <div className={styles.developerLogo}>
                      <img src={property.logoUrl} alt={property.developer} />
                    </div>
                  )}
                </div>
                <div className={styles.projectNameContainer}>
                  <Typography size="large" weight="medium" className={styles.projectTitle}>
                    {property.title}
                  </Typography>
                  <Typography size="small" className={styles.developerName}>
                    {property.developer}
                  </Typography>
                  <Typography size="small" className={styles.regionName}>
                    {property.location}
                  </Typography>
                </div>
              </div>
              {property.roi && (
                <div className={styles.roiContainer}>
                  <Typography size="small" weight="medium" className={styles.roiValue}>
                    ROI {property.roi}%
                  </Typography>
                </div>
              )}
            </div>

            {/* Цены */}
            <div className={styles.pricesSection}>
              {/* Our price (со скидкой) */}
              {property.discount && property.discount > 0 && (
                <div className={styles.priceRow}>
                  <div className={styles.priceLabelContainer}>
                    <Typography size="small" className={styles.priceLabel}>
                      {t('ourPrice')}
                    </Typography>
                    <span className={styles.discountBadge}>-{property.discount}%</span>
                  </div>
                  <Typography size="small" weight="medium" className={styles.priceValue}>
                    <span className={styles.from}>{t('from')}</span>{' '}
                    {formatPrice(
                      property.priceFrom * (1 - property.discount / 100),
                      property.currency
                    )}
                  </Typography>
                </div>
              )}
              {/* Developer price */}
              <div className={styles.priceRow}>
                <Typography size="small" className={styles.priceLabel}>
                  {t('developerPrice')}:
                </Typography>
                <Typography size="small" weight="medium" className={styles.priceValue}>
                  <span className={styles.from}>{t('from')}</span>{' '}
                  {formatPrice(property.priceFrom, property.currency)}
                </Typography>
              </div>
            </div>

            {/* Дата и payment plan */}
            <div className={styles.footerRow}>
              <Typography size="small" className={styles.dateValue}>
                <span className={styles.quarter}>{firstPart}</span>
                {rest && <span className={styles.year}> {rest}</span>}
              </Typography>
              {property.paymentPlan && (
                <Typography size="small" className={styles.planValue}>
                  <span className={styles.planLabel}>PP:</span>{' '}
                  <span className={styles.planNumbers}>{property.paymentPlan}</span>
                </Typography>
              )}
            </div>

            {/* Дополнительная информация (появляется при наведении) */}
            <div className={styles.additionalInfo}>
              <div className={styles.additionalInfoGrid}>
                {property.pricesByType && property.pricesByType.length > 0 ? (
                  property.pricesByType.map((item, index) => (
                    <div key={index} className={styles.additionalInfoItem}>
                      <Typography size="small" className={styles.additionalInfoLabel}>
                        {item.type}
                      </Typography>
                      <Typography
                        size="small"
                        weight="medium"
                        className={styles.additionalInfoValue}
                      >
                        {t('from')} {formatPrice(item.price, property.currency)}
                      </Typography>
                    </div>
                  ))
                ) : (
                  <div className={styles.additionalInfoItem}>
                    <Typography size="small" className={styles.additionalInfoLabel}>
                      {property.types.join(', ')}
                    </Typography>
                    <Typography size="small" weight="medium" className={styles.additionalInfoValue}>
                      {t('from')} {formatPrice(property.priceFrom, property.currency)}
                    </Typography>
                  </div>
                )}
              </div>

              <button type="button" className={styles.whatsappButton}>
                <Typography size="regular" weight="medium" color="white">
                  {t('getDetailsOnWhatsApp')}
                </Typography>
              </button>

              <Typography size="small" className={styles.disclaimer}>
                {t('investmentDetailsNoSpam')}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
