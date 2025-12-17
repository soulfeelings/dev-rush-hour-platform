import { useState, useRef, useEffect } from 'react'
import styles from './DesignDemo.module.scss'
import {
  Button,
  Input,
  Select,
  Checkbox,
  SkeletonCard,
  Tooltip,
  Modal,
  ModalBody,
  ModalFooter,
  Toast,
} from '../ui'

// Icons
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
)

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

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
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

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

// Custom Select Component
interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectingValue, setSelectingValue] = useState<string | null>(null)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    setSelectingValue(optionValue)
    setTimeout(() => {
      onChange(optionValue)
      setIsOpen(false)
      setSelectingValue(null)
    }, 150)
  }

  return (
    <div className={styles.customSelect} ref={selectRef}>
      <button
        type="button"
        className={`${styles.customSelectTrigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.label || placeholder || 'Select...'}
        <span className={styles.customSelectArrow}>
          <IconChevronDown />
        </span>
      </button>
      <div className={`${styles.customSelectDropdown} ${isOpen ? styles.open : ''}`}>
        <div className={styles.customSelectOptions}>
          {options.map(option => (
            <div
              key={option.value}
              className={`${styles.customSelectOption} ${
                value === option.value ? styles.selected : ''
              } ${selectingValue === option.value ? styles.selecting : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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

export default function DesignDemo() {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  // Search form states
  const [location, setLocation] = useState('all')
  const [propertyType, setPropertyType] = useState('all')
  const [priceRange, setPriceRange] = useState('any')

  // Showcase form state
  const [showcaseSelect, setShowcaseSelect] = useState('opt1')

  // Modal form state
  const [preferredTime, setPreferredTime] = useState('morning')

  const toggleFavorite = (id: number) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]))
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className={styles.demo}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="#" className={styles.logo}>
            Rush<span>Hour</span>
          </a>

          <nav className={styles.nav}>
            <a href="#" className={styles.navLink}>
              Buy
            </a>
            <a href="#" className={styles.navLink}>
              Rent
            </a>
            <a href="#" className={styles.navLink}>
              Off-Plan
            </a>
            <a href="#" className={styles.navLink}>
              Areas
            </a>
          </nav>

          <div className={styles.headerActions}>
            <Button size="sm">List Property</Button>
            <button className={styles.menuBtn}>
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <IconStar /> #1 Property Platform in Dubai
            </div>
            <h1 className={styles.heroTitle}>
              Find Your <span className={styles.heroHighlight}>Dream Home</span> in Dubai
            </h1>
            <p className={styles.heroDesc}>
              Discover premium properties across Dubai's most prestigious neighborhoods. From
              luxurious villas to modern apartments.
            </p>
            <div className={styles.heroActions}>
              <Button>
                <IconSearch /> Explore Properties
              </Button>
              <Button variant="secondary">Contact Agent</Button>
            </div>
          </div>

          <div className={styles.heroImage}>
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
              alt="Luxury Dubai Property"
            />
            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>2,500+</div>
                <div className={styles.statLabel}>Properties</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>500+</div>
                <div className={styles.statLabel}>Happy Clients</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>50+</div>
                <div className={styles.statLabel}>Areas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className={styles.search}>
        <div className={styles.searchCard}>
          <h2 className={styles.searchTitle}>Find Your Perfect Property</h2>
          <form className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Location</label>
              <CustomSelect
                options={[
                  { value: 'all', label: 'All Dubai' },
                  { value: 'palm', label: 'Palm Jumeirah' },
                  { value: 'downtown', label: 'Downtown Dubai' },
                  { value: 'marina', label: 'Dubai Marina' },
                  { value: 'business', label: 'Business Bay' },
                ]}
                value={location}
                onChange={setLocation}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Property Type</label>
              <CustomSelect
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'villa', label: 'Villa' },
                  { value: 'apartment', label: 'Apartment' },
                  { value: 'penthouse', label: 'Penthouse' },
                  { value: 'townhouse', label: 'Townhouse' },
                ]}
                value={propertyType}
                onChange={setPropertyType}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price Range</label>
              <CustomSelect
                options={[
                  { value: 'any', label: 'Any Price' },
                  { value: 'under1m', label: 'Under 1M AED' },
                  { value: '1m-3m', label: '1M - 3M AED' },
                  { value: '3m-5m', label: '3M - 5M AED' },
                  { value: '5m+', label: '5M+ AED' },
                ]}
                value={priceRange}
                onChange={setPriceRange}
              />
            </div>
            <Button type="button">
              <IconSearch /> Search
            </Button>
          </form>
        </div>
      </section>

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
            <h2 className={styles.sectionTitle}>Featured Properties</h2>
            <p className={styles.sectionSubtitle}>Handpicked selections for discerning buyers</p>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: '16px' }}>
            View All
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
                    <IconBed /> {property.beds} Beds
                  </span>
                  <span className={styles.cardDetail}>
                    <IconBath /> {property.baths} Baths
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
            <h2 className={styles.sectionTitle}>Why Choose RushHour</h2>
            <p className={styles.sectionSubtitle}>Your trusted partner in Dubai real estate</p>
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
          <p className={styles.videoCaption}>Discover Dubai's finest properties</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconShield />
            </div>
            <h3 className={styles.featureTitle}>Verified Listings</h3>
            <p className={styles.featureDesc}>
              Every property is verified by our team to ensure accuracy and authenticity.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconHome />
            </div>
            <h3 className={styles.featureTitle}>Premium Selection</h3>
            <p className={styles.featureDesc}>
              Curated collection of the finest properties across Dubai's best locations.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IconUsers />
            </div>
            <h3 className={styles.featureTitle}>Expert Guidance</h3>
            <p className={styles.featureDesc}>
              Dedicated advisors to help you through every step of your property journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to Find Your Dream Home?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of satisfied buyers who found their perfect property through RushHour.
          </p>
          <div className={styles.ctaActions}>
            <Button size="lg">Get Started Today</Button>
            <Button
              variant="ghost"
              size="lg"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => setShowModal(true)}
            >
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>

      {/* UI Components Showcase */}
      <section className={styles.showcase}>
        <div className={styles.showcaseInner}>
          <div
            className={styles.sectionHeader}
            style={{ justifyContent: 'center', textAlign: 'center' }}
          >
            <div>
              <h2 className={styles.sectionTitle}>Design System Showcase</h2>
              <p className={styles.sectionSubtitle}>All UI components and styles</p>
            </div>
          </div>

          {/* Colors */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>Color Palette</h3>
            <p className={styles.showcaseSubtitle}>
              All colors and shades used in the design system
            </p>

            {/* Primary Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '16px',
              }}
            >
              PRIMARY
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E5A732' }} />
                <div className={styles.swatchLabel}>
                  Primary
                  <br />
                  #E5A732
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#D19526' }} />
                <div className={styles.swatchLabel}>
                  Hover
                  <br />
                  #D19526
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#BD8620' }} />
                <div className={styles.swatchLabel}>
                  Active
                  <br />
                  #BD8620
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#FDF4E3' }} />
                <div className={styles.swatchLabel}>
                  Light
                  <br />
                  #FDF4E3
                </div>
              </div>
            </div>

            {/* Secondary Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              SECONDARY
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#2D8A7B' }} />
                <div className={styles.swatchLabel}>
                  Secondary
                  <br />
                  #2D8A7B
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#247568' }} />
                <div className={styles.swatchLabel}>
                  Hover
                  <br />
                  #247568
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E8F5F3' }} />
                <div className={styles.swatchLabel}>
                  Light
                  <br />
                  #E8F5F3
                </div>
              </div>
            </div>

            {/* Backgrounds */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              BACKGROUNDS
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#FDFBF7' }} />
                <div className={styles.swatchLabel}>
                  Page BG
                  <br />
                  #FDFBF7
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#FFFFFF' }} />
                <div className={styles.swatchLabel}>
                  Card BG
                  <br />
                  #FFFFFF
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: 'rgba(0,0,0,0.5)' }} />
                <div className={styles.swatchLabel}>
                  Overlay
                  <br />
                  50% black
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              TEXT
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#1A1A1A' }} />
                <div className={styles.swatchLabel}>
                  Primary
                  <br />
                  #1A1A1A
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#5A5A5A' }} />
                <div className={styles.swatchLabel}>
                  Secondary
                  <br />
                  #5A5A5A
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#8A8A8A' }} />
                <div className={styles.swatchLabel}>
                  Muted
                  <br />
                  #8A8A8A
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div
                  className={styles.swatchColor}
                  style={{ background: '#FFFFFF', border: '1px solid #E5E0D8' }}
                />
                <div className={styles.swatchLabel}>
                  Inverse
                  <br />
                  #FFFFFF
                </div>
              </div>
            </div>

            {/* Borders */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              BORDERS
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E5E0D8' }} />
                <div className={styles.swatchLabel}>
                  Border
                  <br />
                  #E5E0D8
                </div>
              </div>
            </div>

            {/* Status Colors */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#8A8A8A',
                marginBottom: '8px',
                marginTop: '24px',
              }}
            >
              STATUS
            </p>
            <div className={styles.showcaseRow}>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#3D9970' }} />
                <div className={styles.swatchLabel}>
                  Success
                  <br />
                  #3D9970
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#D35649' }} />
                <div className={styles.swatchLabel}>
                  Error
                  <br />
                  #D35649
                </div>
              </div>
              <div className={styles.colorSwatch}>
                <div className={styles.swatchColor} style={{ background: '#E5A732' }} />
                <div className={styles.swatchLabel}>
                  Warning
                  <br />
                  #E5A732
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>Typography</h3>
            <p className={styles.showcaseSubtitle}>Plus Jakarta Sans + Noto Naskh Arabic</p>
            <div className={styles.typographyDemo}>
              <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>Heading 1 — 48px Bold</h1>
              <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Heading 2 — 32px Semibold</h2>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Heading 3 — 24px Semibold</h3>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Heading 4 — 20px Medium</h4>
              <p style={{ fontSize: '1rem' }}>
                Body text — 16px Regular. The quick brown fox jumps over the lazy dog.
              </p>
              <p style={{ fontSize: '0.875rem', color: '#5A5A5A' }}>
                Small text — 14px. Secondary information and captions.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#8A8A8A' }}>
                Caption — 12px. Muted helper text.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>Buttons</h3>
            <p className={styles.showcaseSubtitle}>All button variants and states</p>
            <div className={styles.showcaseRow}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
            <div className={styles.showcaseRow} style={{ marginTop: '16px' }}>
              <Button size="sm">Small</Button>
              <Button size="md">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* Form Elements */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>Form Elements</h3>
            <p className={styles.showcaseSubtitle}>Inputs, selects, and validation states</p>
            <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
              <Input label="Default Input" placeholder="Enter your email" />
              <Input
                label="Input with Error"
                value="invalid@"
                error="Please enter a valid email address"
              />
              <Input label="Input with Success" value="valid@email.com" state="success" />
              <Select
                label="Select Dropdown"
                options={[
                  { value: 'opt1', label: 'Option 1' },
                  { value: 'opt2', label: 'Option 2' },
                  { value: 'opt3', label: 'Option 3' },
                ]}
                value={showcaseSelect}
                onChange={setShowcaseSelect}
              />
              <Checkbox label="I agree to terms and conditions" defaultChecked />
            </div>
          </div>

          {/* Loading Skeleton */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>Loading States</h3>
            <p className={styles.showcaseSubtitle}>Skeleton loading animation</p>
            <div style={{ maxWidth: '300px' }}>
              <SkeletonCard />
            </div>
          </div>

          {/* Tooltip Demo */}
          <div className={styles.showcaseSection}>
            <h3 className={styles.showcaseTitle}>Tooltips</h3>
            <p className={styles.showcaseSubtitle}>Hover for more information</p>
            <div className={styles.showcaseRow}>
              <Tooltip text="This is a tooltip!">
                <Button variant="secondary" size="sm">
                  Hover me
                </Button>
              </Tooltip>
            </div>
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
              <p>
                Your trusted partner for premium real estate in Dubai. Find your dream home today.
              </p>
            </div>
            <div className={styles.footerColumn}>
              <h4>Properties</h4>
              <ul>
                <li>
                  <a href="#">Buy</a>
                </li>
                <li>
                  <a href="#">Rent</a>
                </li>
                <li>
                  <a href="#">Off-Plan</a>
                </li>
                <li>
                  <a href="#">Commercial</a>
                </li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Use</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>© 2024 RushHour. All rights reserved.</p>
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
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Schedule a Call">
        <ModalBody>
          <Input label="Your Name" placeholder="John Doe" />
          <div style={{ marginTop: '16px' }}>
            <Input label="Phone Number" type="tel" placeholder="+971 50 123 4567" />
          </div>
          <div style={{ marginTop: '16px' }}>
            <Select
              label="Preferred Time"
              options={[
                { value: 'morning', label: 'Morning (9AM - 12PM)' },
                { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
                { value: 'evening', label: 'Evening (5PM - 8PM)' },
              ]}
              value={preferredTime}
              onChange={setPreferredTime}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">Schedule Call</Button>
        </ModalFooter>
      </Modal>

      {/* Toast */}
      <Toast open={showToast} onClose={() => setShowToast(false)} variant="success">
        Property added to favorites!
      </Toast>
    </div>
  )
}
