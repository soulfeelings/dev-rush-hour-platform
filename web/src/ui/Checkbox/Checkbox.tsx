import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.scss'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || `checkbox-${generatedId}`

    return (
      <label htmlFor={inputId} className={`${styles.checkbox} ${className || ''}`}>
        <input ref={ref} type="checkbox" id={inputId} className={styles.input} {...props} />
        <span className={styles.checkmark} />
        {label && <span className={styles.label}>{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
