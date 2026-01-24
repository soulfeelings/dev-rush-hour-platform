import { forwardRef, useEffect, useMemo, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Modal.module.scss'
import clsx from 'clsx'
import { Typography } from '../Typography/Typography'

export interface ModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
> {
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

    if (!container) return null

    const modalContent = (
      <AnimatePresence>
        {open && (
          <motion.div
            className={clsx(styles.overlay, { [styles.largeOverlay]: size === 'large' })}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={clsx(styles.modal, { [styles.large]: size === 'large' }, className)}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div ref={ref} {...props}>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
