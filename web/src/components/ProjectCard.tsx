import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import clsx from 'clsx'
import { getProjectDetailRoute } from '../constants/routes'
import { Typography } from '../ui/Typography'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { RoiBadge } from '../ui/RoiBadge'
import styles from './ProjectCard.module.scss'
import type { Property } from '../types/property'
import { splitCompletionDate } from './splitCompletionDate'

const MOBILE_BREAKPOINT = 768

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

interface ProjectCardProps {
  property: Property
  onFavoriteClick?: (propertyId: string) => void
  forceHovered?: boolean
  compact?: boolean
}

const formatPrice = (price: number | undefined, currency: string | undefined) => {
  if (price === undefined) return '—'
  const formatted = (price / 1000000).toFixed(1)
  return `${formatted}M ${currency || ''}`
}

export const ProjectCard = ({
  property,
  onFavoriteClick,
  forceHovered,
  compact,
}: ProjectCardProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isMouseHovered, setIsMouseHovered] = useState(false)
  const isHovered = forceHovered ?? isMouseHovered
  const isCompact = compact === true

  const { firstPart, rest } = splitCompletionDate(property.completionDate)
  const hoverImage = property.hoverImage
  const badges = property.badges ?? []

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteClick?.(property.id)
  }

  return (
    <Link to={getProjectDetailRoute(property.id)} className={styles.cardLink}>
      <div
        className={clsx(styles.card, {
          [styles.compact]: compact === true,
          [styles.autoCompact]: compact === undefined,
        })}
        onMouseEnter={() => setIsMouseHovered(true)}
        onMouseLeave={() => setIsMouseHovered(false)}
      >
        <div className={styles.cardInner}>
          {/* Область картинок */}
          <div className={styles.imagesWrapper}>
            {/* Основная картинка */}
            <div className={styles.imageContainer}>
              {property.image && <img src={property.image} alt={property.title} />}
            </div>

            {/* Hover картинка */}
            {hoverImage && (
              <motion.div
                className={styles.hoverImageContainer}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <img src={hoverImage} alt={`${property.title} - hover`} />
              </motion.div>
            )}

            {/* Бейджи */}
            {badges.length > 0 && (
              <div className={styles.badgesContainer}>
                {badges.map(badge => (
                  <Badge
                    key={badge.id}
                    text={badge.name}
                    backgroundColor={badge.backgroundColor}
                    textColor={badge.textColor}
                    iconName={badge.icon}
                    iconColor={badge.iconColor}
                  />
                ))}
              </div>
            )}

            {/* Кнопка избранного */}
            <button
              type="button"
              className={clsx(styles.favoriteButton, isFavorited && styles.favorited)}
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
              <div className={styles.projectInfo}>
                <div className={styles.projectLogoContainer}>
                  {property.logoUrl && (
                    <div className={styles.projectLogo}>
                      <img src={property.logoUrl} alt={property.title} />
                    </div>
                  )}
                </div>
                <div className={styles.projectNameContainer}>
                  <Typography
                    {...(isCompact
                      ? { size: 'large', weight: 'semibold' }
                      : { variant: 'h1' as const })}
                    className={styles.projectTitle}
                  >
                    {property.title}
                  </Typography>
                  {property.developer && (
                    <Typography className={styles.developerName}>{property.developer}</Typography>
                  )}
                  {property.location && (
                    <Typography className={styles.regionName}>{property.location}</Typography>
                  )}
                </div>
              </div>
              {property.roi && (
                <RoiBadge value={property.roi} size={isCompact ? 'small' : 'default'} />
              )}
            </div>

            {/* Цены */}
            <div className={styles.pricesSection}>
              {/* Our price (со скидкой, только при наведении) */}
              {property.discount && property.discount > 0 && property.priceFrom && (
                <motion.div
                  initial={false}
                  animate={{ height: isHovered || isMobile ? 'auto' : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className={styles.priceRow}>
                    <div className={styles.priceLabelContainer}>
                      <Typography
                        size={isCompact ? 'regular' : 'large'}
                        weight="medium"
                        className={styles.priceLabel}
                      >
                        {t('ourPrice')}:
                      </Typography>
                      <span className={styles.discountBadge}>-{property.discount}%</span>
                    </div>
                    <div className={styles.priceValue}>
                      <Typography className={styles.from}>{t('from')}</Typography>{' '}
                      <Typography
                        {...(isCompact
                          ? { size: 'large', weight: 'semibold' }
                          : { variant: 'h1' as const })}
                        className={styles.priceAmount}
                      >
                        {formatPrice(
                          property.priceFrom * (1 - property.discount / 100),
                          property.currency
                        )}
                      </Typography>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Developer price */}
              <div className={styles.priceRow}>
                <Typography
                  size={isCompact ? 'regular' : 'large'}
                  weight="medium"
                  className={styles.priceLabel}
                >
                  {t('developerPrice')}:
                </Typography>
                <div className={styles.priceValue}>
                  <Typography className={styles.from}>{t('from')}</Typography>{' '}
                  <Typography
                    {...(isCompact
                      ? { size: 'large', weight: 'semibold' }
                      : { variant: 'h1' as const })}
                    className={styles.priceAmount}
                  >
                    {formatPrice(property.priceFrom, property.currency)}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Дата и payment plan */}
            {(firstPart || property.paymentPlan) && (
              <div className={styles.footerRow}>
                {firstPart && (
                  <Typography size={isCompact ? 'regular' : 'large'} className={styles.dateValue}>
                    <span className={styles.quarter}>{firstPart}</span>
                    {rest && <span className={styles.year}> {rest}</span>}
                  </Typography>
                )}
                {property.paymentPlan && (
                  <Typography
                    size={isCompact ? 'regular' : 'large'}
                    weight="medium"
                    className={styles.planValue}
                  >
                    <span className={styles.planLabel}>PP:</span>{' '}
                    <span className={styles.planNumbers}>{property.paymentPlan}</span>
                  </Typography>
                )}
              </div>
            )}

            {/* Дополнительная информация (появляется при наведении) */}
            <motion.div
              initial={false}
              animate={{ height: isHovered || isMobile ? 'auto' : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
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
                          <span className={styles.from}>{t('from')}</span>{' '}
                          {formatPrice(item.price, property.currency)}
                        </Typography>
                      </div>
                    ))
                  ) : property.types && property.types.length > 0 ? (
                    <div className={styles.additionalInfoItem}>
                      <Typography size="small" className={styles.additionalInfoLabel}>
                        {property.types.join(', ')}
                      </Typography>
                      <Typography
                        size="small"
                        weight="medium"
                        className={styles.additionalInfoValue}
                      >
                        <span className={styles.from}>{t('from')}</span>{' '}
                        {formatPrice(property.priceFrom, property.currency)}
                      </Typography>
                    </div>
                  ) : null}
                </div>

                <div className={styles.buttonContainer}>
                  <Button variant="primary" size="sm" fullWidth align="center">
                    {t('getDetailsOnWhatsApp')}
                  </Button>

                  <Typography size="small" className={styles.disclaimer}>
                    {t('investmentDetailsNoSpam')}
                  </Typography>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Link>
  )
}
