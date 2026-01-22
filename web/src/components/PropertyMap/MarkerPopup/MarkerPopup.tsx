import styles from './MarkerPopup.module.scss'
import type { Property } from '../../../types/property'

interface MarkerPopupProps {
  property: Property
}

export const MarkerPopup = ({ property }: MarkerPopupProps) => {
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

  const { firstPart, rest } = splitCompletionDate(property.completionDate)

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={property.image} alt={property.title} />
        {property.isRecommended && <span className={styles.recommendedBadge}>Recommended</span>}
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
            <span className={styles.planNumbers}>30/10/60</span>
          </span>
        </div>
      </div>
    </div>
  )
}
