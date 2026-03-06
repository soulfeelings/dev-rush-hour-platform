import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { getProjectDetailRoute } from '../constants/routes'
import { Typography } from '../ui/Typography'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { RoiBadge } from '../ui/RoiBadge'
import styles from './ProjectCard.module.scss'
import type { Project } from '../api/generated/schemas/project'
import { getProjectSlug, getDiscount, getValidBadges } from '../utils/project'
import { getImageUrl } from '../utils/imageUrl'
import { splitCompletionDate } from './splitCompletionDate'
import { useSettings } from '../features/Settings/Settings'
import { formatPrice } from '../utils/format'
import { openWhatsApp, buildProjectMessage } from '../services/whatsapp'

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
  project: Project
  forceHovered?: boolean
  compact?: boolean
}

export const ProjectCard = ({
  project,
  forceHovered,
  compact,
}: ProjectCardProps) => {
  const { t, i18n } = useTranslation()
  const { currency } = useSettings()
  const isMobile = useIsMobile()
  const [isMouseHovered, setIsMouseHovered] = useState(false)
  const isHovered = forceHovered ?? isMouseHovered
  const isCompact = compact === true

  const slug = getProjectSlug(project)
  const discount = getDiscount(project)
  const badges = getValidBadges(project.badges)
  const { firstPart, rest } = splitCompletionDate(project.completionDate)
  const coverImage = project.media?.cover?.url
  const hoverImage = project.media?.hover?.url
  const logoUrl = project.media?.logo?.url
  const pricesByType = (project.pricesByType ?? []).slice().sort((a, b) => (a.price ?? 0) - (b.price ?? 0))

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openWhatsApp(buildProjectMessage({
      projectName: project.name,
      areaName: project.area?.name,
      developerName: project.developer?.name,
      price: project.priceFromUs ?? project.priceFromDeveloper ?? undefined,
      currency,
      projectLink: `${window.location.origin}${getProjectDetailRoute(slug)}`,
      lang: i18n.language,
    }))
  }

  return (
    <Link to={getProjectDetailRoute(slug)} className={styles.cardLink}>
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
              {coverImage && <img src={getImageUrl(coverImage, 'card')} alt={project.name} />}
            </div>

            {/* Hover картинка */}
            {hoverImage && (
              <motion.div
                className={styles.hoverImageContainer}
                animate={{ opacity: isHovered || isMobile ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <img src={getImageUrl(hoverImage, 'card')} alt={`${project.name} - hover`} />
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
          </div>

          {/* Информационная секция */}
          <div className={styles.infoSection}>
            {/* Верхний блок: логотип + название + ROI */}
            <div className={styles.headerRow}>
              <div className={styles.projectInfo}>
                <div className={styles.projectLogoContainer}>
                  {logoUrl && (
                    <div className={styles.projectLogo}>
                      <img src={getImageUrl(logoUrl, 'thumbnail')} alt={project.name} />
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
                    {project.name}
                  </Typography>
                  {project.developer?.name && (
                    <Typography className={styles.developerName}>
                      {project.developer.name}
                    </Typography>
                  )}
                  {project.area?.name && (
                    <Typography className={styles.regionName}>{project.area.name}</Typography>
                  )}
                </div>
              </div>
              {project.roi && (
                <RoiBadge value={project.roi} size={isCompact ? 'small' : 'default'} />
              )}
            </div>

            {/* Цены */}
            <div className={styles.pricesSection}>
              {/* Our price */}
              {project.priceFromUs && (
                <motion.div
                  initial={false}
                  animate={{ gridTemplateRows: isHovered || isMobile ? '1fr' : '0fr' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ display: 'grid' }}
                >
                <div style={{ overflow: 'hidden' }}>
                  <div className={styles.priceRow}>
                    <div className={styles.priceLabelContainer}>
                      <Typography
                        size={isCompact ? 'regular' : 'large'}
                        weight="medium"
                        className={styles.priceLabel}
                      >
                        {t('ourPrice')}:
                      </Typography>
                      {discount && discount > 0 && (
                        <span className={styles.discountBadge}>-{discount}%</span>
                      )}
                    </div>
                    <div className={styles.priceValue}>
                      <Typography className={styles.from}>{t('from')}</Typography>{' '}
                      <Typography
                        {...(isCompact
                          ? { size: 'large', weight: 'semibold' }
                          : { variant: 'h1' as const })}
                        className={styles.priceAmount}
                      >
                        {formatPrice(project.priceFromUs, currency)}
                      </Typography>
                    </div>
                  </div>
                </div>
                </motion.div>
              )}
              {/* Developer price */}
              {project.priceFromDeveloper && (
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
                      {formatPrice(project.priceFromDeveloper, currency)}
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            {/* Дата и payment plan */}
            {(firstPart || project.paymentPlan) && (
              <div className={styles.footerRow}>
                {firstPart && (
                  <Typography size={isCompact ? 'regular' : 'large'} className={styles.dateValue}>
                    <span className={styles.quarter}>{firstPart}</span>
                    {rest && <span className={styles.year}> {rest}</span>}
                  </Typography>
                )}
                {project.paymentPlan && (
                  <Typography
                    size={isCompact ? 'regular' : 'large'}
                    weight="medium"
                    className={styles.planValue}
                  >
                    <span className={styles.planLabel}>PP:</span>{' '}
                    <span className={styles.planNumbers}>{project.paymentPlan}</span>
                  </Typography>
                )}
              </div>
            )}

            {/* Дополнительная информация (появляется при наведении) */}
            <motion.div
              initial={false}
              animate={{ gridTemplateRows: isHovered || isMobile ? '1fr' : '0fr' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ display: 'grid' }}
            >
              <div style={{ overflow: 'hidden' }}>
              <div className={styles.additionalInfo}>
                {pricesByType.length > 0 ? (
                  <div className={styles.additionalInfoGrid}>
                    {pricesByType.map((item, index) => (
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
                          {formatPrice(item.price, currency)}
                        </Typography>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className={styles.buttonContainer}>
                  <Button variant="primary" size="sm" fullWidth align="center" onClick={handleWhatsAppClick}>
                    {t('getDetailsOnWhatsApp')}
                  </Button>

                  <Typography size="small" className={styles.disclaimer}>
                    {t('investmentDetailsNoSpam')}
                  </Typography>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Link>
  )
}
