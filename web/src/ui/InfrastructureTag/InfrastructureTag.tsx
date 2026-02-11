import { Package } from 'lucide-react'
import { getInfrastructureIcon } from '../../utils/infrastructureIcons'
import styles from './InfrastructureTag.module.scss'

export interface InfrastructureTagProps {
  name: string
  iconName?: string
  size?: 'small' | 'default'
  className?: string
}

export const InfrastructureTag = ({
  name,
  iconName,
  size = 'default',
  className,
}: InfrastructureTagProps) => {
  const icon = getInfrastructureIcon(iconName)

  return (
    <span className={`${styles.tag} ${styles[size]} ${className ?? ''}`}>
      <span className={styles.icon}>{icon || <Package size={11} />}</span>
      <span className={styles.text}>{name}</span>
    </span>
  )
}
