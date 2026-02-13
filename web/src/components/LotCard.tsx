import React, { useState } from 'react'
import { Heart, Building2, ChevronLeft, ChevronRight, Bed, ShowerHead, Move } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getLotDetailRoute } from '../constants/routes'
import { useSettings } from '../features/Settings/Settings'
import { formatPrice, formatArea } from '../utils/format'
import { Badge } from '../ui/Badge'
import { splitCompletionDate } from './splitCompletionDate'
import styles from './LotCard.module.scss'
import type { Lot } from '../api'
import type { LotMedia, MediaItem } from '../api/generated/schemas'

interface LotCardProps {
  lot: Lot
  onFavoriteClick?: (lotId: string) => void
}

export default function LotCard({ lot, onFavoriteClick }: LotCardProps) {
  const { t } = useTranslation()
  const { currency, unit } = useSettings()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteClick?.(lot.id!)
  }

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

  const projectName = lot.project?.name || 'Project'
  const developerName = lot.developer?.name || lot.project?.developer?.name || 'Developer'
  const areaName = lot.area?.name || lot.project?.area?.name
  const cityName = lot.area?.city
  const location = [areaName, cityName].filter(Boolean).join(', ') || 'Dubai'
  const logoUrl = lot.project?.developer?.logoUrl || lot.developer?.logoUrl

  const lotMedia = lot.data?.media as LotMedia | undefined
  const allImages = [
    ...(lotMedia?.cover?.url ? [lotMedia.cover.url] : []),
    ...(lotMedia?.photos
      ?.map((img: MediaItem) => img.url)
      .filter((url): url is string => Boolean(url)) || []),
  ]

  const badges = lot.badges ?? []
  const typeLabel = lot.type ? lot.type.charAt(0).toUpperCase() + lot.type.slice(1) : 'Apartment'

  // Цены:
  // developerPrice — цена застройщика (или priceAmount как fallback)
  const developerPriceValue = lot.developerPrice ?? lot.priceAmount ?? 0
  // ourPrice — наша цена (или priceAmount, или developerPrice как fallback)
  const ourPriceValue = lot.ourPrice ?? lot.priceAmount ?? developerPriceValue
  const roiValue = lot.roi ?? null

  // Скидка считается если итоговая цена меньше цены застройщика
  const discountPercent =
    ourPriceValue > 0 &&
    developerPriceValue > 0 &&
    ourPriceValue < developerPriceValue
      ? Math.round(((developerPriceValue - ourPriceValue) / developerPriceValue) * 100)
      : null

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const phone = '971544313048'
    const lotUrl = `${window.location.origin}/lot/${lot.id}`
    const bedroomsText = lot.bedrooms != null ? `${lot.bedrooms} bed` : ''
    const priceText = ourPriceValue ? `AED ${ourPriceValue.toLocaleString()}` : ''
    const roiText = roiValue != null ? `ROI ${roiValue}%` : ''
    const parts = [
      `Hi! I'm interested in a lot:`,
      projectName && `Project: ${projectName}`,
      developerName && `Developer: ${developerName}`,
      areaName && `Area: ${areaName}`,
      bedroomsText,
      priceText,
      roiText,
      `Link: ${lotUrl}`,
    ].filter(Boolean)
    const message = parts.join('\n')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const { firstPart, rest } = splitCompletionDate(lot.project?.data?.completionDate || 'Q1 2026')

  if (!lot.id) return null

  return (
    <Link to={getLotDetailRoute(lot.id)} className={styles.cardLink}>
      <div className={styles.card}>
        {/* Left Section - Gallery */}
        <div className={styles.photoSection}>
          {allImages.length > 0 ? (
            <div className={styles.galleryContainer}>
              <div className={styles.mainImageContainer}>
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${projectName} - image ${currentImageIndex + 1}`}
                />
                <button
                  className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
                  onClick={handleFavoriteClick}
                  aria-label={
                    isFavorited ? t('lotCard.removeFromFavorites') : t('lotCard.addToFavorites')
                  }
                >
                  <Heart size={20} />
                </button>

                {badges.length > 0 && (
                  <div className={styles.badgesContainer}>
                    {badges.map(badge => (
                      <Badge
                        key={badge.id}
                        text={badge.name || ''}
                        backgroundColor={badge.backgroundColor || '#e0e0e0'}
                        textColor={badge.textColor}
                        iconName={badge.icon}
                        iconColor={badge.iconColor}
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

              {/* Pagination */}
              {allImages.length > 1 && (
                <div className={styles.photoPagination}>
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      className={`${styles.paginationDot} ${
                        idx === currentImageIndex ? styles.activePagination : ''
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

        {/* Right Section - Info */}
        <div className={styles.lotInfoSection}>
          <div className={styles.frame66}>
            {/* Developer Container */}
            <div className={styles.developerContainer}>
              <div className={styles.developerLogoContainer}>
                {logoUrl && <img src={logoUrl} alt={developerName} />}
              </div>
              <div className={styles.projectInfo}>
                <span className={styles.projectTitle}>{projectName}</span>
                <span className={styles.developerName}>{developerName}</span>
                <span className={styles.regionName}>{location}</span>
              </div>

              {roiValue !== null && (
                <div className={styles.roiContainer}>
                  <span className={styles.roiValue}>ROI {roiValue}%</span>
                </div>
              )}
            </div>

            {/* Lot Info */}
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

            {/* Prices */}
            <div className={styles.priceSection}>
              <div className={styles.priceItem}>
                <div className={styles.priceLabel}>
                  <span className={styles.priceLabelText}>{t('lotCard.ourPrice')}</span>
                  {discountPercent !== null && (
                    <div className={styles.discountBadge}>
                      <span className={styles.discountValue}>-{discountPercent}%</span>
                    </div>
                  )}
                </div>
                <span className={styles.priceValue}>
                  <span className={styles.from}>{t('from')}</span>
                  {formatPrice(ourPriceValue, currency)}
                </span>
              </div>

              <div className={styles.priceItem}>
                <span className={styles.priceLabelText}>{t('lotCard.developerPrice')}</span>
                <span className={styles.priceValue}>
                  <span className={styles.from}>{t('from')}</span>
                  {formatPrice(developerPriceValue, currency)}
                </span>
              </div>
            </div>

            {/* Date and Payment Plan */}
            <div className={styles.paymentPlanContainer}>
              <div className={styles.dateContainer}>
                <span className={styles.dateValue}>
                  <span className={styles.quarter}>{firstPart}</span>
                  {rest && <span className={styles.year}> {rest}</span>}
                </span>
              </div>
            </div>

            {/* WhatsApp Button */}
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
