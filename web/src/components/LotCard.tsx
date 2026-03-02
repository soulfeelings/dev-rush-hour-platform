import { Building2, ChevronLeft, ChevronRight, Bed, ShowerHead, Move } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getLotDetailRoute, getProjectDetailRoute } from '../constants/routes'
import { Badge } from '../ui/Badge'
import { useSettings } from '../features/Settings/Settings'
import { openWhatsApp, buildLotMessage } from '../services/whatsapp'
import { formatPrice, formatArea } from '../utils/format'
import { translateBonusKey } from '../utils/bonusTranslations'
import { getImageUrl } from '../utils/imageUrl'
import styles from './LotCard.module.scss'
import type { Lot } from '../api'

interface LotWithProject extends Lot {
  completionDate?: string
}

interface MediaItem {
  url?: string
}

interface LotMedia {
  cover?: MediaItem
  gallery?: MediaItem[]
  photos?: MediaItem[]
}

interface LotCardProps {
  lot: LotWithProject
  onFavoriteClick?: (lotId: string) => void
}

interface DisplayBadge {
  name: string
  backgroundColor: string
  textColor: string
  icon?: string
  iconColor?: string
}


// Функция для разделения completionDate на первые 2 символа и остальное
const splitCompletionDate = (dateString: string | undefined) => {
  if (!dateString) return { firstPart: '', rest: '' }

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

export const LotCard = ({ lot }: LotCardProps) => {
  const { t, i18n } = useTranslation()
  const { currency, unit } = useSettings()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const projectName = lot.project?.name || 'Project'
  const developerName = lot.developer?.name || lot.project?.developer?.name || 'Developer'
  const areaName = lot.area?.name || lot.project?.area?.name
  const cityName = lot.area?.city
  const location = [areaName, cityName].filter(Boolean).join(', ') || 'Dubai'
  const logoUrl = lot.project?.developer?.logoUrl || lot.developer?.logoUrl
  const typeLabel = lot.type ? lot.type.charAt(0).toUpperCase() + lot.type.slice(1) : 'Apartment'
  const ourPrice = lot.priceFromUs || 0
  const developerPrice = lot.priceFromDeveloper || 0
  const hasDiscount = ourPrice > 0 && developerPrice > 0 && developerPrice > ourPrice
  const discountPercent = hasDiscount
    ? Math.round(((developerPrice - ourPrice) / developerPrice) * 100)
    : 0

  const handleImageClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(idx)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const lang = i18n.language
    const origin = window.location.origin
    const lotLink = lot.id ? `${origin}${getLotDetailRoute(lot.id)}` : null
    const projectSlug = lot.project?.slug
    const projectLink = projectSlug ? `${origin}${getProjectDetailRoute(projectSlug)}` : null

    openWhatsApp(buildLotMessage({
      projectName,
      areaName,
      typeLabel,
      bedrooms: lot.bedrooms ?? undefined,
      bathrooms: lot.bathrooms ?? undefined,
      areaSqm: lot.areaSqm ?? undefined,
      floor: lot.floor ?? undefined,
      price: ourPrice,
      currency,
      unit,
      lotLink,
      projectLink,
      lang,
    }))
  }

  const lotMedia = lot.data?.media as LotMedia | undefined
  const allImages = [
    ...(lotMedia?.cover?.url ? [lotMedia.cover.url] : []),
    ...(lotMedia?.gallery
      ?.map((img: MediaItem) => img.url)
      .filter((url): url is string => Boolean(url)) || []),
    ...(lotMedia?.photos
      ?.map((img: MediaItem) => img.url)
      .filter((url): url is string => Boolean(url)) || []),
  ]

  const { firstPart, rest } = splitCompletionDate(lot.project?.completionDate)

  const toBadgeText = (name?: string, slug?: string) => {
    if (name && name.trim().length > 0) return name.trim()
    if (slug && slug.trim().length > 0) {
      return slug
        .trim()
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
    }
    return ''
  }

  const normalizedApiBadges: DisplayBadge[] = ((lot.badges && lot.badges.length > 0
    ? lot.badges
    : lot.project?.badges) || [])
    .map(badge => ({
      name: toBadgeText(badge.name, badge.slug),
      backgroundColor: badge.backgroundColor || '#000',
      textColor: badge.textColor || '#fff',
      icon: badge.icon,
      iconColor: badge.iconColor,
    }))
    .filter(badge => badge.name.length > 0)

  const fallbackBonusBadges: DisplayBadge[] = (lot.bonusKeys || []).slice(0, 3).map((key, idx) => {
    const palette = [
      { backgroundColor: '#2E7D32', textColor: '#FFFFFF', iconName: 'gift', iconColor: '#FFD54F' },
      { backgroundColor: '#2F6BFF', textColor: '#FFFFFF', iconName: 'sofa', iconColor: '#FFD54F' },
      { backgroundColor: '#FF4B3A', textColor: '#FFFFFF', iconName: 'tag', iconColor: '#FFD54F' },
    ] as const
    const style = palette[idx % palette.length]

    return {
      name: translateBonusKey(key),
      backgroundColor: style.backgroundColor,
      textColor: style.textColor,
      icon: style.iconName,
      iconColor: style.iconColor,
    }
  })

  const badges: DisplayBadge[] = normalizedApiBadges.length > 0 ? normalizedApiBadges : fallbackBonusBadges

  if (!lot.id) return null

  return (
    <Link to={getLotDetailRoute(lot.id)} className={styles.cardLink}>
      <div className={styles.card}>
        {/* Левая часть - Галерея */}
        <div className={styles.photoSection}>
          {allImages.length > 0 ? (
            <div className={styles.galleryContainer}>
              <div className={styles.mainImageContainer}>
                <img
                  src={getImageUrl(allImages[currentImageIndex], 'card')}
                  alt={`${projectName} - image ${currentImageIndex + 1}`}
                />
                {badges.length > 0 && (
                  <div className={styles.badgesContainer}>
                    {badges.slice(0, 3).map((badge, idx) => (
                      <Badge
                        key={`${badge.name}-${idx}`}
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

                {allImages.length > 1 && (
                  <>
                    <button
                      className={`${styles.navButton} ${styles.prevButton}`}
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      className={`${styles.navButton} ${styles.nextButton}`}
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Пагинация */}
              {allImages.length > 1 && (
                <div className={styles.photoPagination}>
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      className={`${styles.paginationDot} ${idx === currentImageIndex ? styles.activePagination : ''
                        }`}
                      onClick={e => handleImageClick(e, idx)}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>
              <Building2 size={48} />
              <span>{t('lotCard.imagePlaceholder')}</span>
            </div>
          )}
        </div>

        {/* Правая часть - Информация */}
        <div className={styles.lotInfoSection}>
          <div className={styles.frame66}>
            {/* Developer контейнер */}
            <div className={styles.developerContainer}>
              <div className={styles.developerLogoContainer}>
                {logoUrl && <img src={getImageUrl(logoUrl, 'thumbnail')} alt={developerName} />}
              </div>
              <div className={styles.projectInfo}>
                <span className={styles.projectTitle}>{projectName}</span>
                <span className={styles.developerName}>{developerName}</span>
                <span className={styles.regionName}>{location}</span>
              </div>

              <div className={styles.roiContainer}>
                <span className={styles.roiValue}>{lot.roi != null ? `ROI ${lot.roi}%` : 'ROI -'}</span>
              </div>
            </div>

            {/* Информация о лоте */}
            <div className={styles.currencyObjectInfo}>
              <span className={styles.apartmentType}>{typeLabel}</span>

              <div className={styles.dotSeparator}>
                <div className={styles.dot} />
              </div>

              {lot.bedrooms && (
                <>
                  <div className={styles.infoItem}>
                    <div className={styles.iconContainer}>
                      <Bed className={styles.icon} size={16} />
                    </div>
                    <span className={styles.count}>{lot.bedrooms}</span>
                  </div>

                  <div className={styles.dotSeparator}>
                    <div className={styles.dot} />
                  </div>
                </>
              )}

              {lot.bathrooms && (
                <>
                  <div className={styles.infoItem}>
                    <div className={styles.iconContainer}>
                      <ShowerHead className={styles.icon} size={16} />
                    </div>
                    <span className={styles.count}>{lot.bathrooms}</span>
                  </div>

                  <div className={styles.dotSeparator}>
                    <div className={styles.dot} />
                  </div>
                </>
              )}

              {lot.areaSqm && (
                <div className={styles.infoItem}>
                  <div className={styles.iconContainer}>
                    <Move className={styles.icon} size={16} />
                  </div>
                  <span className={styles.areaValue}>{formatArea(lot.areaSqm, unit)}</span>
                </div>
              )}
            </div>

            {/* Цены */}
            <div className={styles.priceSection}>
              <div className={styles.priceItem}>
                <div className={styles.priceLabel}>
                  <span className={styles.priceLabelText}>{t('lotCard.ourPrice')}</span>
                  {hasDiscount && (
                    <div className={styles.discountBadge}>
                      <span className={styles.discountValue}>-{discountPercent}%</span>
                    </div>
                  )}
                </div>
                <span className={styles.priceValue}>
                  <span className={styles.from}>{t('from')}</span>
                  {formatPrice(ourPrice, currency)}
                </span>
              </div>

              <div className={styles.priceItem}>
                <span className={styles.priceLabelText}>{t('lotCard.developerPrice')}</span>
                <span className={styles.priceValue}>
                  <span className={styles.from}>{t('from')}</span>
                  {formatPrice(developerPrice || ourPrice, currency)}
                </span>
              </div>
            </div>

            {/* Дата и план платежей */}
            <div className={styles.paymentPlanContainer}>
              <div className={styles.dateContainer}>
                <span className={styles.dateValue}>
                  <span className={styles.quarter}>{firstPart}</span>
                  {rest && <span className={styles.year}> {rest}</span>}
                </span>
              </div>
            </div>

            {/* Кнопка WhatsApp */}
            <div className={styles.buttonSection}>
              <button className={styles.whatsappButton} onClick={handleWhatsAppClick}>
                <span className={styles.whatsappText}>{t('getDetailsOnWhatsApp')}</span>
              </button>
              <div className={styles.whatsappNote}>{t('investmentDetailsNoSpam')}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function LotCardSkeleton() {
  const s = (cls: string) => `${styles[cls]} ${styles.shimmer}`

  return (
    <div className={styles.skeletonCard}>
      {/* Photo section */}
      <div className={`${styles.skeletonPhoto} ${styles.shimmer}`} />

      {/* Info section */}
      <div className={styles.skeletonInfo}>
        {/* Developer row */}
        <div className={styles.skeletonDeveloper}>
          <div className={s('skeletonLogo')} />
          <div className={styles.skeletonProjectInfo}>
            <div className={styles.shimmer} style={{ width: '70%', height: 18 }} />
            <div className={styles.shimmer} style={{ width: '50%', height: 14 }} />
            <div className={styles.shimmer} style={{ width: '40%', height: 14 }} />
          </div>
          <div className={s('skeletonRoi')} />
        </div>

        {/* Lot info row */}
        <div className={styles.skeletonLotInfo}>
          <div className={styles.shimmer} style={{ width: 80, height: 16 }} />
          <div className={styles.shimmer} style={{ width: 40, height: 16 }} />
          <div className={styles.shimmer} style={{ width: 40, height: 16 }} />
          <div className={styles.shimmer} style={{ width: 60, height: 16 }} />
        </div>

        {/* Price rows */}
        <div className={styles.skeletonPrices}>
          <div className={styles.skeletonPriceRow}>
            <div className={styles.shimmer} style={{ width: 90, height: 16 }} />
            <div className={styles.shimmer} style={{ width: 120, height: 16 }} />
          </div>
          <div className={styles.skeletonPriceRow}>
            <div className={styles.shimmer} style={{ width: 110, height: 16 }} />
            <div className={styles.shimmer} style={{ width: 120, height: 16 }} />
          </div>
        </div>

        {/* Date row */}
        <div className={styles.skeletonDate}>
          <div className={styles.shimmer} style={{ width: 80, height: 16 }} />
        </div>

        {/* Button */}
        <div className={styles.skeletonButton}>
          <div className={s('skeletonBtn')} />
          <div className={s('skeletonBtnNote')} />
        </div>
      </div>
    </div>
  )
}
