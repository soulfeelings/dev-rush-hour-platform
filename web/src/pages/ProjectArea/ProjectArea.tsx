import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PropertyMap from '../../components/PropertyMap/PropertyMap'
import { mockProperties } from '../../data/mockProperties'
import { districts } from '../../data/dubai_districts_data'
import { getAreaDetailRoute } from '../../constants/routes'
import styles from './ProjectArea.module.scss'

export default function ProjectArea() {
  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          {t('projectArea.back')}
        </Link>
        <h1 className={styles.title}>{t('projectArea.title')}</h1>
        <p className={styles.subtitle}>{t('projectArea.subtitle')}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.mapSection}>
          <PropertyMap projects={mockProperties} showDistrictFilter={true} />
        </div>

        <div className={styles.districtsList}>
          <h2 className={styles.listTitle}>{t('projectArea.allDistricts')}</h2>
          <div className={styles.districtsGrid}>
            {districts.map(district => {
              const propertyCount =
                mockProperties.filter(p => p.districtId === district.id).length || 0

              return (
                <Link
                  key={district.id}
                  to={getAreaDetailRoute(district.id)}
                  className={styles.districtCard}
                  style={{ borderInlineStartColor: district.color }}
                >
                  <div className={styles.districtHeader}>
                    <h3 className={styles.districtName}>{district.name}</h3>
                    <span className={styles.districtNameAr}>{district.name_ar}</span>
                  </div>

                  <p className={styles.districtDescription}>{district.description}</p>

                  <div className={styles.districtStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>
                        {t('projectArea.stats.propertiesOnSite')}
                      </span>
                      <span className={styles.statValue}>{propertyCount}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t('projectArea.stats.avgPrice')}</span>
                      <span className={styles.statValue}>
                        {(district.avg_price_aed / 1000000).toFixed(1)}M AED
                      </span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>{t('projectArea.stats.category')}</span>
                      <span className={styles.statValue}>{district.category}</span>
                    </div>
                  </div>

                  <div className={styles.districtTags}>
                    {district.tags.slice(0, 3).map(tag => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
