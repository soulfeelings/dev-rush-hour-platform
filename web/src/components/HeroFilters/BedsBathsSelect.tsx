import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronUp, X } from 'lucide-react'
import styles from './BedsBathsSelect.module.scss'

type TriggerSize = 'xs' | 'sm' | 'md' | 'lg'

interface BedsBathsSelectProps {
  bedrooms: string[]
  bathrooms: string[]
  onBedroomsChange: (value: string[]) => void
  onBathroomsChange: (value: string[]) => void
  placeholder?: string
  icon?: React.ReactNode
  fullWidth?: boolean
  fullHeight?: boolean
  size?: TriggerSize
  clearable?: boolean
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
  size = 'md',
  clearable = false,
}: BedsBathsSelectProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const selectRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const buttonId = `beds-baths-${generatedId}`

  const formatBedroomLabel = (value: string) => {
    if (value === 'studio') return t('filters.bedrooms.studio')
    if (value === '7+') return '7+'
    return value
  }

  const formatBathroomLabel = (value: string) => {
    if (value === '7+') return '7+'
    return value
  }

  const getDisplayText = () => {
    if (bedrooms.length === 0 && bathrooms.length === 0) {
      return placeholder
    }
    const parts: string[] = []
    if (bedrooms.length > 0) {
      if (bedrooms.length <= 2) {
        parts.push(bedrooms.map(formatBedroomLabel).join(', '))
      } else {
        parts.push(`${bedrooms.length} beds`)
      }
    }
    if (bathrooms.length > 0) {
      if (bathrooms.length <= 2) {
        parts.push(bathrooms.map(formatBathroomLabel).join(', '))
      } else {
        parts.push(`${bathrooms.length} baths`)
      }
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
    if (bedrooms.includes(value)) {
      onBedroomsChange(bedrooms.filter(v => v !== value))
    } else {
      onBedroomsChange([...bedrooms, value])
    }
  }

  const handleBathroomSelect = (value: string) => {
    if (bathrooms.includes(value)) {
      onBathroomsChange(bathrooms.filter(v => v !== value))
    } else {
      onBathroomsChange([...bathrooms, value])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBedroomsChange([])
    onBathroomsChange([])
  }

  const isActive = bedrooms.length > 0 || bathrooms.length > 0

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
          className={`${styles.trigger} ${styles[`trigger--${size}`]} ${isOpen ? styles['trigger--open'] : ''} ${isActive ? styles['trigger--active'] : ''} ${fullWidth ? styles['trigger--fullWidth'] : ''} ${fullHeight ? styles['trigger--fullHeight'] : ''}`}
          onClick={handleToggle}
        >
          {clearable && isActive ? (
            <span className={styles.clearIcon} onClick={handleClear}>
              <X size={14} />
            </span>
          ) : (
            icon && <span className={styles.icon}>{icon}</span>
          )}
          <span
            className={bedrooms.length === 0 && bathrooms.length === 0 ? styles.placeholder : ''}
          >
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
                          className={`${styles.optionButton} ${bedrooms.includes(option) ? styles['optionButton--selected'] : ''}`}
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
                          className={`${styles.optionButton} ${bathrooms.includes(option) ? styles['optionButton--selected'] : ''}`}
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
