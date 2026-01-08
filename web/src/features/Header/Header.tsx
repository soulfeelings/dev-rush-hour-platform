import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SidebarMenu from '../SidebarMenu'
import { Select } from '../../ui'
import styles from './Header.module.scss'

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
)

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const languageOptions = [{ value: 'en', label: 'EN' }]

function LanguageSelector() {
  const { i18n } = useTranslation()

  return (
    <Select
      options={languageOptions}
      value={i18n.language}
      onChange={lang => i18n.changeLanguage(lang)}
      icon={<IconGlobe />}
    />
  )
}

export default function Header() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header data-testid="header" className={styles.header}>
        <div className={styles.headerInner}>
          <button className={styles.menuBtn} onClick={() => setIsMenuOpen(true)} type="button">
            <IconMenu />
          </button>
          <Link to="/" className={styles.logo}>
            Rush<span>Hour</span>
          </Link>
          <nav className={styles.nav}>
            <Link to="/catalog" className={styles.navLink}>
              {t('header.nav.catalog')}
            </Link>
            <Link to="/design-demo" className={styles.navLink}>
              {t('header.nav.designDemo')}
            </Link>
            <Link to="/admin" className={styles.navLink}>
              {t('header.nav.admin')}
            </Link>
          </nav>
          <div className={styles.headerActions}>
            <LanguageSelector />
            <button className={styles.profileBtn} type="button">
              <IconUser />
            </button>
          </div>
        </div>
      </header>
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
