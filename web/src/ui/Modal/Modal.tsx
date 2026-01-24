import { forwardRef, useEffect, useMemo, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import styles from './Modal.module.scss'
import clsx from 'clsx'
import { Typography } from '../Typography/Typography'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  title?: string
  showCloseButton?: boolean
  size?: 'compact' | 'large'
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, className, size = 'compact', children, ...props }, ref) => {
    const container = useMemo(() => {
      if (typeof document !== 'undefined') {
        return document.body
      }
      return null
    }, [])

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

    if (!open || !container) return null

    const modalContent = (
      <div
        className={clsx(styles.overlay, { [styles.largeOverlay]: size === 'large' })}
        onClick={onClose}
      >
        <div
          ref={ref}
          className={clsx(styles.modal, { [styles.large]: size === 'large' }, className)}
          onClick={e => e.stopPropagation()}
          {...props}
        >
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={12} />
          </button>
          <div className={styles.header}>
            <Typography variant="h1" size="large">
              {title}
            </Typography>
          </div>
          {children}
        </div>
      </div>
    )

    return createPortal(modalContent, container)
  }
)

Modal.displayName = 'Modal'

export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  )
)

ModalBody.displayName = 'ModalBody'

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.footer, className)} {...props}>
      {children}
    </div>
  )
)

ModalFooter.displayName = 'ModalFooter'
