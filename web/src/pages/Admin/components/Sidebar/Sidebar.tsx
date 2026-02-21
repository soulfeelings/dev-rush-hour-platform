import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../../../ui'
import styles from './Sidebar.module.scss'

type Tab =
  | 'projects-list'
  | 'lots-list'
  | 'areas-list'
  | 'cities-list'
  | 'badges-list'
  | 'infrastructures-list'
  | 'developers-list'
  | 'media-list'
  | 'team-list'

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
  can: (entity: string, action: string) => boolean
  isSuperadmin: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  can,
  isSuperadmin,
  isOpen,
  onClose,
}: SidebarProps) {
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
          {(can('cities', 'view') || can('areas', 'view')) && (
            <div className={styles.navSection}>
              {can('cities', 'view') && (
                <button
                  type="button"
                  className={`${styles.navItem} ${activeTab === 'cities-list' ? styles.active : ''}`}
                  onClick={() => onTabChange('cities-list')}
                >
                  <span>Cities</span>
                </button>
              )}
              {can('areas', 'view') && (
                <button
                  type="button"
                  className={`${styles.navItem} ${activeTab === 'areas-list' ? styles.active : ''}`}
                  onClick={() => onTabChange('areas-list')}
                >
                  <span>Areas</span>
                </button>
              )}
            </div>
          )}
          {(can('developers', 'view') || can('projects', 'view') || can('lots', 'view')) && (
            <>
              <hr className={styles.divider} />
              <div className={styles.navSection}>
                {can('developers', 'view') && (
                  <button
                    type="button"
                    className={`${styles.navItem} ${activeTab === 'developers-list' ? styles.active : ''}`}
                    onClick={() => onTabChange('developers-list')}
                  >
                    <span>Developers</span>
                  </button>
                )}
                {can('projects', 'view') && (
                  <button
                    type="button"
                    className={`${styles.navItem} ${activeTab === 'projects-list' ? styles.active : ''}`}
                    onClick={() => onTabChange('projects-list')}
                  >
                    <span>Projects</span>
                  </button>
                )}
                {can('lots', 'view') && (
                  <button
                    type="button"
                    className={`${styles.navItem} ${activeTab === 'lots-list' ? styles.active : ''}`}
                    onClick={() => onTabChange('lots-list')}
                  >
                    <span>Lots</span>
                  </button>
                )}
              </div>
            </>
          )}
          {(can('badges', 'view') || can('infrastructures', 'view') || can('media', 'view')) && (
            <>
              <hr className={styles.divider} />
              <div className={styles.navSection}>
                {can('badges', 'view') && (
                  <button
                    type="button"
                    className={`${styles.navItem} ${activeTab === 'badges-list' ? styles.active : ''}`}
                    onClick={() => onTabChange('badges-list')}
                  >
                    <span>Badges</span>
                  </button>
                )}
                {can('infrastructures', 'view') && (
                  <button
                    type="button"
                    className={`${styles.navItem} ${activeTab === 'infrastructures-list' ? styles.active : ''}`}
                    onClick={() => onTabChange('infrastructures-list')}
                  >
                    <span>Infrastructures</span>
                  </button>
                )}
                {can('media', 'view') && (
                  <button
                    type="button"
                    className={`${styles.navItem} ${activeTab === 'media-list' ? styles.active : ''}`}
                    onClick={() => onTabChange('media-list')}
                  >
                    <span>Media</span>
                  </button>
                )}
              </div>
            </>
          )}
          {isSuperadmin && (
            <>
              <hr className={styles.divider} />
              <div className={styles.navSection}>
                <button
                  type="button"
                  className={`${styles.navItem} ${activeTab === 'team-list' ? styles.active : ''}`}
                  onClick={() => onTabChange('team-list')}
                >
                  <span>Team</span>
                </button>
              </div>
            </>
          )}
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
