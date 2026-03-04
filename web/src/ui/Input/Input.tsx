import React, { forwardRef, useId, type InputHTMLAttributes } from 'react'
import styles from './Input.module.scss'

export type InputState = 'default' | 'error' | 'success'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  state?: InputState
  label?: string
  error?: string
  helperText?: React.ReactNode
  sublabel?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ state = 'default', label, sublabel, error, helperText, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || `input-${generatedId}`
    const actualState = error ? 'error' : state

    const inputClassNames = [styles.input, styles[`input--${actualState}`], className]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={styles.formGroup}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
        <input
          ref={ref}
          id={inputId}
          className={inputClassNames}
          onWheel={props.type === 'number' ? e => (e.target as HTMLInputElement).blur() : props.onWheel}
          {...props}
        />
        {error && <span className={styles.errorText}>{error}</span>}
        {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
