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
  const [beds, setBeds] = useState('all')
  const [budget, setBudget] = useState('all')

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
    if (beds !== 'all') params.set('bedrooms', beds)
    if (budget !== 'all') params.set('price', budget)
    navigate(`/catalog?${params.toString()}`)
  }

  const handleContactAgent = () => {
    const phone = '971544313048'
    const bedsLabel = bedroomsOptions.find(opt => opt.value === beds)?.label || beds
    const budgetLabel = priceOptions.find(opt => opt.value === budget)?.label || budget

    const message = `Hello! I'm interested in properties in Dubai. 
Filters: 
- Bedrooms: ${bedsLabel}
- Budget: ${budgetLabel}`

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.selectGroup}>
          <div className={styles.selectWrapper}>
            <Select
              options={bedroomsOptions}
              value={beds}
              onChange={setBeds}
              placeholder={t('filters.bedrooms.placeholder')}
            />
          </div>
          <div className={styles.selectWrapper}>
            <Select
              options={priceOptions}
              value={budget}
              onChange={setBudget}
              placeholder={t('filters.price.placeholder')}
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
  )
}
