import styles from './FloorPlanTable.module.scss'

interface EmptyCellProps {
  floor: number
  index: number
}

export const EmptyCell = ({ floor, index }: EmptyCellProps) => {
  return <div key={`empty-${floor}-${index}`} className={styles.emptyCell} />
}
