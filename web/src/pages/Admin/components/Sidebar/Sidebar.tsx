import { LogOut } from 'lucide-react'
import { Button } from '../../../../ui'
import styles from './Sidebar.module.scss'

type Tab = 'projects-list' | 'lots-list' | 'areas-list'

type SidebarProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onLogout: () => void
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
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
        </div>
      </nav>
      <div className={styles.footer}>
        <Button
          variant="secondary"
          size="sm"
          onClick={onLogout}
          className={styles.logoutButton}
          fullWidth
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  )
}
