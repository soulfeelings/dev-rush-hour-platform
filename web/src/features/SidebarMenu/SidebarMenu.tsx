import { Link } from 'react-router-dom'
import { X, ChevronDown } from 'lucide-react'
import styles from './SidebarMenu.module.scss'

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
}


export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
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
            Новости и события
          </a>
          <a href="#" className={styles.navItem}>
            Обучение
          </a>
          <a href="#" className={styles.navItem}>
            Новостройки и застройщики
            <button className={styles.chevronButton} type="button">
              <ChevronDown size={16} />
            </button>
          </a>
          <a href="#" className={styles.navItem}>
            Для агентов
            <button className={styles.chevronButton} type="button">
              <ChevronDown size={16} />
            </button>
          </a>
          <a href="#" className={styles.navItem}>
            Районы
          </a>
          <a href="#" className={styles.navItem}>
            Стоимость и функции
          </a>
          <a href="#" className={styles.navItem}>
            Об RushHour
            <button className={styles.chevronButton} type="button">
              <ChevronDown size={16} />
            </button>
          </a>
        </nav>
      </div>
    </>
  )
}

