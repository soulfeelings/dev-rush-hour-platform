import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Select.module.scss'

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

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
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectingValue, setSelectingValue] = useState<string | null>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const selectRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const generatedId = useId()
  const buttonId = `select-${generatedId}`

  const selectedOption = options.find(opt => opt.value === value)

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

  // Update position on scroll/resize
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

  const handleSelect = (optionValue: string) => {
    setSelectingValue(optionValue)
    setTimeout(() => {
      onChange(optionValue)
      setIsOpen(false)
      setSelectingValue(null)
    }, 150)
  }

  const handleToggle = () => {
    if (!disabled) {
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
  }

  return (
    <div className={styles.formGroup} ref={selectRef}>
      {label && (
        <label htmlFor={buttonId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={`${styles.select} ${disabled ? styles['select--disabled'] : ''}`}>
        <button
          type="button"
          id={buttonId}
          ref={triggerRef}
          className={`${styles.trigger} ${isOpen ? styles['trigger--open'] : ''} ${error ? styles['trigger--error'] : ''}`}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className={selectedOption ? '' : styles.placeholder}>
            {selectedOption?.label || placeholder}
          </span>
          <span className={styles.arrow}>
            <IconChevronDown />
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
                <div className={styles.options}>
                  {options.map(option => (
                    <div
                      key={option.value}
                      className={`${styles.option} ${
                        value === option.value ? styles['option--selected'] : ''
                      } ${selectingValue === option.value ? styles['option--selecting'] : ''}`}
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
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
