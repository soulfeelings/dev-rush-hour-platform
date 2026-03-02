import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button, type ButtonVariant, type ButtonSize, type ButtonProps } from '../Button'
import styles from './Select.module.scss'
import { Typography } from '../Typography'
import { ChevronUp, X } from 'lucide-react'
import { useDropdownPosition } from '../../hooks/useDropdownPosition'

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
  creatable?: boolean
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
  clearable?: boolean
  defaultValue?: string
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
  creatable = false,
  hideAllInTrigger = false,
  triggerVariant,
  triggerSize,
  triggerIconLeft,
  triggerIconRight,
  triggerSelected = false,
  triggerAlign = 'left',
  hideChevronRight = false,
  clearable = false,
  defaultValue = 'all',
}: SelectProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectingValue, setSelectingValue] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { triggerRef, dropdownRef, dropdownPos, positionCalculated, recalculate } =
    useDropdownPosition(isOpen)
  const selectRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const buttonId = `select-${generatedId}`

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions =
    (searchable || creatable) && searchQuery
      ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : options

  const hasExactMatch = options.some(
    opt => opt.label.toLowerCase() === searchQuery.toLowerCase()
  )
  const showCreateOption = creatable && searchQuery.trim() !== '' && !hasExactMatch

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

  // Focus search input and recalculate position when filtered options change height
  useEffect(() => {
    if (isOpen) {
      if ((searchable || creatable) && searchInputRef.current) {
        if (creatable && value && !selectedOption) {
          setSearchQuery(value)
        }
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      }
    } else {
      setSearchQuery('')
    }
  }, [isOpen, searchable, creatable])

  useEffect(() => {
    if (isOpen) recalculate()
  }, [filteredOptions.length])

  const handleSelect = (optionValue: string) => {
    setSelectingValue(optionValue)
    setTimeout(() => {
      onChange(optionValue)
      setIsOpen(false)
      setSelectingValue(null)
      setSearchQuery('')
    }, 150)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleFreeInput = (inputValue: string) => {
    onChange(inputValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value)
      } else if (creatable && searchQuery.trim()) {
        handleFreeInput(searchQuery.trim())
      }
    }
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(defaultValue)
  }

  const isActive = value !== defaultValue && value !== ''

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
        className={`${styles.select} ${disabled ? styles['select--disabled'] : ''} ${fullWidth ? styles['select--fullWidth'] : ''} ${fullHeight ? styles['select--fullHeight'] : ''} ${isActive ? styles['select--active'] : ''}`}
      >
        <Button
          type="button"
          ref={triggerRef}
          id={buttonId}
          variant={triggerVariant || 'secondary'}
          size={triggerSize || 'md'}
          fullWidth={fullWidth}
          iconLeft={
            clearable && isActive ? (
              <span className={styles.clearIcon} onClick={handleClear}>
                <X size={14} />
              </span>
            ) : (
              triggerIconLeft
            )
          }
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
          className={isActive ? styles.triggerActive : undefined}
        >
          {selectedOption && (!hideAllInTrigger || selectedOption.value !== 'all')
            ? selectedOption.label
            : creatable && value && value !== defaultValue
              ? value
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
                  top: `${dropdownPos.top}px`,
                  left: `${dropdownPos.left}px`,
                  visibility: positionCalculated ? 'visible' : 'hidden',
                }}
              >
                {(searchable || creatable) && (
                  <div className={styles.searchWrapper}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className={styles.searchInput}
                      placeholder={creatable ? t('ui.select.typeOrSearch') : t('ui.select.search')}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className={styles.options}>
                  {showCreateOption && (
                    <div
                      className={`${styles.option} ${styles['option--create']}`}
                      onClick={() => handleFreeInput(searchQuery.trim())}
                    >
                      <Typography variant="body" size="small" weight="regular">
                        {t('ui.select.useValue', { value: searchQuery.trim() })}
                      </Typography>
                    </div>
                  )}
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
                  ) : !showCreateOption ? (
                    <div className={styles.noResults}>{t('ui.select.noResults')}</div>
                  ) : null}
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
