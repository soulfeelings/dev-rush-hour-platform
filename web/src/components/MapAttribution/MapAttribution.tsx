import styles from './MapAttribution.module.scss'

export function MapAttribution() {
  return (
    <p className={styles.attribution}>
      Thanks for the amazing satellite imagery provided by{' '}
      <span className={styles.credits}>
        Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and
        the GIS User Community
      </span>
    </p>
  )
}
