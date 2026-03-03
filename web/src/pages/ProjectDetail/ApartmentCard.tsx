import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Typography } from '../../ui/Typography'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { RoiBadge } from '../../ui/RoiBadge'
import { IconBed, IconBath, IconArea } from '../../components/icons'
import { useSettings } from '../../features/Settings/Settings'
import { formatPrice, formatArea, capitalize } from '../../utils/format'
import { getLotDetailRoute, getProjectDetailRoute } from '../../constants/routes'
import { openWhatsApp, buildLotMessage } from '../../services/whatsapp'
import { useIsRTL } from '../../hooks/useDirection'
import { getImageUrl } from '../../utils/imageUrl'
import { translateBonusKey } from '../../utils/bonusTranslations'
import type { Lot } from '../../api'
import styles from './ApartmentCard.module.scss'
import clsx from 'clsx'

interface LotData {
  media?: {
    cover?: { url?: string }
    floorPlanImages?: { url?: string }[]
    gallery?: { url?: string }[]
    photos?: { url?: string }[]
  }
  bonuses?: Array<{
    title?: string
    style?: string
    description?: string
  }>
}

interface DisplayBadge {
  name: string
  backgroundColor: string
  textColor: string
  icon?: string
  iconColor?: string
}

interface ApartmentCardProps {
  lot: Lot
  projectName?: string
  projectSlug?: string
  areaName?: string
  roi?: number
  onClick?: (lot: Lot) => void
  onImageClick?: (imageUrl: string) => void
  hideGallery?: boolean
  fullWidth?: boolean
  coverFirst?: boolean
  disableHoverLift?: boolean
}

