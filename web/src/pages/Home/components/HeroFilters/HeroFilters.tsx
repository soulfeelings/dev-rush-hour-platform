import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useFilters, type FilterValues } from '../../../../contexts'
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
  const { filters, options, isLoading, updateFilter, getFilteredProjects } = useFilters()

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
      ...getFilteredProjects().map(p => ({ value: p.value || '', label: p.label || '' })),
    ]
    : [{ value: 'all', label: t('filters.project.all') }]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.city) params.set('city', filters.city)
    if (filters.area) params.set('area', filters.area)
    if (filters.developer) params.set('developer', filters.developer)
    if (filters.project) params.set('project', filters.project)
    if (filters.bedrooms.length > 0) params.set('bedrooms', filters.bedrooms.join(','))
    if (filters.bathrooms.length > 0) params.set('bathrooms', filters.bathrooms.join(','))
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.minRoi) params.set('minRoi', filters.minRoi)
    if (filters.maxRoi) params.set('maxRoi', filters.maxRoi)
    navigate(`${ROUTES.CATALOG}?${params.toString()}`)
  }

  const handleContactAgent = () => {
    const cityLabel =
      cityOptions.find(opt => opt.value === (filters.city || 'all'))?.label ||
      t('filters.location.placeholder')
    const developerLabel =
      developerOptions.find(opt => opt.value === (filters.developer || 'all'))?.label ||
      t('filters.developer.placeholder')
    const projectLabel =
      projectOptions.find(opt => opt.value === (filters.project || 'all'))?.label ||
      t('filters.project.placeholder')
    const bedsLabel =
      filters.bedrooms.length === 0
        ? t('filters.bedrooms.all')
        : filters.bedrooms.includes('studio')
          ? t('filters.bedrooms.studio')
          : `${filters.bedrooms.join(', ')} ${t('filters.bedrooms.one').replace('1 ', '')}`
    const bathsLabel =
      filters.bathrooms.length === 0
        ? t('home.properties.baths')
        : `${filters.bathrooms.join(', ')} ${t('home.properties.baths')}`
    const priceLabel =
      filters.minPrice || filters.maxPrice
        ? `${filters.minPrice || '0'} - ${filters.maxPrice || t('filters.price.any')} ${currency}`
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
      `- ROI: ${filters.minRoi || filters.maxRoi ? `${filters.minRoi || '0'}% - ${filters.maxRoi || t('filters.roi.any')}` : t('filters.roi.all')}`,
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
            value={filters.city || 'all'}
            onChange={value => updateFilter('city', value === 'all' ? null : value)}
            placeholder={t('filters.location.placeholder')}
            fullWidth
            fullHeight
            hideAllInTrigger
          />
        </div>
        <div className={styles.selectWrapper}>
          <Select
            options={developerOptions}
            value={filters.developer || 'all'}
            onChange={value => updateFilter('developer', value === 'all' ? null : value)}
            placeholder={t('filters.developer.placeholder')}
            fullWidth
            fullHeight
            searchable
            hideAllInTrigger
          />
        </div>
        <div className={styles.selectWrapper}>
          <BedsBathsSelect
            bedrooms={filters.bedrooms}
            bathrooms={filters.bathrooms}
            onBedroomsChange={value =>
              updateFilter('bedrooms', value as FilterValues['bedrooms'])
            }
            onBathroomsChange={value =>
              updateFilter('bathrooms', value as FilterValues['bathrooms'])
            }
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
            value={filters.project || 'all'}
            onChange={value => updateFilter('project', value === 'all' ? null : value)}
            placeholder={t('filters.project.placeholder')}
            fullWidth
            fullHeight
            searchable
            hideAllInTrigger
          />
        </div>
        <div className={styles.selectWrapper}>
          <PriceSelect
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onMinPriceChange={value => updateFilter('minPrice', value)}
            onMaxPriceChange={value => updateFilter('maxPrice', value)}
            placeholder={t('filters.price.placeholder')}
            fullWidth
            fullHeight
          />
        </div>
        <div className={styles.selectWrapper}>
          <RoiSelect
            minRoi={filters.minRoi}
            maxRoi={filters.maxRoi}
            onMinRoiChange={value => updateFilter('minRoi', value)}
            onMaxRoiChange={value => updateFilter('maxRoi', value)}
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
