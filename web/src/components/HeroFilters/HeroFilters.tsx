import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Search, MapPin, Building2, Home, Bed, DollarSign } from 'lucide-react'
import { useFilters, type FilterValues } from '../../contexts'
import { ROUTES } from '../../constants/routes'
import { Button } from '../../ui/Button'
import { Select } from '../../ui/Select'
import { BedsBathsSelect } from './BedsBathsSelect'
import { PriceSelect } from './PriceSelect'
import { useSettings } from '../../features/Settings/Settings'
import styles from './HeroFilters.module.scss'
import { HeroFiltersSkeleton } from './HeroFiltersSkeleton'

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
    navigate(`${ROUTES.CATALOG}?${params.toString()}`)
  }

  const handleContactAgent = () => {
    const phone = '971544313048'
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
      t('heroFilters.whatsappMessage.greeting'),
      t('heroFilters.whatsappMessage.filters'),
      t('heroFilters.whatsappMessage.city', { value: cityLabel }),
      t('heroFilters.whatsappMessage.developer', { value: developerLabel }),
      t('heroFilters.whatsappMessage.project', { value: projectLabel }),
      t('heroFilters.whatsappMessage.bedrooms', { value: bedsLabel }),
      t('heroFilters.whatsappMessage.bathrooms', { value: bathsLabel }),
      t('heroFilters.whatsappMessage.price', { value: priceLabel }),
    ].join('\n')

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (isLoading) {
    return <HeroFiltersSkeleton />
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.topRow}>
          <div className={styles.selectGroup}>
            <div className={styles.selectWrapper}>
              <Select
                options={cityOptions}
                value={filters.city || 'all'}
                onChange={value => updateFilter('city', value === 'all' ? null : value)}
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
                value={filters.developer || 'all'}
                onChange={value => updateFilter('developer', value === 'all' ? null : value)}
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
                value={filters.project || 'all'}
                onChange={value => updateFilter('project', value === 'all' ? null : value)}
                placeholder={t('filters.project.placeholder')}
                icon={<Home size={18} />}
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
                icon={<Bed size={18} />}
                fullWidth
                fullHeight
              />
            </div>
            <div className={styles.selectWrapper}>
              <PriceSelect
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onMinPriceChange={value => updateFilter('minPrice', value)}
                onMaxPriceChange={value => updateFilter('maxPrice', value)}
                placeholder={t('filters.price.placeholder')}
                icon={<DollarSign size={18} />}
                fullWidth
                fullHeight
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              onClick={handleSearch}
              className={styles.searchButton}
              iconLeft={<Search size={20} />}
              align="left"
            >
              <span className={styles.buttonText}>{t('filters.search.button')}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleContactAgent}
              className={styles.agentButton}
              iconLeft={<MessageCircle size={20} />}
              align="left"
            >
              <span className={styles.buttonText}>{t('home.hero.contactAgent')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
