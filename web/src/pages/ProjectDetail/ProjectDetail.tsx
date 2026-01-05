import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { components } from '../../api'
import styles from './ProjectDetail.module.scss'

type Project = components['schemas']['Project']

// Тип для лота из API (не включен в сгенерированные типы)
interface Lot {
  id?: string
  status?: 'active' | 'hidden' | 'reserved' | 'sold'
  projectId?: string
  developerId?: string
  areaId?: string
  type?: 'apartment' | 'villa' | 'townhouse' | 'penthouse'
  bedrooms?: number
  bathrooms?: number
  areaSqm?: number
  floor?: number
  priceCurrency?: string
  priceAmount?: number
}

async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const response = await fetch(`/api/projects/${slug}`)
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

async function fetchProjectLots(projectSlug: string): Promise<Lot[]> {
  try {
    const response = await fetch(`/api/lots?project=${projectSlug}`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error fetching lots:', error)
    return []
  }
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [projectData, lotsData] = await Promise.all([
          fetchProject(slug),
          fetchProjectLots(slug),
        ])

        if (!projectData) {
          setError('Проект не найден')
        } else {
          setProject(projectData)
          setLots(lotsData)
        }
      } catch {
        setError('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h1>Загрузка...</h1>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Объект не найден</h1>
          <p>{error || `Объект "${slug}" не существует.`}</p>
          <Link to="/catalog" className={styles.backLink}>
            Вернуться в каталог
          </Link>
        </div>
      </div>
    )
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Готов'
      case 'construction':
        return 'Строительство'
      case 'planning':
        return 'Планирование'
      default:
        return status
    }
  }

  const getLotStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Доступен'
      case 'hidden':
        return 'Скрыт'
      case 'reserved':
        return 'Забронирован'
      case 'sold':
        return 'Продан'
      default:
        return status
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/catalog" className={styles.backLink}>
          ← Назад к каталогу
        </Link>
        <h1 className={styles.title}>{project.title}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.imagePlaceholder}>
            <span>Фото проекта</span>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>Информация об объекте</h2>
            <div className={styles.infoRow}>
              <span className={styles.label}>Расположение:</span>
              <span className={styles.value}>{project.location}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Цена от:</span>
              <span className={styles.value}>
                {(project.priceFrom! / 1000000).toFixed(1)} млн ₽
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Статус:</span>
              <span className={styles.value}>{getStatusText(project.status!)}</span>
            </div>
            {project.description && (
              <div className={styles.description}>
                <h3>Описание</h3>
                <p>{project.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lots.length > 0 && (
        <div className={styles.unitsSection}>
          <h2>Доступные лоты</h2>
          <div className={styles.unitsTable}>
            <table>
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Спальни</th>
                  <th>Площадь</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot, index) => (
                  <tr key={lot.id || index}>
                    <td>{lot.type}</td>
                    <td>{lot.bedrooms}</td>
                    <td>{lot.areaSqm} м²</td>
                    <td>
                      {lot.priceAmount
                        ? `${(lot.priceAmount / 1000000).toFixed(1)} млн ${lot.priceCurrency || 'AED'}`
                        : '-'}
                    </td>
                    <td>
                      <span
                        className={`${styles.unitStatus} ${styles[`unitStatus${lot.status}`]}`}
                      >
                        {getLotStatusText(lot.status!)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
