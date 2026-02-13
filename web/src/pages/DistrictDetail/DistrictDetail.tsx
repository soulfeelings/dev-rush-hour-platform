import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { districts } from '../../data/dubai_districts_data'
import { mockProperties } from '../../data/mockProperties'
import PropertyMap from '../../components/PropertyMap/PropertyMap'
import { ROUTES, getProjectDetailRoute } from '../../constants/routes'
import { getProjectSlug } from '../../utils/project'
import { NotFound } from '../../ui/NotFound'
import styles from './DistrictDetail.module.scss'

export default function DistrictDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const district = districts.find(d => d.id === id)
  const districtProjects = mockProperties.filter(
    p => p.districtId === id && p.status === 'active'
  )

  if (!district) {
    return (
      <NotFound
        title={t('districtDetail.notFound.title')}
        message={t('districtDetail.notFound.description', { id })}
        backTo={ROUTES.AREAS}
        backLabel={t('districtDetail.notFound.back')}
      />
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to={ROUTES.AREAS} className={styles.backLink}>
          {t('districtDetail.back')}
        </Link>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{district.name}</h1>
          <span className={styles.titleAr}>{district.name_ar}</span>
        </div>
        <p className={styles.description}>{district.description}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.mapSection}>
          <PropertyMap projects={districtProjects} showDistrictFilter={false} />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>{t('districtDetail.info')}</h2>

            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.category')}</span>
                <span className={styles.value}>{district.category}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.avgPrice')}</span>
                <span className={styles.value}>
                  {(district.avg_price_aed / 1000000).toFixed(1)}M AED / $
                  {(district.avg_price_usd / 1000).toFixed(0)}K
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.population')}</span>
                <span className={styles.value}>{district.population.toLocaleString()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.area')}</span>
                <span className={styles.value}>
                  {t('districtDetail.areaKm2', { value: district.area_km2 })}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.buildYear')}</span>
                <span className={styles.value}>{district.build_year}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.walkability')}</span>
                <span className={styles.value}>{district.walkability_score}/100</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.investmentGrade')}</span>
                <span className={styles.value}>{district.investment_grade}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>{t('districtDetail.labels.rentalYield')}</span>
                <span className={styles.value}>{district.rental_yield}%</span>
              </div>
            </div>

            <div className={styles.features}>
              <h3>{t('districtDetail.features')}</h3>
              <div className={styles.featuresGrid}>
                {district.features.waterfront && (
                  <span className={styles.feature}>
                    🌊 {t('districtDetail.features.waterfront')}
                  </span>
                )}
                {district.features.beach_access && (
                  <span className={styles.feature}>🏖️ {t('districtDetail.features.beach')}</span>
                )}
                {district.features.park_view && (
                  <span className={styles.feature}>🌳 {t('districtDetail.features.park')}</span>
                )}
                {district.features.city_view && (
                  <span className={styles.feature}>🏙️ {t('districtDetail.features.city')}</span>
                )}
              </div>
            </div>

            <div className={styles.amenities}>
              <h3>{t('districtDetail.infrastructure')}</h3>
              <div className={styles.amenitiesList}>
                {district.amenities.map(amenity => (
                  <span key={amenity} className={styles.amenity}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {district.metro_stations.length > 0 && (
              <div className={styles.metro}>
                <h3>{t('districtDetail.metro')}</h3>
                <ul className={styles.metroList}>
                  {district.metro_stations.map(station => (
                    <li key={station}>{station}</li>
                  ))}
                </ul>
              </div>
            )}

            {district.developers.length > 0 && (
              <div className={styles.developers}>
                <h3>{t('districtDetail.developers')}</h3>
                <div className={styles.developersList}>
                  {district.developers.map(developer => (
                    <span key={developer} className={styles.developer}>
                      {developer}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {districtProjects.length > 0 && (
            <div className={styles.propertiesCard}>
              <h2>{t('districtDetail.properties', { count: districtProjects.length })}</h2>
              <div className={styles.propertiesList}>
                {districtProjects.map(project => (
                  <Link
                    key={project.id}
                    to={getProjectDetailRoute(getProjectSlug(project))}
                    className={styles.propertyCard}
                  >
                    {project.media?.cover?.url && (
                      <img
                        src={project.media.cover.url}
                        alt={project.name}
                        className={styles.propertyImage}
                      />
                    )}
                    <div className={styles.propertyInfo}>
                      <h3 className={styles.propertyTitle}>{project.name}</h3>
                      <p className={styles.propertyLocation}>{project.area?.name}</p>
                      <div className={styles.propertyDetails}>
                        <span className={styles.propertyPrice}>
                          {project.priceFromUs
                            ? `${(project.priceFromUs / 1000000).toFixed(1)}M ${project.currency || ''}`
                            : '—'}
                        </span>
                        {project.sale && (
                          <span className={styles.propertyStatus}>{project.sale}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {districtProjects.length === 0 && (
            <div className={styles.noProperties}>
              <p>{t('districtDetail.noProperties')}</p>
              <Link to={ROUTES.CATALOG} className={styles.catalogLink}>
                {t('districtDetail.viewAll')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
