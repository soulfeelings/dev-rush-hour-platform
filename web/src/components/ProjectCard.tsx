import styles from './ProjectCard.module.scss'

interface ProjectCardProps {
  title?: string
  location?: string
  priceFrom?: number
  status?: 'ready' | 'construction' | 'planning'
}

export default function ProjectCard({ title, location, priceFrom, status }: ProjectCardProps) {
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'ready':
        return 'Готов'
      case 'construction':
        return 'Строится'
      case 'planning':
        return 'Планируется'
      default:
        return ''
    }
  }

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'ready':
        return styles.statusReady
      case 'construction':
        return styles.statusConstruction
      case 'planning':
        return styles.statusPlanning
      default:
        return ''
    }
  }

  return (
    <div className={styles.card}>
      {status && (
        <span className={`${styles.status} ${getStatusClass(status)}`}>
          {getStatusLabel(status)}
        </span>
      )}
      <h2 className={styles.title}>{title || 'Название проекта'}</h2>
      <p className={styles.location}>{location || 'Местоположение не указано'}</p>
      {priceFrom !== undefined && (
        <p className={styles.price}>от {priceFrom.toLocaleString('ru-RU')} ₽</p>
      )}
    </div>
  )
}
