import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Search } from 'lucide-react'
import { Typography } from '../../../../ui'
import type { NominatimResult } from '../../../../utils/nominatim'
import styles from './OsmAutocomplete.module.scss'

type OsmAutocompleteProps = {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSelect: (result: NominatimResult) => void
  fetchSuggestions: (query: string) => Promise<NominatimResult[]>
  disabled?: boolean
}

export function OsmAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  disabled,
}: OsmAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [positionCalculated, setPositionCalculated] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const calculatePosition = useCallback(() => {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
    setPositionCalculated(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setPositionCalculated(false)
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(calculatePosition))
    window.addEventListener('scroll', calculatePosition, true)
    window.addEventListener('resize', calculatePosition)
    return () => {
      window.removeEventListener('scroll', calculatePosition, true)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [isOpen, calculatePosition])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = useCallback(
    async (query: string) => {
      if (query.length < 2) return
      setLoading(true)
      try {
        const results = await fetchSuggestions(query)
        setSuggestions(results)
        setIsOpen(results.length > 0)
      } catch {
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setLoading(false)
      }
    },
    [fetchSuggestions]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      search(value)
    }
  }

  const handleSelect = (result: NominatimResult) => {
    onSelect(result)
    setSuggestions([])
    setIsOpen(false)
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          className={styles.input}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className={styles.searchButton}
          onClick={() => search(value)}
          disabled={disabled || loading || value.length < 2}
          tabIndex={-1}
        >
          {loading ? <Loader2 className={styles.spinner} size={14} /> : <Search size={14} />}
        </button>
      </div>
      {focused && !isOpen && (
        <Typography variant="body" size="small" className={styles.hint}>
          Press Enter to search
        </Typography>
      )}
      {createPortal(
        <AnimatePresence>
          {isOpen && suggestions.length > 0 && (
            <motion.div
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
              {suggestions.map(r => (
                <div
                  key={r.place_id}
                  className={styles.option}
                  onMouseDown={e => {
                    e.preventDefault()
                    handleSelect(r)
                  }}
                >
                  <span className={styles.optionName}>{r.name}</span>
                  <span className={styles.optionDetail}>{r.display_name}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
