import { useState, useRef, useEffect, useCallback } from 'react'

interface DropdownPos {
  top: number
  left: number
  width: number
}

/**
 * Calculates and tracks dropdown position with viewport overflow detection.
 * Automatically flips left/right and up/down when the dropdown would overflow the screen.
 * Repositions on scroll and resize while open.
 */
export function useDropdownPosition(isOpen: boolean) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: 0, left: 0, width: 0 })
  const [positionCalculated, setPositionCalculated] = useState(false)

  const calculate = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const dropdownRect = dropdownRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    let top = triggerRect.bottom + scrollY + 4
    let left = triggerRect.left + scrollX

    const dropdownWidth = dropdownRect.width || 180
    if (left + dropdownWidth > viewportWidth + scrollX) {
      left = viewportWidth + scrollX - dropdownWidth - 8
    }
    if (left < scrollX) {
      left = scrollX + 8
    }

    const dropdownHeight = dropdownRect.height || 240
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = triggerRect.top + scrollY - dropdownHeight - 4
    }

    setDropdownPos({ top, left, width: triggerRect.width })
    setPositionCalculated(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setPositionCalculated(false)
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(calculate))
  }, [isOpen, calculate])

  useEffect(() => {
    if (!isOpen) return

    window.addEventListener('scroll', calculate, true)
    window.addEventListener('resize', calculate)
    return () => {
      window.removeEventListener('scroll', calculate, true)
      window.removeEventListener('resize', calculate)
    }
  }, [isOpen, calculate])

  return { triggerRef, dropdownRef, dropdownPos, positionCalculated, recalculate: calculate }
}
