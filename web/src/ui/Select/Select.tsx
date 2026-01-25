import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button, type ButtonVariant, type ButtonSize, type ButtonProps } from '../Button'
import styles from './Select.module.scss'
import { Typography } from '../Typography'
import { ChevronUp } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
  fullHeight?: boolean
  searchable?: boolean
  hideAllInTrigger?: boolean
  triggerVariant?: ButtonVariant
  triggerSize?: ButtonSize
  triggerIconLeft?: React.ReactNode
  triggerIconRight?: React.ReactNode
  triggerSelected?: boolean
  triggerFullWidth?: boolean
  triggerFullHeight?: boolean
  triggerAlign?: ButtonProps['align']
  hideChevronRight?: boolean
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled = false,
  fullWidth = false,
  fullHeight = false,
  searchable = false,
  hideAllInTrigger = false,
  triggerVariant,
  triggerSize,
  triggerIconLeft,
  triggerIconRight,
  triggerSelected = false,
  triggerAlign = 'left',
  hideChevronRight = false,
}: SelectProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectingValue, setSelectingValue] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const selectRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const buttonId = `select-${generatedId}`

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions =
    searchable && searchQuery
      ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : options

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
      })
      if (searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      }
    } else {
      setSearchQuery('')
    }
  }, [isOpen, searchable])

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return

    const updatePos = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
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

  const handleSelect = (optionValue: string) => {
    setSelectingValue(optionValue)
    setTimeout(() => {
      // Если кликнули на уже выбранное значение - сбрасываем выбор
      onChange(value === optionValue ? '' : optionValue)
      setIsOpen(false)
      setSelectingValue(null)
      setSearchQuery('')
    }, 150)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      e.preventDefault()
      handleSelect(filteredOptions[0].value)
    }
  }

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        })
      }
      setIsOpen(!isOpen)
    }
  }

  return (
    <div
      className={`${styles.formGroup} ${fullWidth ? styles['formGroup--fullWidth'] : ''} ${fullHeight ? styles['formGroup--fullHeight'] : ''}`}
      ref={selectRef}
    >
      {label && (
        <label htmlFor={buttonId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={`${styles.select} ${disabled ? styles['select--disabled'] : ''} ${fullWidth ? styles['select--fullWidth'] : ''} ${fullHeight ? styles['select--fullHeight'] : ''}`}
      >
        <Button
          ref={triggerRef}
          id={buttonId}
          variant={triggerVariant || 'secondary'}
          size={triggerSize || 'md'}
          fullWidth={fullWidth}
          iconLeft={triggerIconLeft}
          iconRight={
            !hideChevronRight ? (
              <ChevronUp
                size={16}
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out',
                }}
              />
            ) : (
              triggerIconRight
            )
          }
          selected={triggerSelected || (isOpen && triggerVariant === 'primary')}
          onClick={handleToggle}
          disabled={disabled}
          align={triggerAlign}
          style={fullHeight ? { height: '100%' } : undefined}
        >
          {selectedOption && (!hideAllInTrigger || selectedOption.value !== 'all')
            ? selectedOption.label
            : placeholder}
        </Button>

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
                }}
              >
                {searchable && (
                  <div className={styles.searchWrapper}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className={styles.searchInput}
                      placeholder={t('ui.select.search')}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className={styles.options}>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map(option => (
                      <div
                        key={option.value}
                        className={`${styles.option} ${
                          value === option.value ? styles['option--selected'] : ''
                        } ${selectingValue === option.value ? styles['option--selecting'] : ''}`}
                        onClick={() => handleSelect(option.value)}
                      >
                        <Typography variant="body" size="small" weight="regular">
                          {option.label}
                        </Typography>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noResults}>{t('ui.select.noResults')}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}
