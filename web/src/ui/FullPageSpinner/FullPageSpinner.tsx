import styles from './FullPageSpinner.module.scss'

export function FullPageSpinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
    </div>
  )
}
