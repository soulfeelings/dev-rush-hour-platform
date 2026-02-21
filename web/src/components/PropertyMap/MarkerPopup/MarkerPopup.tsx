import { useTranslation } from 'react-i18next'
import type { Project } from '../../../api/generated/schemas/project'
import { getDiscount, getValidBadges } from '../../../utils/project'
import { Badge } from '../../../ui/Badge'
import { Typography } from '../../../ui/Typography'
import { RoiBadge } from '../../../ui/RoiBadge'
import { splitCompletionDate } from '../../splitCompletionDate'
import { formatPrice } from '../../../utils/format'
import clsx from 'clsx'

interface MarkerPopupProps {
  project: Project
  direction?: 'bottom' | 'left' | 'right' | 'top'
  currency?: 'AED' | 'USD'
}

export const MarkerPopup = ({ project, direction = 'top', currency = 'AED' }: MarkerPopupProps) => {
  const { t } = useTranslation()
  const { firstPart, rest } = splitCompletionDate(project.completionDate)
  const discount = getDiscount(project)
  const roi = project.roi
  const paymentPlan = project.paymentPlan
  const badges = getValidBadges(project.badges)
  const pricesByType = project.pricesByType ?? []
  const coverImage = project.media?.cover?.url
  const logoUrl = project.media?.logo?.url

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
          {coverImage && <img src={coverImage} alt={project.name} />}
        </div>

        <div className="mp-info-container">
          <div className="mp-project-info">
            <div className="mp-project-logo-container">
              {logoUrl && (
                <div className="mp-project-logo">
                  <img src={logoUrl} alt={project.developer?.name} />
                </div>
              )}
            </div>
            <div className="mp-project-name-container">
              <div className="mp-project-title-row">
                <Typography size="small" className="mp-project-title">
                  {project.name}
                </Typography>
              </div>
              <div className="mp-developer-row">
                <Typography size="xs" className="mp-developer-name">
                  {project.developer?.name}
                </Typography>
              </div>
              <div className="mp-region-row">
                <Typography size="xs" className="mp-region-name">
                  {project.area?.name}
                </Typography>
              </div>
            </div>
          </div>

          {roi && <RoiBadge value={roi} size="small" />}
        </div>

        <div className="mp-price-container">
          {project.priceFromUs && (
            <div className="mp-price-row">
              <div className="mp-attribute-container">
                <span className="mp-attribute-label">{t('markerPopup.ourPrice')}</span>
                {discount && <span className="mp-discount-badge">-{discount}%</span>}
              </div>
              <div className="mp-price-value-container">
                <span className="mp-price-value">
                  <span className="mp-from">{t('from')}</span>{' '}
                  {formatPrice(project.priceFromUs, currency)}
                </span>
              </div>
            </div>
          )}
          {project.priceFromDeveloper && (
            <div className="mp-price-row">
              <div className="mp-attribute-container">
                <span className="mp-attribute-label">{t('markerPopup.developerPrice')}</span>
              </div>
              <div className="mp-price-value-container">
                <span className="mp-price-value">
                  <span className="mp-from">{t('from')}</span>{' '}
                  {formatPrice(project.priceFromDeveloper, currency)}
                </span>
              </div>
            </div>
          )}
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
    </div>
  )
}
