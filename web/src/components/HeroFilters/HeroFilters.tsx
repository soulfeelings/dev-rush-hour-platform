import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Search, MapPin, Building2, Home, Bed, DollarSign } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import { BedsBathsSelect } from './BedsBathsSelect'
import { PriceSelect } from './PriceSelect'
import styles from './HeroFilters.module.scss'

export default function HeroFilters() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [location, setLocation] = useState('all')
  const [developer, setDeveloper] = useState('all')
  const [project, setProject] = useState('all')
  const [propertyType, setPropertyType] = useState('all')
  const [beds, setBeds] = useState('all')
  const [baths, setBaths] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const locationOptions = [
    { value: 'all', label: t('filters.location.all') },
    { value: 'dubai', label: t('filters.location.dubai') },
  ]

  const developerOptions = [
    { value: 'all', label: t('filters.developer.all') },
    { value: 'emaar', label: 'Emaar' },
    { value: 'damac', label: 'DAMAC' },
    { value: 'nakheel', label: 'Nakheel' },
    { value: 'dubai-properties', label: 'Dubai Properties' },
  ]

  const projectOptions = [
    { value: 'all', label: t('filters.project.all') },
    { value: 'dubai-marina-walk', label: 'Dubai Marina Walk' },
    { value: 'palm-jumeirah-residences', label: 'Palm Jumeirah Residences' },
    { value: 'downtown-views', label: 'Downtown Views' },
  ]

  const propertyTypeOptions = [
    { value: 'all', label: t('filters.propertyType.all') },
    { value: 'apartment', label: t('filters.propertyType.apartment') },
    { value: 'villa', label: t('filters.propertyType.villa') },
    { value: 'townhouse', label: t('filters.propertyType.townhouse') },
    { value: 'penthouse', label: t('filters.propertyType.penthouse') },
    { value: 'duplex', label: t('filters.propertyType.duplex') },
  ]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location !== 'all') params.set('location', location)
    if (developer !== 'all') params.set('developer', developer)
    if (project !== 'all') params.set('project', project)
    if (propertyType !== 'all') params.set('type', propertyType)
    if (beds !== 'all') params.set('bedrooms', beds)
    if (baths !== 'all') params.set('bathrooms', baths)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    navigate(`${ROUTES.CATALOG}?${params.toString()}`)
  }

  const handleContactAgent = () => {
    const phone = '971544313048'
    const locationLabel =
      locationOptions.find(opt => opt.value === location)?.label ||
      t('filters.location.placeholder')
    const developerLabel =
      developerOptions.find(opt => opt.value === developer)?.label ||
      t('filters.developer.placeholder')
    const projectLabel =
      projectOptions.find(opt => opt.value === project)?.label || t('filters.project.placeholder')
    const propertyTypeLabel =
      propertyTypeOptions.find(opt => opt.value === propertyType)?.label ||
      t('filters.propertyType.placeholder')
    const bedsLabel =
      beds === 'all'
        ? t('filters.bedrooms.all')
        : beds === 'studio'
          ? t('filters.bedrooms.studio')
          : beds === '7+'
            ? '7+'
            : `${beds} ${t('filters.bedrooms.one').replace('1 ', '')}`
    const bathsLabel =
      baths === 'all'
        ? t('home.properties.baths')
        : baths === '7+'
          ? '7+'
          : `${baths} ${t('home.properties.baths')}`
    const priceLabel =
      minPrice || maxPrice
        ? `${minPrice || '0'} - ${maxPrice || t('filters.price.any')} AED`
        : t('filters.price.all')

    const message = `Hello! I'm interested in properties in Dubai.
Filters:
- Location: ${locationLabel}
- Developer: ${developerLabel}
- Project: ${projectLabel}
- Property Type: ${propertyTypeLabel}
- Bedrooms: ${bedsLabel}
- Bathrooms: ${bathsLabel}
- Price: ${priceLabel}`

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.topRow}>
          <div className={styles.selectGroup}>
            <div className={styles.selectWrapper}>
              <Select
                options={locationOptions}
                value={location}
                onChange={setLocation}
                placeholder={t('filters.location.placeholder')}
                icon={<MapPin size={18} />}
                fullWidth
                fullHeight
                hideAllInTrigger
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={developerOptions}
                value={developer}
                onChange={setDeveloper}
                placeholder={t('filters.developer.placeholder')}
                icon={<Building2 size={18} />}
                fullWidth
                fullHeight
                searchable
                hideAllInTrigger
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={projectOptions}
                value={project}
                onChange={setProject}
                placeholder={t('filters.project.placeholder')}
                icon={<Home size={18} />}
                fullWidth
                fullHeight
                searchable
                hideAllInTrigger
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={propertyTypeOptions}
                value={propertyType}
                onChange={setPropertyType}
                placeholder={t('filters.propertyType.placeholder')}
                icon={<Home size={18} />}
                fullWidth
                fullHeight
                hideAllInTrigger
              />
            </div>
            <div className={styles.selectWrapper}>
              <BedsBathsSelect
                bedrooms={beds}
                bathrooms={baths}
                onBedroomsChange={setBeds}
                onBathroomsChange={setBaths}
                placeholder={t('filters.bathrooms.placeholder')}
                icon={<Bed size={18} />}
                fullWidth
                fullHeight
              />
            </div>
            <div className={styles.selectWrapper}>
              <PriceSelect
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                placeholder={t('filters.price.placeholder')}
                icon={<DollarSign size={18} />}
                fullWidth
                fullHeight
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button onClick={handleSearch} className={styles.searchButton}>
              <Search size={20} />
              <span className={styles.buttonText}>{t('filters.search.button')}</span>
            </Button>
            <Button variant="secondary" onClick={handleContactAgent} className={styles.agentButton}>
              <MessageCircle size={20} />
              <span className={styles.buttonText}>{t('home.hero.contactAgent')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
