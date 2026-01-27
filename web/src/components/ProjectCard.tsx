import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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

export const ProjectCard = ({ property, badges = [] }: ProjectCardProps) => {
  const { t } = useTranslation()

  const { firstPart, rest } = splitCompletionDate(property.completionDate)
  const secondaryImage = property.gallery?.[0]

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

            {badges.length > 0 && (
              <div className={styles.badgesContainer}>
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className={styles.badge}
                    style={{ backgroundColor: badge.backgroundColor }}
                  >
                    {badge.icon && <span className={styles.badgeIcon}>{badge.icon}</span>}
                    <Typography size="large" color="white">
                      {badge.text}
                    </Typography>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Информационная секция */}
          <div className={styles.infoSection}>
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

            {/* Дополнительная информация (появляется при наведении) */}
            <div className={styles.additionalInfo}>
              <div className={styles.additionalInfoGrid}>
                <div className={styles.additionalInfoItem}>
                  <span className={styles.additionalInfoLabel}>Property Type</span>
                  <span className={styles.additionalInfoValue}>{property.types.join(', ')}</span>
                </div>
                <div className={styles.additionalInfoItem}>
                  <span className={styles.additionalInfoLabel}>Bedrooms</span>
                  <span className={styles.additionalInfoValue}>{property.bedrooms.join(', ')}</span>
                </div>
                <div className={styles.additionalInfoItem}>
                  <span className={styles.additionalInfoLabel}>Handover</span>
                  <span className={styles.additionalInfoValue}>{property.completionDate}</span>
                </div>
                <div className={styles.additionalInfoItem}>
                  <span className={styles.additionalInfoLabel}>Status</span>
                  <span className={styles.additionalInfoValue}>
                    {property.status || 'Available'}
                  </span>
                </div>
              </div>

              <p className={styles.additionalInfoDescription}>
                {property.description ||
                  'Premium residential project with modern amenities and excellent location. Perfect for investment or living.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
