import styles from './FloorPlanTable.module.scss'

interface FloorLabelProps {
  floor: number
}

export const FloorLabel = ({ floor }: FloorLabelProps) => {
  return <div className={styles.floorLabel}>{floor}</div>
}
