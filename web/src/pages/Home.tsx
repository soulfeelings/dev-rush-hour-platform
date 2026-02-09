import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.scss'
import { Button, Input, Select, Modal, ModalBody, ModalFooter, Toast } from '../ui'
import HeroFilters from '../components/HeroFilters'
import { ROUTES } from '../constants/routes'

const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const IconBed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
  </svg>
)

const IconBath = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1zM6 12V5a2 2 0 0 1 2-2h3v2.25M4 21l1-1.5M20 21l-1-1.5" />
  </svg>
)

const IconArea = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
)

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const IconService = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
)

const IconFurniture = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9M15 21V9" />
  </svg>
)

const IconVisa = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M7 8h10M7 12h10M7 16h6" />
  </svg>
)

const IconGift = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M7 12h10" />
  </svg>
)

// Property data
const properties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
    title: 'Luxury Villa in Palm Jumeirah',
    location: 'Palm Jumeirah, Dubai',
    price: 'AED 15,500,000',
    beds: 5,
    baths: 6,
    area: '8,500 sq ft',
    badge: 'Featured',
    featured: true,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
    title: 'Modern Apartment Downtown',
    location: 'Downtown Dubai',
    price: 'AED 3,200,000',
    beds: 2,
    baths: 2,
    area: '1,450 sq ft',
    badge: 'New',
    featured: false,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
    title: 'Penthouse with Marina View',
    location: 'Dubai Marina',
    price: 'AED 8,900,000',
    beds: 4,
    baths: 4,
    area: '4,200 sq ft',
    badge: null,
    featured: false,
  },
]

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  // Modal form state
  const [preferredTime, setPreferredTime] = useState('morning')

  const toggleFavorite = (id: number) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]))
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t('home.hero.title')}{' '}
              <span className={styles.heroHighlight}>{t('home.hero.titleHighlight')}</span>{' '}
              {t('home.hero.titleSuffix')}
            </h1>
            <p className={styles.heroDesc}>
              <strong>{t('home.hero.descriptionBold')}</strong> {t('home.hero.description')}
            </p>
            <HeroFilters />
          </div>
        </div>
      </section>

      {/* Quiz Section */}

      {/* Properties Section */}
      <section className={styles.properties}>
        <div
          className={styles.sectionHeader}
          style={{
            justifyContent: 'center',
            textAlign: 'center',
            flexDirection: 'column',
          }}
        >
          <div>
            <h2 className={styles.sectionTitle}>{t('home.properties.title')}</h2>
            <p className={styles.sectionSubtitle}>{t('home.properties.subtitle')}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            style={{ marginTop: '16px' }}
            onClick={() => navigate(ROUTES.CATALOG)}
          >
            {t('home.properties.viewAll')}
          </Button>
        </div>

        <div className={styles.propertiesGrid}>
          {properties.map(property => (
            <article key={property.id} className={styles.card}>
              <div className={styles.cardImage}>
                <img src={property.image} alt={property.title} />
                {property.badge && (
                  <span
                    className={`${styles.cardBadge} ${
                      property.featured ? styles.cardBadgeFeatured : ''
                    }`}
                  >
                    {property.badge}
                  </span>
                )}
                <button
                  className={`${styles.cardFavorite} ${
                    favorites.includes(property.id) ? styles.active : ''
                  }`}
                  onClick={() => toggleFavorite(property.id)}
                >
                  <IconHeart />
                </button>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardPrice}>{property.price}</div>
                <h3 className={styles.cardTitle}>{property.title}</h3>
                <div className={styles.cardLocation}>
                  <IconLocation />
                  {property.location}
                </div>
                <div className={styles.cardDetails}>
                  <span className={styles.cardDetail}>
                    <IconBed /> {property.beds} {t('home.properties.beds')}
                  </span>
                  <span className={styles.cardDetail}>
                    <IconBath /> {property.baths} {t('home.properties.baths')}
                  </span>
                  <span className={styles.cardDetail}>
                    <IconArea /> {property.area}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div
          className={styles.sectionHeader}
          style={{ justifyContent: 'center', textAlign: 'center' }}
        >
          <div>
            <h2 className={styles.sectionTitle}>{t('home.features.title')}</h2>
            <p className={styles.sectionSubtitle}>{t('home.features.subtitle')}</p>
          </div>
        </div>

        {/* Video Block with Burj Khalifa frame */}
        <div className={styles.videoBlock}>
          <div className={styles.videoFrame}>
            <svg
              className={`${styles.burjSilhouette} ${styles.left}`}
              viewBox="0 0 60 200"
              fill="currentColor"
            >
              <path d="M30 0 L32 20 L35 20 L35 40 L38 40 L38 60 L40 60 L40 80 L42 80 L42 100 L44 100 L44 120 L46 120 L46 140 L48 140 L48 160 L50 160 L50 180 L55 180 L55 200 L5 200 L5 180 L10 180 L10 160 L12 160 L12 140 L14 140 L14 120 L16 120 L16 100 L18 100 L18 80 L20 80 L20 60 L22 60 L22 40 L25 40 L25 20 L28 20 Z" />
            </svg>
            <div className={styles.videoContainer}>
              <button className={styles.videoPlayBtn} aria-label="Play video" />
            </div>
            <svg className={styles.burjSilhouette} viewBox="0 0 60 200" fill="currentColor">
              <path d="M30 0 L32 20 L35 20 L35 40 L38 40 L38 60 L40 60 L40 80 L42 80 L42 100 L44 100 L44 120 L46 120 L46 140 L48 140 L48 160 L50 160 L50 180 L55 180 L55 200 L5 200 L5 180 L10 180 L10 160 L12 160 L12 140 L14 140 L14 120 L16 120 L16 100 L18 100 L18 80 L20 80 L20 60 L22 60 L22 40 L25 40 L25 20 L28 20 Z" />
            </svg>
          </div>
          <p className={styles.videoCaption}>{t('home.features.videoCaption')}</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconShield />
            </div>
            <h3 className={styles.featureTitle}>{t('home.features.verified.title')}</h3>
            <p className={styles.featureDesc}>{t('home.features.verified.description')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconHome />
            </div>
            <h3 className={styles.featureTitle}>{t('home.features.premium.title')}</h3>
            <p className={styles.featureDesc}>{t('home.features.premium.description')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconUsers />
            </div>
            <h3 className={styles.featureTitle}>{t('home.features.expert.title')}</h3>
            <p className={styles.featureDesc}>{t('home.features.expert.description')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconService />
            </div>
            <h3 className={styles.featureTitle}>{t('home.features.serviceCharge.title')}</h3>
            <p className={styles.featureDesc}>{t('home.features.serviceCharge.description')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconFurniture />
            </div>
            <h3 className={styles.featureTitle}>{t('home.features.furnished.title')}</h3>
            <p className={styles.featureDesc}>{t('home.features.furnished.description')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconVisa />
            </div>
            <h3 className={styles.featureTitle}>{t('home.features.visa.title')}</h3>
            <p className={styles.featureDesc}>{t('home.features.visa.description')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconGift />
            </div>
            <h3 className={styles.featureTitle}>{t('home.features.referral.title')}</h3>
            <p className={styles.featureDesc}>{t('home.features.referral.description')}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
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
      <footer className={styles.footer}>
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
            <div className={styles.footerSocials}>
              <a href="#">
                <IconX />
              </a>
              <a href="#">
                <IconHome />
              </a>
              <a href="#">
                <IconUsers />
              </a>
            </div>
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
