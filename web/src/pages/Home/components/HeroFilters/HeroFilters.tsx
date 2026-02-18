import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGetFilterOptions } from '../../../../api/generated/rushHourRealEstatePlatformAPI'
import { ROUTES } from '../../../../constants/routes'
import { Button } from '../../../../ui/Button'
import { Select } from '../../../../ui/Select'
import { BedsBathsSelect } from '../../../../components/Filters/BedsBathsSelect/BedsBathsSelect'
import { PriceSelect } from '../../../../components/Filters/PriceSelect/PriceSelect'
import { RoiSelect } from '../../../../components/Filters/RoiSelect/RoiSelect'
import { useSettings } from '../../../../features/Settings/Settings'
import { openWhatsApp } from '../../../../services/whatsapp'
import styles from './HeroFilters.module.scss'
import { HeroFiltersSkeleton } from './HeroFiltersSkeleton'

const _forceSkeleton = false

export default function HeroFilters() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currency } = useSettings()

  const { data: options, isLoading } = useGetFilterOptions()

  const [city, setCity] = useState<string | null>(null)
  const [developer, setDeveloper] = useState<string | null>(null)
  const [project, setProject] = useState<string | null>(null)
  const [bedrooms, setBedrooms] = useState<string[]>([])
  const [bathrooms, setBathrooms] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRoi, setMinRoi] = useState('')
  const [maxRoi, setMaxRoi] = useState('')

  // Prepare options with "all" option
  const cityOptions = options?.cities
    ? [
      { value: 'all', label: t('filters.location.all') },
      ...options.cities.map(c => ({ value: c.value, label: c.label })),
    ]
    : [{ value: 'all', label: t('filters.location.all') }]

  const developerOptions = options?.developers
    ? [
      { value: 'all', label: t('filters.developer.all') },
      ...options.developers.map(d => ({ value: d.value || '', label: d.label || '' })),
    ]
    : [{ value: 'all', label: t('filters.developer.all') }]

  const projectOptions = options?.projects
    ? [
      { value: 'all', label: t('filters.project.all') },
      ...options.projects.map(p => ({ value: p.value || '', label: p.label || '' })),
    ]
    : [{ value: 'all', label: t('filters.project.all') }]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (developer) params.set('developer', developer)
    if (project) params.set('project', project)
    if (bedrooms.length > 0) params.set('bedrooms', bedrooms.join(','))
    if (bathrooms.length > 0) params.set('bathrooms', bathrooms.join(','))
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minRoi) params.set('minRoi', minRoi)
    if (maxRoi) params.set('maxRoi', maxRoi)
    const query = params.toString()
    navigate(`${ROUTES.PROJECTS}${query ? `?${query}` : ''}`)
  }

  const handleContactAgent = () => {
    const cityLabel =
      cityOptions.find(opt => opt.value === (city || 'all'))?.label ||
      t('filters.location.placeholder')
    const developerLabel =
      developerOptions.find(opt => opt.value === (developer || 'all'))?.label ||
      t('filters.developer.placeholder')
    const projectLabel =
      projectOptions.find(opt => opt.value === (project || 'all'))?.label ||
      t('filters.project.placeholder')
    const bedsLabel =
      bedrooms.length === 0
        ? t('filters.bedrooms.all')
        : bedrooms.includes('studio')
          ? t('filters.bedrooms.studio')
          : `${bedrooms.join(', ')} ${t('filters.bedrooms.one').replace('1 ', '')}`
    const bathsLabel =
      bathrooms.length === 0
        ? t('home.properties.baths')
        : `${bathrooms.join(', ')} ${t('home.properties.baths')}`
    const priceLabel =
      minPrice || maxPrice
        ? `${minPrice || '0'} - ${maxPrice || t('filters.price.any')} ${currency}`
        : t('filters.price.all')

    const message = [
      "Hello! I'm interested in properties in Dubai.",
      'Filters:',
      `- City: ${cityLabel}`,
      `- Developer: ${developerLabel}`,
      `- Project: ${projectLabel}`,
      `- Bedrooms: ${bedsLabel}`,
      `- Bathrooms: ${bathsLabel}`,
      `- Price: ${priceLabel}`,
      `- ROI: ${minRoi || maxRoi ? `${minRoi || '0'}% - ${maxRoi || t('filters.roi.any')}` : t('filters.roi.all')}`,
    ].join('\n')

    openWhatsApp(message)
  }

  if (isLoading || _forceSkeleton) {
    return <HeroFiltersSkeleton />
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterGrid}>
        <div className={styles.selectWrapper}>
          <Select
            options={cityOptions}
            value={city || 'all'}
            onChange={value => {
              setCity(value === 'all' ? null : value)
              setProject(null)
            }}
            placeholder={t('filters.location.placeholder')}
            fullWidth
            fullHeight
            hideAllInTrigger
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            options={developerOptions}
            value={developer || 'all'}
            onChange={value => {
              setDeveloper(value === 'all' ? null : value)
              setProject(null)
            }}
            placeholder={t('filters.developer.placeholder')}
            fullWidth
            fullHeight
            searchable
            hideAllInTrigger
          />
        </div>
        <div className={styles.selectWrapper}>
          <BedsBathsSelect
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            onBedroomsChange={setBedrooms}
            onBathroomsChange={setBathrooms}
            placeholder={t('filters.bathrooms.placeholder')}
            fullWidth
            fullHeight
          />
        </div>
        <Button
          onClick={handleSearch}
          className={styles.searchButton}
        >
          {t('filters.search.button')}
        </Button>

        <div className={styles.selectWrapper}>
          <Select
            options={projectOptions}
            value={project || 'all'}
            onChange={value => setProject(value === 'all' ? null : value)}
            placeholder={t('filters.project.placeholder')}
            fullWidth
            fullHeight
            searchable
            hideAllInTrigger
          />
        </div>
        <div className={styles.selectWrapper}>
          <PriceSelect
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            placeholder={t('filters.price.placeholder')}
            fullWidth
            fullHeight
          />
        </div>
        <div className={styles.selectWrapper}>
          <RoiSelect
            minRoi={minRoi}
            maxRoi={maxRoi}
            onMinRoiChange={setMinRoi}
            onMaxRoiChange={setMaxRoi}
            placeholder={t('filters.roi.placeholder')}
            fullWidth
            fullHeight
          />
        </div>
        <button
          className={styles.contactButton}
          onClick={handleContactAgent}
        >
          {t('home.hero.contactAgent')}
        </button>
      </div>
    </div>
  )
}
