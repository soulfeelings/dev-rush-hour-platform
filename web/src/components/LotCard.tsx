import { Heart, Building2, ChevronLeft, ChevronRight, Bed, ShowerHead, Move } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getLotDetailRoute } from '../constants/routes'
import styles from './LotCard.module.scss'
import type { Lot } from '../api'

interface LotWithProject extends Lot {
  project?: {
    name?: string
    slug?: string
    lat?: number
    lng?: number
    image?: string
    data?: {
      specs?: { [key: string]: unknown }
    }
    developer?: {
      name?: string
      data?: { logoUrl?: string }
    }
    area?: { name?: string }
  }
  developer?: {
    name?: string
    data?: { logoUrl?: string }
  }
  area?: { name?: string; city?: string }
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

export default function LotCard({ lot, onFavoriteClick }: LotCardProps) {
  const { t } = useTranslation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  const formatPrice = (price: number, currency: string) => {
    return `${(price / 1000000).toFixed(1)}M ${currency}`
  }

  // Функция для разделения completionDate на первые 2 символа и остальное
  const splitCompletionDate = (dateString: string) => {
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

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Open WhatsApp for lot:', lot.id)
  }

  const projectName = lot.project?.name || 'Project'
  const developerName = lot.developer?.name || lot.project?.developer?.name || 'Developer'
  const areaName = lot.area?.name || lot.project?.area?.name
  const cityName = lot.area?.city
  const location = [areaName, cityName].filter(Boolean).join(', ') || 'Dubai'
  const logoUrl = lot.project?.developer?.data?.logoUrl || lot.developer?.data?.logoUrl

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

  const typeLabel = lot.type ? lot.type.charAt(0).toUpperCase() + lot.type.slice(1) : 'Apartment'
  const price = lot.priceAmount || 0
  const currency = lot.priceCurrency || 'AED'
  const discountedPrice = price * 0.75 // Скидка 25%

  const { firstPart, rest } = splitCompletionDate(
    (lot.project?.data?.specs?.completionDate as string) || 'Q1 2026'
  )

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
                  src={allImages[currentImageIndex]}
                  alt={`${projectName} - image ${currentImageIndex + 1}`}
                />

                <button
                  className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
                  onClick={handleFavoriteClick}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={20} />
                </button>

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
              <span>Unit Image</span>
            </div>
          )}
        </div>

        {/* Правая часть - Информация */}
        <div className={styles.lotInfoSection}>
          <div className={styles.frame66}>
            {/* Developer контейнер */}
            <div className={styles.developerContainer}>
              <div className={styles.developerLogoContainer}>
                {logoUrl && <img src={logoUrl} alt={developerName} />}
              </div>
              <div className={styles.projectInfo}>
                <span className={styles.projectTitle}>{projectName}</span>
                <span className={styles.developerName}>{developerName}</span>
                <span className={styles.regionName}>{location}</span>
              </div>

              <div className={styles.roiContainer}>
                <span className={styles.roiValue}>ROI 7%</span>
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
                  <span className={styles.areaValue}>{lot.areaSqm}</span>
                  <span className={styles.areaUnit}>m²</span>
                </div>
              )}
            </div>

            {/* Цены */}
            <div className={styles.priceSection}>
              <div className={styles.priceItem}>
                <div className={styles.priceLabel}>
                  <span className={styles.priceLabelText}>Our price:</span>
                  <div className={styles.discountBadge}>
                    <span className={styles.discountValue}>-25%</span>
                  </div>
                </div>
                <span className={styles.priceValue}>
                  <span className={styles.from}>{t('from')}</span>
                  {formatPrice(discountedPrice, currency)}
                </span>
              </div>

              <div className={styles.priceItem}>
                <span className={styles.priceLabelText}>Developer price:</span>
                <span className={styles.priceValue}>
                  <span className={styles.from}>{t('from')}</span>
                  {formatPrice(price, currency)}
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
                <span className={styles.whatsappText}>Get Details on WhatsApp</span>
              </button>
              <div className={styles.whatsappNote}>Investment details. No spam</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
