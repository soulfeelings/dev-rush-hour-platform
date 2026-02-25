import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Crown,
  UsersRound,
  Award,
  BadgeDollarSign,
  Armchair,
  Scan,
} from 'lucide-react'
import styles from './Home.module.scss'
import { Button, Input, Select, Modal, ModalBody, ModalFooter, Toast, Skeleton } from '../../ui'
import { ROUTES } from '../../constants/routes'
import { useListProjects } from '../../api'
import { ProjectCard } from '../../components/ProjectCard'
import { useIsRTL } from '../../hooks/useDirection'
import HeroFilters from './components/HeroFilters'
import landingMockup from '../../assets/asset-landing-mockup.png'
import founderPhoto from '../../assets/asset-landing-founder.png'
import iconLinkedin from '../../assets/asset-landing-linkedin.svg'
import iconInstagram from '../../assets/asset-landing-insta.svg'
import iconYoutube from '../../assets/asset-landing-youtube.svg'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isRTL = useIsRTL()
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Modal form state
  const [preferredTime, setPreferredTime] = useState('morning')

  // Fetch featured projects
  const { data: projects, isLoading: isProjectsLoading } = useListProjects({ featured: true })

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const scrollAmount = carouselRef.current.offsetWidth * 0.75
    const dir = isRTL ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1)
    carouselRef.current.scrollBy({ left: scrollAmount * dir, behavior: 'smooth' })
  }

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero} data-testid="hero-section">
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroBrand}>RUSH HOUR</h1>
            <p className={styles.heroTagline}>
              <span className={styles.heroTaglineScript}>{t('home.hero.taglineScript')}</span>{' '}
              <span className={styles.heroTaglineSans}>{t('home.hero.taglineSans')}</span>
            </p>
            <div className={styles.heroActions}>
              <Button
                variant="primary"
                size="sm"
                className={styles.heroBtn}
                onClick={() => navigate(ROUTES.CATALOG)}
              >
                {t('home.hero.seeNow')}
              </Button>
              <button
                className={styles.heroLinkBtn}
                onClick={() => navigate(ROUTES.CATALOG)}
              >
                {t('home.hero.bestOffers')} <span className={styles.heroArrow}>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Demo Section */}
      <section className={styles.filtersDemo} data-testid="filters-demo-section">
        <h2 className={styles.filtersDemoTitle}>{t('home.filtersDemo.title')}</h2>

        <HeroFilters />

        <div className={styles.filtersDemoMockup}>
          <img src={landingMockup} alt="Rush Hour App" />
        </div>

        <Button
          variant="primary"
          className={styles.filtersDemoGoBtn}
          onClick={() => navigate(ROUTES.CATALOG)}
        >
          {t('home.filtersDemo.goToApp')}
        </Button>
      </section>

      {/* Properties Section — hidden when no featured projects */}
      {(isProjectsLoading || (projects && projects.length > 0)) && (
        <section className={styles.properties} data-testid="properties-section">
          <div className={styles.propertiesHeader}>
            <h2 className={styles.propertiesTitle}>{t('home.properties.title')}</h2>
            <p className={styles.propertiesSubtitle}>{t('home.properties.subtitle')}</p>
          </div>

          {isProjectsLoading ? (
            <div className={styles.skeletonCarousel}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.carouselSlide}>
                  <div className={styles.skeletonCard}>
                    <Skeleton variant="rectangular" height="55%" />
                    <div className={styles.skeletonCardBody}>
                      <div className={styles.skeletonRow}>
                        <Skeleton variant="circular" width={48} height={48} />
                        <div className={styles.skeletonLines}>
                          <Skeleton width="70%" height={16} />
                          <Skeleton width="50%" height={12} />
                          <Skeleton width="60%" height={12} />
                        </div>
                      </div>
                      <Skeleton width="100%" height={14} />
                      <Skeleton width="100%" height={14} />
                      <Skeleton width="80%" height={14} />
                      <Skeleton width="100%" height={40} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.carouselWrapper}>
              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                onClick={() => scrollCarousel('left')}
                aria-label="Previous"
              >
                {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>

              <div className={styles.carouselTrack} ref={carouselRef}>
                {projects!.map(project => (
                  <div key={project.id} className={styles.carouselSlide}>
                    <ProjectCard project={project} forceHovered />
                  </div>
                ))}
              </div>

              <button
                className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                onClick={() => scrollCarousel('right')}
                aria-label="Next"
              >
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          )}

          <div className={styles.propertiesCta}>
            <Button
              variant="primary"
              size="lg"
              className={styles.seeMoreBtn}
              onClick={() => navigate(ROUTES.CATALOG)}
            >
              {t('home.properties.viewAll')}
            </Button>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className={styles.features} data-testid="features-section">
        <h2 className={styles.featuresTitle}>{t('home.features.title')}</h2>
        <p className={styles.featuresSubtitle}>{t('home.features.subtitle')}</p>

        <div className={styles.videoBlock}>
          <div className={styles.videoContainer}>
            <iframe
              src="https://www.youtube.com/embed/HmOWyJlbFyE"
              title="Rush Hour"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <Button
          variant="primary"
          className={styles.featuresBtn}
          onClick={() => navigate(ROUTES.CATALOG)}
        >
          {t('home.features.startChoosing')}
        </Button>
      </section>

      {/* Advantages Section */}
      <section className={styles.advantages} data-testid="advantages-section">
        <h2 className={styles.advantagesTitle}>{t('home.advantages.title')}</h2>
        <p className={styles.advantagesSubtitle}>{t('home.advantages.subtitle')}</p>

        <div className={styles.advantagesGrid}>
          <div className={styles.advantageCard}>
            <div className={styles.advantageIcon}>
              <ShieldCheck size={34} />
            </div>
            <h3 className={styles.advantageCardTitle}>{t('home.advantages.verified.title')}</h3>
            <p className={styles.advantageCardDesc}>{t('home.advantages.verified.description')}</p>
          </div>
          <div className={styles.advantageCard}>
            <div className={styles.advantageIcon}>
              <Crown size={34} />
            </div>
            <h3 className={styles.advantageCardTitle}>{t('home.advantages.premium.title')}</h3>
            <p className={styles.advantageCardDesc}>{t('home.advantages.premium.description')}</p>
          </div>
          <div className={styles.advantageCard}>
            <div className={styles.advantageIcon}>
              <UsersRound size={34} />
            </div>
            <h3 className={styles.advantageCardTitle}>{t('home.advantages.expert.title')}</h3>
            <p className={styles.advantageCardDesc}>{t('home.advantages.expert.description')}</p>
          </div>
          <div className={styles.advantageCard}>
            <div className={styles.advantageIcon}>
              <Award size={34} />
            </div>
            <h3 className={styles.advantageCardTitle}>{t('home.advantages.visa.title')}</h3>
            <p className={styles.advantageCardDesc}>{t('home.advantages.visa.description')}</p>
          </div>
          <div className={styles.advantageCard}>
            <div className={styles.advantageIcon}>
              <BadgeDollarSign size={34} />
            </div>
            <h3 className={styles.advantageCardTitle}>{t('home.advantages.serviceCharge.title')}</h3>
            <p className={styles.advantageCardDesc}>{t('home.advantages.serviceCharge.description')}</p>
          </div>
          <div className={styles.advantageCard}>
            <div className={styles.advantageIcon}>
              <Armchair size={34} />
            </div>
            <h3 className={styles.advantageCardTitle}>{t('home.advantages.furnished.title')}</h3>
            <p className={styles.advantageCardDesc}>{t('home.advantages.furnished.description')}</p>
          </div>
          <div className={styles.advantageCard}>
            <div className={styles.advantageIcon}>
              <Scan size={34} />
            </div>
            <h3 className={styles.advantageCardTitle}>{t('home.advantages.referral.title')}</h3>
            <p className={styles.advantageCardDesc}>{t('home.advantages.referral.description')}</p>
          </div>
        </div>

        <Button
          variant="primary"
          className={styles.advantagesBtn}
          onClick={() => navigate(ROUTES.CATALOG)}
        >
          {t('home.advantages.learnMore')}
        </Button>
      </section>

      {/* Founder Section */}
      <section className={styles.founder} data-testid="founder-section">
        <div className={styles.founderTop}>
          <div className={styles.founderText}>
            <h2 className={styles.founderName}>{t('home.founder.name')}</h2>
            <p className={styles.founderRole}>{t('home.founder.role')}</p>
            <div className={styles.founderQuote}>
              <p>{t('home.founder.quote1')}</p>
              <p>{t('home.founder.quote2')}</p>
              <p>{t('home.founder.quote3')}</p>
            </div>
          </div>
          <div className={styles.founderPhoto}>
            <img src={founderPhoto} alt={t('home.founder.name')} />
          </div>
        </div>

      </section>

      {/* Follow Us Section */}
      <section className={styles.followUs} data-testid="follow-us-section">
        <div className={styles.followUsCard}>
          <h2 className={styles.followUsTitle}>{t('home.followUs.title')}</h2>
          <p className={styles.followUsSubtitle}>{t('home.followUs.subtitle')}</p>
          <div className={styles.followUsSocials}>
            <a href="https://www.linkedin.com/company/rush-hour-real-estate-broker/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <img src={iconLinkedin} alt="LinkedIn" />
            </a>
            <a href="https://www.instagram.com/rushhour.properties/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={iconInstagram} alt="Instagram" />
            </a>
            <a href="https://www.youtube.com/channel/UCIKwE6B6VkI8nWWpkbXvRJg" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <img src={iconYoutube} alt="YouTube" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta} data-testid="cta-section">
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>{t('home.cta.title')}</h2>
          <p className={styles.ctaDesc}>{t('home.cta.description')}</p>
          <div className={styles.ctaActions}>
            <Button size="lg" onClick={() => navigate(ROUTES.CATALOG)}>
              {t('home.cta.getStarted')}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => setShowModal(true)}
            >
              {t('home.cta.scheduleCall')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} data-testid="footer-section">
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <h3>
                Rush<span>Hour</span>
              </h3>
              <p>{t('home.footer.tagline')}</p>
            </div>
            <div className={styles.footerColumn}>
              <h4>{t('home.footer.properties.title')}</h4>
              <ul>
                <li>
                  <a href="#">{t('home.footer.properties.buy')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.properties.rent')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.properties.offPlan')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.properties.commercial')}</a>
                </li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>{t('home.footer.company.title')}</h4>
              <ul>
                <li>
                  <a href="#">{t('home.footer.company.about')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.company.careers')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.company.press')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.company.contact')}</a>
                </li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>{t('home.footer.support.title')}</h4>
              <ul>
                <li>
                  <a href="#">{t('home.footer.support.help')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.support.privacy')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.support.terms')}</a>
                </li>
                <li>
                  <a href="#">{t('home.footer.support.faq')}</a>
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>{t('home.footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={t('home.modal.scheduleCall.title')}
      >
        <ModalBody>
          <Input
            label={t('home.modal.scheduleCall.name')}
            placeholder={t('home.modal.scheduleCall.namePlaceholder')}
          />
          <div style={{ marginTop: '16px' }}>
            <Input
              label={t('home.modal.scheduleCall.phone')}
              type="tel"
              placeholder={t('home.modal.scheduleCall.phonePlaceholder')}
            />
          </div>
          <div style={{ marginTop: '16px' }}>
            <Select
              label={t('home.modal.scheduleCall.preferredTime')}
              options={[
                { value: 'morning', label: t('home.modal.scheduleCall.morning') },
                { value: 'afternoon', label: t('home.modal.scheduleCall.afternoon') },
                { value: 'evening', label: t('home.modal.scheduleCall.evening') },
              ]}
              value={preferredTime}
              onChange={setPreferredTime}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            {t('home.modal.scheduleCall.cancel')}
          </Button>
          <Button variant="primary">{t('home.modal.scheduleCall.submit')}</Button>
        </ModalFooter>
      </Modal>

      {/* Toast */}
      <Toast open={showToast} onClose={() => setShowToast(false)} variant="success">
        {t('home.toast.favoriteAdded')}
      </Toast>
    </div>
  )
}
