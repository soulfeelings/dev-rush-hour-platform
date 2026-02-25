import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useIsRTL } from '../../hooks/useDirection'
import { getDescriptionText } from '../../utils/project'
import { getImageUrl } from '../../utils/imageUrl'
import styles from './FeaturedPropertyCarousel.module.scss'
import type { Project } from '../../api/generated/schemas/project'

const IconExcavator = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 18h20M4 18V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10M4 18h16M10 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 8h4M14 8v10" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
)

interface FeaturedPropertyCarouselProps {
  projects: Project[]
  autoPlayInterval?: number
}

export default function FeaturedPropertyCarousel({
  projects,
  autoPlayInterval = 5000,
}: FeaturedPropertyCarouselProps) {
  const { t } = useTranslation()
  const isRTL = useIsRTL()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (projects.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % projects.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [projects.length, autoPlayInterval])

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + projects.length) % projects.length)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % projects.length)
  }

  if (projects.length === 0) return null

  const current = projects[currentIndex]
  const coverImage = current.media?.cover?.url
  const description = getDescriptionText(current)

  return (
    <div className={styles.carousel}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {coverImage && <img src={getImageUrl(coverImage, 'card')} alt={current.name} />}
          {current.tags && current.tags.length > 0 && (
            <div className={styles.tags}>
              {current.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>{current.name}</h2>
          {description && <p className={styles.description}>{description}</p>}
          <div className={styles.developer}>
            <IconExcavator />
            <div>
              <div className={styles.developerName}>{current.developer?.name}</div>
              <div className={styles.developerLabel}>{t('featuredCarousel.agency')}</div>
            </div>
          </div>
        </div>
      </div>
      {projects.length > 1 && (
        <div className={styles.controls}>
          <div className={styles.dots}>
            {projects.map((_, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                onClick={() => setCurrentIndex(idx)}
                type="button"
              />
            ))}
          </div>
          <div className={styles.navButtons}>
            <button
              className={styles.navButton}
              onClick={goToPrevious}
              type="button"
              aria-label="Previous"
            >
              {isRTL ? (
                <ChevronRight size={22} strokeWidth={2.5} />
              ) : (
                <ChevronLeft size={22} strokeWidth={2.5} />
              )}
            </button>
            <button className={styles.navButton} onClick={goToNext} type="button" aria-label="Next">
              {isRTL ? (
                <ChevronLeft size={22} strokeWidth={2.5} />
              ) : (
                <ChevronRight size={22} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
