import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './FeaturedPropertyCarousel.module.scss'
import type { Property } from '../../types/property'

const IconExcavator = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 18h20M4 18V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10M4 18h16M10 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 8h4M14 8v10" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
)

interface FeaturedPropertyCarouselProps {
  properties: Property[]
  autoPlayInterval?: number
}

export default function FeaturedPropertyCarousel({
  properties,
  autoPlayInterval = 5000,
}: FeaturedPropertyCarouselProps) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (properties.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % properties.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [properties.length, autoPlayInterval])

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + properties.length) % properties.length)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % properties.length)
  }

  if (properties.length === 0) return null

  const currentProperty = properties[currentIndex]

  return (
    <div className={styles.carousel}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img src={currentProperty.image} alt={currentProperty.title} />
          {currentProperty.tags && currentProperty.tags.length > 0 && (
            <div className={styles.tags}>
              {currentProperty.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>{currentProperty.title}</h2>
          {currentProperty.description && (
            <p className={styles.description}>{currentProperty.description}</p>
          )}
          <div className={styles.developer}>
            <IconExcavator />
            <div>
              <div className={styles.developerName}>{currentProperty.developer}</div>
              <div className={styles.developerLabel}>{t('featuredCarousel.agency')}</div>
            </div>
          </div>
        </div>
      </div>
      {properties.length > 1 && (
        <div className={styles.controls}>
          <div className={styles.dots}>
            {properties.map((_, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                onClick={() => setCurrentIndex(idx)}
                type="button"
              />
            ))}
          </div>
          <div className={styles.navButtons}>
            <button className={styles.navButton} onClick={goToPrevious} type="button">
              <ChevronLeft size={20} />
            </button>
            <button className={styles.navButton} onClick={goToNext} type="button">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
