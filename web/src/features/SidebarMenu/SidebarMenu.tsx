import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import styles from './SidebarMenu.module.scss'

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const { t } = useTranslation()

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlay}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <motion.aside
        className={styles.sidebar}
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose} type="button">
            <X size={24} />
          </button>
          <Link to="/" className={styles.logo} onClick={onClose}>
            Rush<span>Hour</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link to={ROUTES.PROJECTS} className={styles.navItem} onClick={onClose}>
            {t('header.nav.projects')}
          </Link>
          <Link to={ROUTES.APARTMENTS} className={styles.navItem} onClick={onClose}>
            {t('header.nav.apartments')}
          </Link>
          <Link to={ROUTES.ADMIN} className={styles.navItem} onClick={onClose}>
            {t('header.nav.admin')}
          </Link>
        </nav>
      </motion.aside>
    </>
  )
}
