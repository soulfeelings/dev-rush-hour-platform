import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { components } from '../../api'
import styles from './ProjectDetail.module.scss'

type Project = components['schemas']['Project']
type Unit = components['schemas']['Unit']

const API_BASE = 'http://localhost:8080/api'

async function fetchProject(id: string): Promise<Project | null> {
  try {
    const response = await fetch(`${API_BASE}/projects/${id}`)
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

async function fetchProjectUnits(projectId: string): Promise<Unit[]> {
  try {
    const response = await fetch(`${API_BASE}/units?projectId=${projectId}`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error fetching units:', error)
    return []
  }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [projectData, unitsData] = await Promise.all([
          fetchProject(id),
          fetchProjectUnits(id),
        ])

        if (!projectData) {
          setError('Проект не найден')
        } else {
          setProject(projectData)
          setUnits(unitsData)
        }
      } catch {
        setError('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

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
          <p>{error || `Объект с ID "${id}" не существует.`}</p>
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

  const getUnitStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Доступна'
      case 'reserved':
        return 'Забронирована'
      case 'sold':
        return 'Продана'
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

      {units.length > 0 && (
        <div className={styles.unitsSection}>
          <h2>Доступные юниты</h2>
          <div className={styles.unitsTable}>
            <table>
              <thead>
                <tr>
                  <th>Этаж</th>
                  <th>Площадь</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, index) => (
                  <tr key={unit.id || index}>
                    <td>{unit.floor}</td>
                    <td>{unit.area} м²</td>
                    <td>{(unit.price! / 1000000).toFixed(1)} млн ₽</td>
                    <td>
                      <span
                        className={`${styles.unitStatus} ${styles[`unitStatus${unit.status}`]}`}
                      >
                        {getUnitStatusText(unit.status!)}
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
