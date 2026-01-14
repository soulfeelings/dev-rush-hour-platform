import useEmblaCarousel from 'embla-carousel-react'
import ClassNames from 'embla-carousel-class-names'
import { useEffect, useRef } from 'react'

interface LotCardCarouselProps {
  images: string[]
  alt?: string
}

export default function LotCardCarousel({ images, alt = 'Lot image' }: LotCardCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', dragFree: false }, [
    ClassNames(),
  ])
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!emblaApi) return

    const onScroll = () => {
      const scrollProgress = emblaApi.scrollProgress()
      const snapList = emblaApi.scrollSnapList()

      parallaxRefs.current.forEach((el, index) => {
        if (!el) return
        const progress = snapList[index] - scrollProgress
        el.style.transform = `translateX(${progress * 50}%)`
      })
    }

    emblaApi.on('scroll', onScroll).on('reInit', onScroll)
    onScroll()

    return () => {
      emblaApi.off('scroll', onScroll).off('reInit', onScroll)
    }
  }, [emblaApi])

  const displayImages =
    images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']

  return (
    <div className="embla__viewport" ref={emblaRef}>
      <div className="embla__container">
        {displayImages.map((image, index) => (
          <div key={index} className="embla__slide">
            <div className="embla__parallax">
              <div
                ref={el => {
                  parallaxRefs.current[index] = el
                }}
                className="embla__parallax__layer"
              >
                <img src={image} alt={`${alt} ${index + 1}`} className="embla__parallax__img" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
