import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './ProjectDetail.module.scss'

// Тип для проекта из API (актуальная структура)
interface Project {
  id?: string
  slug?: string
  name?: string
  status?: string
  sale?: string
  developerId?: string
  areaId?: string
  lat?: number
  lng?: number
  data?: {
    description?: string
    specs?: Record<string, unknown>
    media?: {
      cover?: {
        url?: string
      }
    }
    isRecommended?: boolean
    isFeatured?: boolean
    tags?: string[]
  }
  developer?: {
    name?: string
    data?: Record<string, unknown>
  }
  area?: {
    name?: string
    city?: string
  }
  createdAt?: string
  updatedAt?: string
}

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
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Property Not Found</h1>
          <p>{error || `Property "${slug}" does not exist.`}</p>
          <Link to="/catalog" className={styles.backLink}>
            Return to Catalog
          </Link>
        </div>
      </div>
    )
  }

  const getSaleText = (sale: string) => {
    switch (sale) {
      case 'sale':
        return 'On Sale'
      case 'start of sales':
        return 'Start of Sales'
      case 'sales announcement':
        return 'Sales Announcement'
      default:
        return sale
    }
  }

  const getLotStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Available'
      case 'hidden':
        return 'Hidden'
      case 'reserved':
        return 'Reserved'
      case 'sold':
        return 'Sold'
      default:
        return status
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/catalog" className={styles.backLink}>
          ← Back to Catalog
        </Link>
        <h1 className={styles.title}>{project.name}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          {project.data?.media?.cover?.url ? (
            <img
              src={project.data.media.cover.url}
              alt={project.name || 'Project Image'}
              className={styles.projectImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>Project Image</span>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h2>Property Information</h2>
            <div className={styles.infoRow}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{project.area?.name || 'Dubai'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Developer:</span>
              <span className={styles.value}>{project.developer?.name || 'Not specified'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Price from:</span>
              <span className={styles.value}>
                {((project.data?.specs?.priceFrom as number) / 1000000).toFixed(1)}M {(project.data?.specs?.currency as string) || 'AED'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Sale Status:</span>
              <span className={styles.value}>{getSaleText(project.sale || '')}</span>
            </div>
            {project.data?.description && (
              <div className={styles.description}>
                <h3>Description</h3>
                <p>{String(project.data.description)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {lots.length > 0 && (
        <div className={styles.unitsSection}>
          <h2>Available Units</h2>
          <div className={styles.unitsTable}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Bedrooms</th>
                  <th>Area</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot, index) => (
                  <tr key={lot.id || index}>
                    <td>{lot.type}</td>
                    <td>{lot.bedrooms}</td>
                    <td>{lot.areaSqm} sqm</td>
                    <td>
                      {lot.priceAmount
                        ? `${(lot.priceAmount / 1000000).toFixed(1)}M ${lot.priceCurrency || 'AED'}`
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
