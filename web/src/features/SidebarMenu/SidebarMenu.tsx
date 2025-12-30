import { Link } from 'react-router-dom'
import { X, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './SidebarMenu.module.scss'

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const { t } = useTranslation()

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose} type="button">
            <X size={24} />
          </button>
          <Link to="/" className={styles.logo} onClick={onClose}>
            Rush<span>Hour</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navItem}>
            {t('sidebar.news')}
          </a>
          <a href="#" className={styles.navItem}>
            {t('sidebar.training')}
          </a>
          <a href="#" className={styles.navItem}>
            {t('sidebar.developments')}
            <button className={styles.chevronButton} type="button">
              <ChevronDown size={16} />
            </button>
          </a>
          <a href="#" className={styles.navItem}>
            {t('sidebar.forAgents')}
            <button className={styles.chevronButton} type="button">
              <ChevronDown size={16} />
            </button>
          </a>
          <a href="#" className={styles.navItem}>
            {t('sidebar.areas')}
          </a>
          <a href="#" className={styles.navItem}>
            {t('sidebar.priceAndFeatures')}
          </a>
          <a href="#" className={styles.navItem}>
            {t('sidebar.about')}
            <button className={styles.chevronButton} type="button">
              <ChevronDown size={16} />
            </button>
          </a>
        </nav>
      </div>
    </>
  )
}
