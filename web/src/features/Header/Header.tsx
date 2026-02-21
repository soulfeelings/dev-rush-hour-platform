import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SidebarMenu from '../SidebarMenu'
import { Settings } from '../Settings/Settings'
import { Link } from '../../ui'
import { ROUTES } from '../../constants/routes'
import styles from './Header.module.scss'

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
)

{
  /*
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
*/
}

export default function Header() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isLotDetailPage = location.pathname.startsWith('/lot/')

  return (
    <>
      <header data-testid="header" className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <button
              className={styles.menuBtn}
              onClick={() => {
                if (isLotDetailPage) {
                  navigate(-1)
                  return
                }
                setIsMenuOpen(true)
              }}
              type="button"
              aria-label={isLotDetailPage ? 'Close' : 'Open menu'}
            >
              {isLotDetailPage ? <X size={22} /> : <IconMenu />}
            </button>
            <RouterLink to="/" className={styles.logo}>
              Rush&nbsp;Hour
            </RouterLink>
            <nav className={styles.nav}>
              <Link to={ROUTES.PROJECTS} className={styles.navLink} typographyWeight="semibold">
                {t('header.nav.projects')}
              </Link>
              <Link to={ROUTES.APARTMENTS} className={styles.navLink} typographyWeight="semibold">
                {t('header.nav.apartments')}
              </Link>
              <Link to={ROUTES.ADMIN} className={styles.navLink} typographyWeight="semibold">
                {t('header.nav.admin')}
              </Link>
            </nav>
            <div className={styles.headerActions}>
              {/* Заменяем LanguageSelector на ControlPanel */}
              {/*
              <LanguageSelector />
              <button className={styles.profileBtn} type="button">
                <IconUser />
              </button>
              */}
              <Settings />
            </div>
          </div>
        </div>
      </header>
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
