import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ProjectDetail.module.scss'

interface ApartmentsCarouselProps {
  children: React.ReactNode
}

export function ApartmentsCarousel({ children }: ApartmentsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className={styles.apartmentsCarousel}>
      <div className={styles.apartmentsViewport} ref={emblaRef}>
        <div className={styles.apartmentsContainer}>{children}</div>
      </div>
      {canScrollPrev && (
        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
      )}
      {canScrollNext && (
        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
