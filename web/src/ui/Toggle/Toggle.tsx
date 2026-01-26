import { type ReactNode, useRef, useEffect, useState } from 'react'
import styles from './Toggle.module.scss'

export interface ToggleOption<T = string> {
  value: T
  label: ReactNode
}

export interface ToggleProps<T = string> {
  options: ToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function Toggle<T = string>({ options, value, onChange, className }: ToggleProps<T>) {
  const activeIndex = options.findIndex(option => option.value === value)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState<{ width: number; left: number }>({
    width: 0,
    left: 0,
  })

  useEffect(() => {
    if (activeIndex >= 0 && buttonRefs.current[activeIndex]) {
      const activeButton = buttonRefs.current[activeIndex]
      const toggleContainer = activeButton?.parentElement
      if (toggleContainer) {
        const containerRect = toggleContainer.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        setIndicatorStyle({
          width: buttonRect.width,
          left: buttonRect.left - containerRect.left,
        })
      }
    }
  }, [activeIndex, options])

  return (
    <div className={`${styles.toggle} ${className || ''}`}>
      <div className={styles.indicator} style={indicatorStyle} />
      {options.map((option, index) => (
        <button
          key={String(option.value)}
          ref={el => {
            buttonRefs.current[index] = el
          }}
          className={`${styles.toggleButton} ${value === option.value ? styles.active : ''}`}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