export function ApartmentCard({
  lot,
  projectName,
  projectSlug,
  areaName,
  roi,
  onClick,
  onImageClick,
  hideGallery = false,
  fullWidth = false,
  coverFirst = false,
  disableHoverLift = false,
}: ApartmentCardProps) {
  const { currency, unit } = useSettings()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = useIsRTL()

  const lotData = lot.data as LotData | undefined
  const coverImage = lotData?.media?.cover?.url
  const floorPlanImages =
    lotData?.media?.floorPlanImages?.map(img => img.url).filter((u): u is string => Boolean(u)) ||
    []
  const galleryPhotos =
    lotData?.media?.gallery?.map(img => img.url).filter((u): u is string => Boolean(u)) || []
  const photoImages =
    lotData?.media?.photos?.map(img => img.url).filter((u): u is string => Boolean(u)) || []
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

  const normalizedApiBadges: DisplayBadge[] = ((lot.badges && lot.badges.length > 0 ? lot.badges : lot.project?.badges) || [])
    .map(badge => ({
      name: toBadgeText(badge.name, badge.slug),
      backgroundColor: badge.backgroundColor || '#000',
      textColor: badge.textColor || '#fff',
      icon: badge.icon,
      iconColor: badge.iconColor,
    }))
    .filter(badge => badge.name.length > 0)

  const bonusStylePalette: Record<string, { backgroundColor: string; textColor: string }> = {
    green: { backgroundColor: '#2E7D32', textColor: '#FFFFFF' },
    blue: { backgroundColor: '#2F6BFF', textColor: '#FFFFFF' },
    red: { backgroundColor: '#FF4B3A', textColor: '#FFFFFF' },
    yellow: { backgroundColor: '#F4C400', textColor: '#131415' },
    orange: { backgroundColor: '#FF8A00', textColor: '#FFFFFF' },
  }
  const bonusesFromData: DisplayBadge[] = (lotData?.bonuses || [])
    .map((bonus, idx) => {
      const title = (bonus.title || '').trim()
      if (!title) return null
      const styleKey = (bonus.style || '').trim().toLowerCase()
      const palette =
        bonusStylePalette[styleKey] ||
        [
          { backgroundColor: '#2E7D32', textColor: '#FFFFFF' },
          { backgroundColor: '#2F6BFF', textColor: '#FFFFFF' },
          { backgroundColor: '#FF4B3A', textColor: '#FFFFFF' },
        ][idx % 3]

      return {
        name: title,
        backgroundColor: palette.backgroundColor,
        textColor: palette.textColor,
      }
    })
    .filter((badge): badge is { name: string; backgroundColor: string; textColor: string } => badge != null)

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
  const badges: DisplayBadge[] = normalizedApiBadges.length > 0
    ? normalizedApiBadges
    : bonusesFromData.length > 0
      ? bonusesFromData
      : fallbackBonusBadges

  // Combine all available images into gallery (deduplicated, matching modal image sources)
  const galleryImages = Array.from(
    new Set(
      coverFirst
        ? [...(coverImage ? [coverImage] : []), ...floorPlanImages, ...galleryPhotos, ...photoImages]
        : [...floorPlanImages, ...(coverImage ? [coverImage] : []), ...galleryPhotos, ...photoImages]
    )
  )

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: isRTL ? 'rtl' : 'ltr' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScroll, setCanScroll] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setCanScroll(emblaApi.canScrollNext() || emblaApi.canScrollPrev())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    emblaApi?.scrollPrev()
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    emblaApi?.scrollNext()
  }

  const handleThumbClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    emblaApi?.scrollTo(index)
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const origin = window.location.origin
    openWhatsApp(buildLotMessage({
      projectName: projectName || undefined,
      areaName,
      typeLabel: lot.type ? capitalize(lot.type) : undefined,
      bedrooms: lot.bedrooms ?? undefined,
      bathrooms: lot.bathrooms ?? undefined,
      areaSqm: lot.areaSqm ?? undefined,
      floor: lot.floor ?? undefined,
      price: lotOurPrice,
      currency,
      unit,
      lotLink: lot.id ? `${origin}${getLotDetailRoute(lot.id)}` : null,
      projectLink: projectSlug ? `${origin}${getProjectDetailRoute(projectSlug)}` : null,
      lang: i18n.language,
    }))
  }

  const lotOurPrice = lot.priceFromUs
  const lotDevPrice = lot.priceFromDeveloper
  const discount =
    lotOurPrice && lotDevPrice && lotDevPrice > lotOurPrice
      ? Math.round((1 - lotOurPrice / lotDevPrice) * 100)
      : null

  const title = t('apartmentCard.title', { type: capitalize(lot.type), count: lot.bedrooms ?? 0 })

  const handleCardClick = () => {
    if (onClick) {
      onClick(lot)
      return
    }
    if (lot.id) {
      navigate(getLotDetailRoute(lot.id))
    }
  }

  const handleGalleryImageClick = (e: React.MouseEvent, imageUrl: string) => {
    if (onImageClick) {
      e.stopPropagation()
      onImageClick(imageUrl)
    }
  }

  return (
    <div
      className={clsx(styles.card, fullWidth && styles.fullWidth, disableHoverLift && styles.noHoverLift)}
      onClick={handleCardClick}
    >
      {!hideGallery && (
        <div className={styles.gallery}>
          {galleryImages.length > 0 ? (
            <>
              <div className={styles.galleryMain}>
                <div className={styles.galleryViewport} ref={emblaRef}>
                  <div className={styles.galleryContainer}>
                    {galleryImages.map((url, idx) => (
                      <div className={styles.gallerySlide} key={idx}>
                        <img
                          src={getImageUrl(url, 'card')}
                          alt={`${title} - image ${idx + 1}`}
                          className={styles.galleryImage}
                          onClick={e => handleGalleryImageClick(e, url)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {canScroll && (
                  <>
                    <button
                      className={`${styles.galleryArrow} ${styles.galleryArrowPrev}`}
                      onClick={handlePrev}
                      aria-label={t('apartmentCard.previousImage')}
                    >
                      {isRTL ? (
                        <ChevronRight size={14} strokeWidth={2.5} />
                      ) : (
                        <ChevronLeft size={14} strokeWidth={2.5} />
                      )}
                    </button>
                    <button
                      className={`${styles.galleryArrow} ${styles.galleryArrowNext}`}
                      onClick={handleNext}
                      aria-label={t('apartmentCard.nextImage')}
                    >
                      {isRTL ? (
                        <ChevronLeft size={14} strokeWidth={2.5} />
                      ) : (
                        <ChevronRight size={14} strokeWidth={2.5} />
                      )}
                    </button>
                  </>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className={styles.galleryThumbs}>
                  {galleryImages.map((url, idx) => (
                    <button
                      key={`thumb-${idx}`}
                      type="button"
                      className={`${styles.galleryThumb} ${
                        idx === selectedIndex ? styles.galleryThumbActive : ''
                      }`}
                      onClick={e => handleThumbClick(e, idx)}
                      aria-label={`${t('apartmentCard.nextImage')} ${idx + 1}`}
                    >
                      <img src={getImageUrl(url, 'thumbnail')} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.galleryPlaceholder}>
              <Building2 size={48} />
            </div>
          )}
        </div>
      )}

      {badges.length > 0 && (
        <div className={styles.badgesContainer}>
          {badges.slice(0, 3).map((badge, i) => (
            <Badge
              key={i}
              text={badge.name || ''}
              backgroundColor={badge.backgroundColor || '#000'}
              textColor={badge.textColor || '#fff'}
              iconName={badge.icon}
              iconColor={badge.iconColor}
              size="small"
            />
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className={styles.infoSection}>
        {/* Title */}
        <div className={styles.titleRow}>
          <Typography variant="h1" className={styles.title}>
            {title}
          </Typography>
        </div>

        {/* Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <Typography className={styles.subtitle}>{projectName}</Typography>
            {areaName && <Typography className={styles.areaName}>{areaName}</Typography>}
          </div>
          {roi && <RoiBadge value={roi} size="small" />}
        </div>

        {/* Price Rows */}
        <div className={styles.pricesSection}>
          {lotOurPrice && (
            <div className={styles.ourPriceRow}>
              <div className={styles.priceLabelContainer}>
                <Typography size="regular" weight="medium" className={styles.priceLabel}>
                  {t('apartmentCard.ourPrice')}
                </Typography>
                {discount && <span className={styles.discountBadge}>-{discount}%</span>}
              </div>
              <div className={styles.priceValue}>
                <Typography className={styles.from}>{t('from')}</Typography>{' '}
                <Typography size="large" weight="semibold">
                  {formatPrice(lotOurPrice, currency)}
                </Typography>
              </div>
            </div>
          )}
          {lotDevPrice && (
            <div className={styles.developerPriceRow}>
              <Typography size="regular" weight="medium" className={styles.priceLabel}>
                {t('apartmentCard.developerPrice')}
              </Typography>
              <div className={styles.priceValue}>
                <Typography className={styles.from}>{t('from')}</Typography>{' '}
                <Typography size="large" weight="semibold">
                  {formatPrice(lotDevPrice, currency)}
                </Typography>
              </div>
            </div>
          )}
        </div>

        {/* Specs Row */}
        <div className={styles.specsRow}>
          <span className={styles.specType}>{capitalize(lot.type)}</span>
          <span className={styles.specDivider} />
          <span className={styles.specItem}>
            <IconBed /> {lot.bedrooms ?? '-'}
          </span>
          <span className={styles.specDivider} />
          <span className={styles.specItem}>
            <IconBath /> {lot.bathrooms ?? '-'}
          </span>
          <span className={styles.specDivider} />
          <span className={styles.specItem}>
            <IconArea /> {lot.areaSqm != null ? formatArea(lot.areaSqm, unit) : '-'}
          </span>
        </div>

        {/* CTA */}
        <div className={styles.ctaContainer}>
          <Button
            variant="primary"
            size="md"
            fullWidth
            className={styles.whatsappBtn}
            onClick={handleWhatsApp}
          >
            {t('getDetailsOnWhatsApp')}
          </Button>
        </div>
      </div>
    </div>
  )
}
