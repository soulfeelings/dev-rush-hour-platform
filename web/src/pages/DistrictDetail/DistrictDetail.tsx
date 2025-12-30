import { useParams, Link } from 'react-router-dom'
import { districts } from '../../data/dubai_districts_data'
import { mockProperties } from '../../data/mockProperties'
import PropertyMap from '../../components/PropertyMap/PropertyMap'
import styles from './DistrictDetail.module.scss'

export default function DistrictDetail() {
  const { id } = useParams<{ id: string }>()
  const district = districts.find(d => d.id === id)
  const districtProperties = mockProperties.filter(p => p.districtId === id)

  if (!district) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Район не найден</h1>
          <p>Район с ID "{id}" не существует.</p>
          <Link to="/areas" className={styles.backLink}>
            Вернуться к списку районов
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/areas" className={styles.backLink}>
          ← Назад к районам
        </Link>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{district.name}</h1>
          <span className={styles.titleAr}>{district.name_ar}</span>
        </div>
        <p className={styles.description}>{district.description}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.mapSection}>
          <PropertyMap properties={districtProperties} showDistrictFilter={false} />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>Информация о районе</h2>

            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Категория:</span>
                <span className={styles.value}>{district.category}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Средняя цена:</span>
                <span className={styles.value}>
                  {(district.avg_price_aed / 1000000).toFixed(1)}M AED / $
                  {(district.avg_price_usd / 1000).toFixed(0)}K
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Население:</span>
                <span className={styles.value}>{district.population.toLocaleString()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Площадь:</span>
                <span className={styles.value}>{district.area_km2} км²</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Год застройки:</span>
                <span className={styles.value}>{district.build_year}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Рейтинг пешеходности:</span>
                <span className={styles.value}>{district.walkability_score}/100</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Инвестиционный рейтинг:</span>
                <span className={styles.value}>{district.investment_grade}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Доходность от аренды:</span>
                <span className={styles.value}>{district.rental_yield}%</span>
              </div>
            </div>

            <div className={styles.features}>
              <h3>Особенности</h3>
              <div className={styles.featuresGrid}>
                {district.features.waterfront && (
                  <span className={styles.feature}>🌊 Набережная</span>
                )}
                {district.features.beach_access && (
                  <span className={styles.feature}>🏖️ Доступ к пляжу</span>
                )}
                {district.features.park_view && (
                  <span className={styles.feature}>🌳 Вид на парк</span>
                )}
                {district.features.city_view && (
                  <span className={styles.feature}>🏙️ Вид на город</span>
                )}
              </div>
            </div>

            <div className={styles.amenities}>
              <h3>Инфраструктура</h3>
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
                <h3>Станции метро</h3>
                <ul className={styles.metroList}>
                  {district.metro_stations.map(station => (
                    <li key={station}>{station}</li>
                  ))}
                </ul>
              </div>
            )}

            {district.developers.length > 0 && (
              <div className={styles.developers}>
                <h3>Застройщики</h3>
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

          {districtProperties.length > 0 && (
            <div className={styles.propertiesCard}>
              <h2>Объекты в районе ({districtProperties.length})</h2>
              <div className={styles.propertiesList}>
                {districtProperties.map(property => (
                  <Link
                    key={property.id}
                    to={`/project/${property.id}`}
                    className={styles.propertyCard}
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className={styles.propertyImage}
                    />
                    <div className={styles.propertyInfo}>
                      <h3 className={styles.propertyTitle}>{property.title}</h3>
                      <p className={styles.propertyLocation}>{property.location}</p>
                      <div className={styles.propertyDetails}>
                        <span className={styles.propertyPrice}>
                          {(property.priceFrom / 1000000).toFixed(1)}M {property.currency}
                        </span>
                        <span className={styles.propertyStatus}>{property.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {districtProperties.length === 0 && (
            <div className={styles.noProperties}>
              <p>В данном районе пока нет доступных объектов на нашем сайте.</p>
              <Link to="/catalog" className={styles.catalogLink}>
                Посмотреть все объекты
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
