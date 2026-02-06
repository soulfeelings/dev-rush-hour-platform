import styles from './MarkerPopup.module.scss'
import type { Property } from '../../../types/property'
import { Badge } from '../../../ui/Badge'
import { Typography } from '../../../ui/Typography'
import { RoiBadge } from '../../../ui/RoiBadge'

interface MarkerPopupProps {
  property: Property
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const formatPrice = (price: number | undefined, currency: string | undefined) => {
  if (price === undefined) return '—'
  const formatted = (price / 1000000).toFixed(1)
  return `${formatted}M ${currency || ''}`
}

const splitCompletionDate = (dateString: string | undefined) => {
  if (!dateString || dateString.length <= 2) {
    return {
      firstPart: dateString || '',
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
  const roi = property.roi
  const paymentPlan = property.paymentPlan
  const badges = property.badges ?? []
  const pricesByType = property.pricesByType ?? []

  // Calculate discounted price if discount exists
  const discountedPrice =
    discount && property.priceFrom ? property.priceFrom * (1 - discount / 100) : null

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
        <img src={property.image} alt={property.title} />
      </div>

      <div className={styles.infoContainer}>
        <div className={styles.projectInfo}>
          <div className={styles.projectLogoContainer}>
            {property.logoUrl && (
              <div className={styles.projectLogo}>
                <img src={property.logoUrl} alt={property.developer} />
              </div>
            )}
          </div>
          <div className={styles.projectNameContainer}>
            <div className={styles.projectTitleRow}>
              <Typography size="small" className={styles.projectTitle}>
                {property.title}
              </Typography>
            </div>
            <div className={styles.developerRow}>
              <Typography size="xs" className={styles.developerName}>
                {property.developer}
              </Typography>
            </div>
            <div className={styles.regionRow}>
              <Typography size="xs" className={styles.regionName}>
                {property.location}
              </Typography>
            </div>
          </div>
        </div>

        {roi && <RoiBadge value={roi} size="small" />}
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

      {(firstPart || paymentPlan) && (
        <div className={styles.paymentPlanContainer}>
          {firstPart && (
            <div className={styles.dateContainer}>
              <span className={styles.dateValue}>
                <span className={styles.quarter}>{firstPart}</span>
                {rest && <span className={styles.year}> {rest}</span>}
              </span>
            </div>
          )}
          {paymentPlan && (
            <div className={styles.planContainer}>
              <span className={styles.planValue}>
                <span className={styles.planLabel}>PP: </span>
                <span className={styles.planNumbers}>{paymentPlan}</span>
              </span>
            </div>
          )}
        </div>
      )}

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
      <div className={styles.arrow} />
    </div>
  )
}
