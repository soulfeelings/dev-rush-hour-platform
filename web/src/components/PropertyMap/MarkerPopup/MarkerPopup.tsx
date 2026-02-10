import { useTranslation } from 'react-i18next'
import type { Property } from '../../../types/property'
import { Badge } from '../../../ui/Badge'
import { Typography } from '../../../ui/Typography'
import { RoiBadge } from '../../../ui/RoiBadge'
import { splitCompletionDate } from '../../splitCompletionDate'
import { useSettings } from '../../../features/Settings/Settings'
import { formatPrice } from '../../../utils/format'
import clsx from 'clsx'

interface MarkerPopupProps {
  property: Property
  direction?: 'bottom' | 'left' | 'right' | 'top'
}

export const MarkerPopup = ({ property, direction = 'top' }: MarkerPopupProps) => {
  const { t } = useTranslation()
  const { currency } = useSettings()
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
    <div className={clsx('mp-wrapper', `mp-wrapper-${direction}`)}>
      <div className="mp-card">
        <div className="mp-image-container">
          {badges.length > 0 && (
            <div className="mp-badges-container">
              {badges.map(badge => (
                <Badge
                  key={badge.id}
                  text={badge.name}
                  backgroundColor={badge.backgroundColor}
                  textColor={badge.textColor}
                  iconName={badge.icon}
                  iconColor={badge.iconColor}
                  size="small"
                />
              ))}
            </div>
          )}
          <img src={property.image} alt={property.title} />
        </div>

        <div className="mp-info-container">
          <div className="mp-project-info">
            <div className="mp-project-logo-container">
              {property.logoUrl && (
                <div className="mp-project-logo">
                  <img src={property.logoUrl} alt={property.developer} />
                </div>
              )}
            </div>
            <div className="mp-project-name-container">
              <div className="mp-project-title-row">
                <Typography size="small" className="mp-project-title">
                  {property.title}
                </Typography>
              </div>
              <div className="mp-developer-row">
                <Typography size="xs" className="mp-developer-name">
                  {property.developer}
                </Typography>
              </div>
              <div className="mp-region-row">
                <Typography size="xs" className="mp-region-name">
                  {property.location}
                </Typography>
              </div>
            </div>
          </div>

          {roi && <RoiBadge value={roi} size="small" />}
        </div>

        <div className="mp-price-container">
          {discountedPrice && (
            <div className="mp-price-row">
              <div className="mp-attribute-container">
                <span className="mp-attribute-label">{t('markerPopup.ourPrice')}</span>
                <span className="mp-discount-badge">-{discount}%</span>
              </div>
              <div className="mp-price-value-container">
                <span className="mp-price-value">
                  <span className="mp-from">{t('from')}</span>{' '}
                  {formatPrice(discountedPrice, currency)}
                </span>
              </div>
            </div>
          )}
          <div className="mp-price-row">
            <div className="mp-attribute-container">
              <span className="mp-attribute-label">{t('markerPopup.developerPrice')}</span>
            </div>
            <div className="mp-price-value-container">
              <span className="mp-price-value">
                <span className="mp-from">{t('from')}</span>{' '}
                {formatPrice(property.priceFrom, currency)}
              </span>
            </div>
          </div>
        </div>

        {(firstPart || paymentPlan) && (
          <div className="mp-payment-plan-container">
            {firstPart && (
              <div className="mp-date-container">
                <span className="mp-date-value">
                  <span className="mp-quarter">{firstPart}</span>
                  {rest && <span className="mp-year"> {rest}</span>}
                </span>
              </div>
            )}
            {paymentPlan && (
              <div className="mp-plan-container">
                <span className="mp-plan-value">
                  <span className="mp-plan-label">PP: </span>
                  <span className="mp-plan-numbers">{paymentPlan}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {pricesByType.length > 0 && (
          <div className="mp-prices-by-type-container">
            {pricesByType.map((item, index) => (
              <div key={index} className="mp-price-by-type-row">
                <span className="mp-type-label">{item.type}</span>
                <span className="mp-type-price">
                  <span className="mp-from">{t('from')}</span> {formatPrice(item.price, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* <PopupArrow
        className={clsx('mp-arrow', {
          'mp-arrow-bottom': direction === 'bottom',
          'mp-arrow-left': direction === 'left',
          'mp-arrow-right': direction === 'right',
          'mp-arrow-top': direction === 'top',
        })}
      /> */}
    </div>
  )
}
