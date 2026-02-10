import { Link } from 'react-router-dom'
import { SearchX, ArrowLeft } from 'lucide-react'
import styles from './NotFound.module.scss'

interface NotFoundProps {
  title: string
  message: string
  backTo: string
  backLabel: string
}

export function NotFound({ title, message, backTo, backLabel }: NotFoundProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <SearchX size={40} />
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      <Link to={backTo} className={styles.backLink}>
        <ArrowLeft size={16} />
        {backLabel}
      </Link>
    </div>
  )
}
