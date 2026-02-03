import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.scss'

export type TextareaState = 'default' | 'error' | 'success'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: TextareaState
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ state = 'default', label, error, helperText, className, id, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id || `textarea-${generatedId}`
    const actualState = error ? 'error' : state

    const textareaClassNames = [styles.textarea, styles[`textarea--${actualState}`], className]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={styles.formGroup}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea ref={ref} id={textareaId} className={textareaClassNames} {...props} />
        {error && <span className={styles.errorText}>{error}</span>}
        {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
