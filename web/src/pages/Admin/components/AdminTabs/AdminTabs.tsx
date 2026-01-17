import styles from './AdminTabs.module.scss'

type Tab = 'developer' | 'project' | 'lot'

type AdminTabsProps = {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'developer' ? styles.active : ''}`}
        onClick={() => onTabChange('developer')}
      >
        Create Developer
      </button>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'project' ? styles.active : ''}`}
        onClick={() => onTabChange('project')}
      >
        Create Project
      </button>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'lot' ? styles.active : ''}`}
        onClick={() => onTabChange('lot')}
      >
        Create Lot
      </button>
    </div>
  )
}
