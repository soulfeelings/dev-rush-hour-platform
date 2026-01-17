import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './RightSidebar.module.scss'

type RightSidebarProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function RightSidebar({ isOpen, onClose, title, children }: RightSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className={styles.sidebar}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <button type="button" className={styles.closeButton} onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.content}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
