import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Search } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import styles from './HeroFilters.module.scss'

export default function HeroFilters() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [location, setLocation] = useState('all')
  const [developer, setDeveloper] = useState('all')
  const [project, setProject] = useState('all')
  const [propertyType, setPropertyType] = useState('all')
  const [beds, setBeds] = useState('all')
  const [budget, setBudget] = useState('all')

  const locationOptions = [{ value: 'dubai', label: t('filters.location.dubai') }]

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

  const bedroomsOptions = [
    { value: 'all', label: t('filters.bedrooms.all') },
    { value: 'studio', label: t('filters.bedrooms.studio') },
    { value: '1', label: t('filters.bedrooms.one') },
    { value: '2', label: t('filters.bedrooms.two') },
    { value: '3', label: t('filters.bedrooms.three') },
    { value: '4+', label: t('filters.bedrooms.fourPlus') },
  ]

  const priceOptions = [
    { value: 'all', label: t('filters.price.all') },
    { value: '0-1m', label: t('filters.price.under1m') },
    { value: '1-2m', label: t('filters.price.1to2m') },
    { value: '2-5m', label: t('filters.price.2to5m') },
    { value: '5m+', label: t('filters.price.5mPlus') },
  ]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location !== 'all') params.set('location', location)
    if (developer !== 'all') params.set('developer', developer)
    if (project !== 'all') params.set('project', project)
    if (propertyType !== 'all') params.set('type', propertyType)
    if (beds !== 'all') params.set('bedrooms', beds)
    if (budget !== 'all') params.set('price', budget)
    navigate(`/catalog?${params.toString()}`)
  }

  const handleContactAgent = () => {
    const phone = '971544313048'
    const locationLabel = locationOptions.find(opt => opt.value === location)?.label || location
    const developerLabel = developerOptions.find(opt => opt.value === developer)?.label || developer
    const projectLabel = projectOptions.find(opt => opt.value === project)?.label || project
    const propertyTypeLabel =
      propertyTypeOptions.find(opt => opt.value === propertyType)?.label || propertyType
    const bedsLabel = bedroomsOptions.find(opt => opt.value === beds)?.label || beds
    const budgetLabel = priceOptions.find(opt => opt.value === budget)?.label || budget

    const message = `Hello! I'm interested in properties in Dubai.
Filters:
- Location: ${locationLabel}
- Developer: ${developerLabel}
- Project: ${projectLabel}
- Property Type: ${propertyTypeLabel}
- Bedrooms: ${bedsLabel}
- Budget: ${budgetLabel}`

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
                fullWidth
                fullHeight
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={developerOptions}
                value={developer}
                onChange={setDeveloper}
                placeholder={t('filters.developer.placeholder')}
                fullWidth
                fullHeight
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={projectOptions}
                value={project}
                onChange={setProject}
                placeholder={t('filters.project.placeholder')}
                fullWidth
                fullHeight
                searchable
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={propertyTypeOptions}
                value={propertyType}
                onChange={setPropertyType}
                placeholder={t('filters.propertyType.placeholder')}
                fullWidth
                fullHeight
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={bedroomsOptions}
                value={beds}
                onChange={setBeds}
                placeholder={t('filters.bedrooms.placeholder')}
                fullWidth
                fullHeight
              />
            </div>
            <div className={styles.selectWrapper}>
              <Select
                options={priceOptions}
                value={budget}
                onChange={setBudget}
                placeholder={t('filters.price.placeholder')}
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
