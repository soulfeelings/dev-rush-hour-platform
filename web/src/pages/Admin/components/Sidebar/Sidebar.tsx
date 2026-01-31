import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../../../ui'
import styles from './Sidebar.module.scss'

type Tab = 'projects-list' | 'lots-list' | 'areas-list' | 'cities-list' | 'badges-list'

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ activeTab, onTabChange, onLogout, isOpen, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
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
          x: isMobile ? (isOpen ? 0 : '-100%') : 0,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Panel</h1>
        </div>
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'projects-list' ? styles.active : ''}`}
              onClick={() => onTabChange('projects-list')}
            >
              <span>Projects</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'lots-list' ? styles.active : ''}`}
              onClick={() => onTabChange('lots-list')}
            >
              <span>Lots</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'areas-list' ? styles.active : ''}`}
              onClick={() => onTabChange('areas-list')}
            >
              <span>Areas</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'cities-list' ? styles.active : ''}`}
              onClick={() => onTabChange('cities-list')}
            >
              <span>Cities</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'badges-list' ? styles.active : ''}`}
              onClick={() => onTabChange('badges-list')}
            >
              <span>Badges</span>
            </button>
          </div>
        </nav>
        <div className={styles.footer}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onLogout()
              onClose?.()
            }}
            className={styles.logoutButton}
            iconLeft={<LogOut size={16} />}
            fullWidth
          >
            Logout
          </Button>
        </div>
      </motion.aside>
    </>
  )
}
