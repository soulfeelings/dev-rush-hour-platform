import { useParams, Link } from 'react-router-dom'
import { mockProperties } from '../../data/mockProperties'
import styles from './ProjectDetail.module.scss'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const property = mockProperties.find(p => p.id === id)

  if (!property) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Объект не найден</h1>
          <p>Объект с ID "{id}" не существует.</p>
          <Link to="/catalog" className={styles.backLink}>
            Вернуться в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/catalog" className={styles.backLink}>
          ← Назад к каталогу
        </Link>
        <h1 className={styles.title}>{property.title}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img src={property.image} alt={property.title} className={styles.mainImage} />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>Информация об объекте</h2>
            <div className={styles.infoRow}>
              <span className={styles.label}>Застройщик:</span>
              <span className={styles.value}>{property.developer}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Расположение:</span>
              <span className={styles.value}>{property.location}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Цена от:</span>
              <span className={styles.value}>
                {(property.priceFrom / 1000000).toFixed(1)} млн {property.currency}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Тип:</span>
              <span className={styles.value}>{property.types.join(', ')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Спальни:</span>
              <span className={styles.value}>{property.bedrooms.join(', ')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Срок сдачи:</span>
              <span className={styles.value}>{property.completionDate}</span>
            </div>
            {property.area > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Площадь:</span>
                <span className={styles.value}>
                  {property.area} {property.areaUnit}
                </span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.label}>Статус:</span>
              <span className={styles.value}>{property.status}</span>
            </div>
            {property.description && (
              <div className={styles.description}>
                <h3>Описание</h3>
                <p>{property.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

