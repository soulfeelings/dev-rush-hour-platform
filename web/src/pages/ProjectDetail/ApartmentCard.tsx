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
import { getLotDetailRoute } from '../../constants/routes'
import { useIsRTL } from '../../hooks/useDirection'
import type { Lot } from '../../api'
import styles from './ApartmentCard.module.scss'

interface LotData {
  media?: {
    cover?: { url?: string }
    floorPlanImages?: { url?: string }[]
  }
}

interface ApartmentCardProps {
  lot: Lot
  projectName?: string
  areaName?: string
  roi?: number
  ourPrice?: number
  developerPrice?: number
}

export function ApartmentCard({
  lot,
  projectName,
  areaName,
  roi,
  ourPrice,
  developerPrice,
}: ApartmentCardProps) {
  const { currency, unit } = useSettings()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isRTL = useIsRTL()

  const lotData = lot.data as LotData | undefined
  const coverImage = lotData?.media?.cover?.url
  const floorPlanImages =
    lotData?.media?.floorPlanImages?.map(img => img.url).filter((u): u is string => Boolean(u)) ||
    []
  const badges = lot.badges || []

  // Combine floor plan images + cover into gallery
  const galleryImages = [...floorPlanImages, ...(coverImage ? [coverImage] : [])]

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

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: open WhatsApp link
  }

  const discount =
    ourPrice && developerPrice && developerPrice > ourPrice
      ? Math.round((1 - ourPrice / developerPrice) * 100)
      : null

  const title = t('apartmentCard.title', { type: capitalize(lot.type), count: lot.bedrooms ?? 0 })

  return (
    <div className={styles.card} onClick={() => lot.id && navigate(getLotDetailRoute(lot.id))}>
      {/* Gallery */}
      <div className={styles.gallery}>
        {galleryImages.length > 0 ? (
          <>
            <div className={styles.galleryViewport} ref={emblaRef}>
              <div className={styles.galleryContainer}>
                {galleryImages.map((url, idx) => (
                  <div className={styles.gallerySlide} key={idx}>
                    <img
                      src={url}
                      alt={`${title} - image ${idx + 1}`}
                      className={styles.galleryImage}
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
            {galleryImages.length > 1 && (
              <div className={styles.progressBar}>
                {galleryImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`${styles.progressSegment} ${idx === selectedIndex ? styles.progressSegmentActive : ''}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.galleryPlaceholder}>
            <Building2 size={48} />
          </div>
        )}

        {badges.length > 0 && (
          <div className={styles.badgesContainer}>
            {badges.slice(0, 2).map((badge, i) => (
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
      </div>

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
          {ourPrice && developerPrice && ourPrice < developerPrice && (
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
                  {formatPrice(ourPrice, currency)}
                </Typography>
              </div>
            </div>
          )}
          <div className={styles.developerPriceRow}>
            <Typography size="regular" weight="medium" className={styles.priceLabel}>
              {ourPrice && developerPrice
                ? t('apartmentCard.developerPrice')
                : t('apartmentCard.price')}
            </Typography>
            <div className={styles.priceValue}>
              <Typography className={styles.from}>{t('from')}</Typography>{' '}
              <Typography size="large" weight="semibold">
                {formatPrice(lot.priceFromUs, currency)}
              </Typography>
            </div>
          </div>
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
