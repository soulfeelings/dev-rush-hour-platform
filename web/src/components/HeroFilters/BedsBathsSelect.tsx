import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronUp } from 'lucide-react'
import styles from './BedsBathsSelect.module.scss'

interface BedsBathsSelectProps {
  bedrooms: string
  bathrooms: string
  onBedroomsChange: (value: string) => void
  onBathroomsChange: (value: string) => void
  placeholder?: string
  icon?: React.ReactNode
  fullWidth?: boolean
  fullHeight?: boolean
}

const bedroomOptions = ['studio', '1', '2', '3', '4', '5', '6', '7', '7+']
const bathroomOptions = ['1', '2', '3', '4', '5', '6', '7', '7+']

export function BedsBathsSelect({
  bedrooms,
  bathrooms,
  onBedroomsChange,
  onBathroomsChange,
  placeholder,
  icon,
  fullWidth = false,
  fullHeight = false,
}: BedsBathsSelectProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const selectRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const buttonId = `beds-baths-${generatedId}`

  const getDisplayText = () => {
    if (bedrooms === 'all' && bathrooms === 'all') {
      return placeholder
    }
    const parts: string[] = []
    if (bedrooms !== 'all') {
      const bedLabel =
        bedrooms === 'studio'
          ? t('filters.bedrooms.studio')
          : bedrooms === '7+'
            ? '7+'
            : `${bedrooms} ${t('filters.bedrooms.one').replace('1 ', '')}`
      parts.push(bedLabel)
    }
    if (bathrooms !== 'all') {
      const bathLabel = bathrooms === '7+' ? '7+' : `${bathrooms} ${t('home.properties.baths')}`
      parts.push(bathLabel)
    }
    return parts.join(' • ') || placeholder
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideTrigger =
        selectRef.current && !selectRef.current.contains(event.target as Node)
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)

      if (isOutsideTrigger && isOutsideDropdown) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const updatePos = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }
    }

    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setIsOpen(!isOpen)
  }

  const handleBedroomSelect = (value: string) => {
    onBedroomsChange(value === bedrooms ? 'all' : value)
  }

  const handleBathroomSelect = (value: string) => {
    onBathroomsChange(value === bathrooms ? 'all' : value)
  }

  return (
    <div
      className={`${styles.formGroup} ${fullWidth ? styles['formGroup--fullWidth'] : ''} ${fullHeight ? styles['formGroup--fullHeight'] : ''}`}
      ref={selectRef}
    >
      <div
        className={`${styles.select} ${fullWidth ? styles['select--fullWidth'] : ''} ${fullHeight ? styles['select--fullHeight'] : ''}`}
      >
        <button
          type="button"
          id={buttonId}
          ref={triggerRef}
          className={`${styles.trigger} ${isOpen ? styles['trigger--open'] : ''} ${fullWidth ? styles['trigger--fullWidth'] : ''} ${fullHeight ? styles['trigger--fullHeight'] : ''}`}
          onClick={handleToggle}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={bedrooms === 'all' && bathrooms === 'all' ? styles.placeholder : ''}>
            {getDisplayText()}
          </span>
          <span className={styles.arrow}>
            <ChevronUp size={16} />
          </span>
        </button>

        {createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key={`dropdown-${generatedId}`}
                id={`dropdown-${generatedId}`}
                ref={dropdownRef}
                className={styles.dropdown}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                style={{
                  top: `${dropdownPos.top + 4}px`,
                  left: `${dropdownPos.left}px`,
                  width: `${dropdownPos.width}px`,
                }}
              >
                <div className={styles.content}>
                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>{t('filters.bedrooms.all')}</div>
                    <div className={styles.optionsRow}>
                      {bedroomOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          className={`${styles.optionButton} ${bedrooms === option ? styles['optionButton--selected'] : ''}`}
                          onClick={() => handleBedroomSelect(option)}
                        >
                          {option === 'studio'
                            ? t('filters.bedrooms.studio')
                            : option === '7+'
                              ? '7+'
                              : option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>{t('filters.bathrooms.all')}</div>
                    <div className={styles.optionsRow}>
                      {bathroomOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          className={`${styles.optionButton} ${bathrooms === option ? styles['optionButton--selected'] : ''}`}
                          onClick={() => handleBathroomSelect(option)}
                        >
                          {option === '7+' ? '7+' : option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  )
}
