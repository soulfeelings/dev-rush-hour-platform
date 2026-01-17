import styles from './FloorPlanTable.module.scss'

interface ApartmentHeaderProps {
  index: number
}

export const ApartmentHeader = ({ index }: ApartmentHeaderProps) => {
  return <div className={styles.apartmentHeader}>Apartment {index + 1}</div>
}
