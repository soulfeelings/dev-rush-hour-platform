import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
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
          <Link to={ROUTES.CATALOG} className={styles.navItem} onClick={onClose}>
            {t('header.nav.catalog')}
          </Link>
          <Link to="/admin" className={styles.navItem} onClick={onClose}>
            {t('header.nav.admin')}
          </Link>
        </nav>
      </div>
    </>
  )
}
