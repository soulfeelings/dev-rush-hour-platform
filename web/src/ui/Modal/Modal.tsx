import { forwardRef, useEffect, type HTMLAttributes } from 'react'
import { X } from 'lucide-react'
import styles from './Modal.module.scss'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title?: string
  showCloseButton?: boolean
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, showCloseButton = true, className, children, ...props }, ref) => {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, onClose])

    if (!open) return null

    const isMinimal = className?.includes('minimal')

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div
          ref={ref}
          className={`${styles.modal} ${className || ''}`}
          onClick={e => e.stopPropagation()}
          {...props}
        >
          {isMinimal ? (
            <>
              {(title || showCloseButton) && (
                <div className={styles.minimalHeader}>
                  {title && <h3 className={styles.minimalTitle}>{title}</h3>}
                  {showCloseButton && (
                    <button className={styles.minimalCloseBtn} onClick={onClose} aria-label="Close">
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}
              {children}
            </>
          ) : (
            <>
              {(title || showCloseButton) && (
                <div className={styles.header}>
                  {title && <h3 className={styles.title}>{title}</h3>}
                  {showCloseButton && (
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}
              {children}
            </>
          )}
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

// Subcomponents
export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`${styles.body} ${className || ''}`} {...props}>
      {children}
    </div>
  )
)

ModalBody.displayName = 'ModalBody'

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`${styles.footer} ${className || ''}`} {...props}>
      {children}
    </div>
  )
)

ModalFooter.displayName = 'ModalFooter'
