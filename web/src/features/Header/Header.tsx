import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../ui/Button'
import SidebarMenu from '../SidebarMenu'
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


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button className={styles.menuBtn} onClick={() => setIsMenuOpen(true)} type="button">
            <IconMenu />
          </button>
          <Link to="/" className={styles.logo}>
            Rush<span>Hour</span>
          </Link>
          <nav className={styles.nav}>
            <Link to="/catalog" className={styles.navLink}>
              Каталог
            </Link>
            <a href="#" className={styles.navLink}>
              Buy
            </a>
            <a href="#" className={styles.navLink}>
              Rent
            </a>
            <a href="#" className={styles.navLink}>
              Off-Plan
            </a>
            <a href="#" className={styles.navLink}>
              Areas
            </a>
          </nav>
          <div className={styles.headerActions}>
            <Button size="sm" className={styles.desktopButton}>
              List Property
            </Button>
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

