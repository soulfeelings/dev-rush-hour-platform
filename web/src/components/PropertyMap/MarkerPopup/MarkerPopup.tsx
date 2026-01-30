import styles from './MarkerPopup.module.scss'
import type { Property } from '../../../types/property'
import { Badge } from '../../../ui/Badge'

interface MarkerPopupProps {
  property: Property
  onMouseEnter?: () => void
  onMouseLeave?: () => void
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

export const MarkerPopup = ({ property, onMouseEnter, onMouseLeave }: MarkerPopupProps) => {
  const { firstPart, rest } = splitCompletionDate(property.completionDate)
  const discount = property.discount
  const roi = property.roi ?? 7
  const paymentPlan = property.paymentPlan ?? '30/10/60'
  const badges = property.badges ?? []
  const pricesByType = property.pricesByType ?? []

  // Calculate discounted price if discount exists
  const discountedPrice = discount ? property.priceFrom * (1 - discount / 100) : null

  return (
    <div className={styles.card} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className={styles.imageContainer}>
        {badges.length > 0 && (
          <div className={styles.badgesContainer}>
            {badges.map(badge => (
              <Badge
                key={badge.id}
                text={badge.name}
                backgroundColor={badge.backgroundColor}
                textColor={badge.textColor}
                iconName={badge.icon}
                size="small"
              />
            ))}
          </div>
        )}
        <button className={styles.favoriteButton} aria-label="Add to favorites">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <img src={property.image} alt={property.title} />
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

        <div className={styles.roiContainer}>
          <span className={styles.roiValue}>ROI {roi}%</span>
        </div>
      </div>

      <div className={styles.priceContainer}>
        {discountedPrice && (
          <div className={styles.priceRow}>
            <div className={styles.attributeContainer}>
              <span className={styles.attributeLabel}>Our price:</span>
              <span className={styles.discountBadge}>-{discount}%</span>
            </div>
            <div className={styles.priceValueContainer}>
              <span className={styles.priceValue}>
                <span className={styles.from}>from</span>{' '}
                {formatPrice(discountedPrice, property.currency)}
              </span>
            </div>
          </div>
        )}
        <div className={styles.priceRow}>
          <div className={styles.attributeContainer}>
            <span className={styles.attributeLabel}>Developer price:</span>
          </div>
          <div className={styles.priceValueContainer}>
            <span className={styles.priceValue}>
              <span className={styles.from}>from</span>{' '}
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
            <span className={styles.planNumbers}>{paymentPlan}</span>
          </span>
        </div>
      </div>

      {pricesByType.length > 0 && (
        <div className={styles.pricesByTypeContainer}>
          {pricesByType.map((item, index) => (
            <div key={index} className={styles.priceByTypeRow}>
              <span className={styles.typeLabel}>{item.type}</span>
              <span className={styles.typePrice}>
                <span className={styles.from}>from</span>{' '}
                {formatPrice(item.price, property.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
