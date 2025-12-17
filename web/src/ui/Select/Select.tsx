import { useState, useRef, useEffect } from 'react'
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
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <div
        className={`${styles.select} ${disabled ? styles['select--disabled'] : ''}`}
        ref={selectRef}
      >
        <button
          type="button"
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
        <div className={`${styles.dropdown} ${isOpen ? styles['dropdown--open'] : ''}`}>
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
        </div>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}
