import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronUp, X } from 'lucide-react'
import { useSettings } from '../../../features/Settings/Settings'
import { useDropdownPosition } from '../../../hooks/useDropdownPosition'
import styles from './PriceSelect.module.scss'

type TriggerSize = 'xs' | 'sm' | 'md' | 'lg'

interface PriceOption {
  value: string
  label: string
}

function generatePriceOptions(): PriceOption[] {
  const options: PriceOption[] = []
  const push = (v: number) =>
    options.push({ value: String(v), label: v.toLocaleString('en-US') })
  for (let v = 300_000; v <= 3_000_000; v += 100_000) push(v)
  for (let v = 3_250_000; v <= 5_000_000; v += 250_000) push(v)
  for (let v = 6_000_000; v <= 50_000_000; v += 1_000_000) push(v)
  return options
}

const PRICE_OPTIONS = generatePriceOptions()

function filterOptions(options: PriceOption[], query: string): PriceOption[] {
  const digits = query.replace(/\D/g, '')
  if (!digits) return options
  return options.filter(opt => opt.value.includes(digits))
}

interface PriceSelectProps {
  minPrice: string
  maxPrice: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  placeholder?: string
  icon?: React.ReactNode
  fullWidth?: boolean
  fullHeight?: boolean
  size?: TriggerSize
  clearable?: boolean
}

export function PriceSelect({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  placeholder: placeholderProp,
  icon,
  fullWidth = false,
  fullHeight = false,
  size = 'md',
  clearable = false,
}: PriceSelectProps) {
  const { t } = useTranslation()
  const { currency } = useSettings()
  const placeholder = placeholderProp || `Price (${currency})`
  const [isOpen, setIsOpen] = useState(false)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice)
  const { triggerRef, dropdownRef, dropdownPos, positionCalculated } = useDropdownPosition(isOpen)
  const selectRef = useRef<HTMLDivElement>(null)
  const minInputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const buttonId = `price-${generatedId}`

  const filteredMinOptions = filterOptions(PRICE_OPTIONS, localMinPrice)
  const filteredMaxOptions = filterOptions(PRICE_OPTIONS, localMaxPrice)

  const handleReset = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    onMinPriceChange('')
    onMaxPriceChange('')
    setIsOpen(false)
  }

  const handleDone = () => {
    onMinPriceChange(localMinPrice)
    onMaxPriceChange(localMaxPrice)
    setIsOpen(false)
  }

  useEffect(() => {
    setLocalMinPrice(minPrice)
    setLocalMaxPrice(maxPrice)
  }, [minPrice, maxPrice])

  const getDisplayText = () => {
    if (!minPrice && !maxPrice) {
      return placeholder
    }
    const parts: string[] = []
    if (minPrice) {
      parts.push(`${minPrice} ${currency}`)
    }
    if (maxPrice) {
      parts.push(`${maxPrice} ${currency}`)
    }
    return parts.join(' - ') || placeholder
  }

  useEffect(() => {
    const handleCancel = () => {
      setLocalMinPrice(minPrice)
      setLocalMaxPrice(maxPrice)
      setIsOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideTrigger =
        selectRef.current && !selectRef.current.contains(event.target as Node)
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)

      if (isOutsideTrigger && isOutsideDropdown) {
        handleCancel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [minPrice, maxPrice])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        minInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalMinPrice('')
    setLocalMaxPrice('')
    onMinPriceChange('')
    onMaxPriceChange('')
  }

  const isActive = minPrice !== '' || maxPrice !== ''

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
          <span className={!minPrice && !maxPrice ? styles.placeholder : ''}>
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
                  top: `${dropdownPos.top}px`,
                  left: `${dropdownPos.left}px`,
                  width: `${dropdownPos.width}px`,
                  visibility: positionCalculated ? 'visible' : 'hidden',
                }}
              >
                <div className={styles.content}>
                  <div className={styles.inputsRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>{t('filters.price.minimum')}</label>
                      <input
                        ref={minInputRef}
                        type="text"
                        className={styles.input}
                        placeholder="0"
                        value={localMinPrice}
                        onChange={e => setLocalMinPrice(e.target.value)}
                      />
                      <div className={styles.suggestions}>
                        {filteredMinOptions.map(opt => (
                          <div
                            key={opt.value}
                            className={`${styles.suggestionItem} ${localMinPrice === opt.value ? styles['suggestionItem--selected'] : ''}`}
                            onMouseDown={e => {
                              e.preventDefault()
                              setLocalMinPrice(opt.value)
                            }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>{t('filters.price.maximum')}</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder={t('filters.price.any')}
                        value={localMaxPrice}
                        onChange={e => setLocalMaxPrice(e.target.value)}
                      />
                      <div className={styles.suggestions}>
                        {filteredMaxOptions.map(opt => (
                          <div
                            key={opt.value}
                            className={`${styles.suggestionItem} ${localMaxPrice === opt.value ? styles['suggestionItem--selected'] : ''}`}
                            onMouseDown={e => {
                              e.preventDefault()
                              setLocalMaxPrice(opt.value)
                            }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button type="button" className={styles.resetButton} onClick={handleReset}>
                      {t('filters.price.reset')}
                    </button>
                    <button type="button" className={styles.doneButton} onClick={handleDone}>
                      {t('filters.price.done')}
                    </button>
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
