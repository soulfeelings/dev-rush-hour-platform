import { useEffect, useState } from 'react'
import createClient from 'openapi-fetch'
import type { paths } from '../api'
import ProjectCard from '../components/ProjectCard'
import styles from './Catalog.module.scss'

type Project = paths['/projects']['get']['responses']['200']['content']['application/json'][number]

const apiClient = createClient<paths>({ baseUrl: 'http://localhost:8080/api' })

export default function Catalog() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const { data, error } = await apiClient.GET('/projects')

        if (error) {
          setError('Ошибка загрузки проектов')
          return
        }

        if (data) {
          setProjects(data)
        }
      } catch {
        setError('Ошибка загрузки проектов')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return <div className={styles.container}>Загрузка...</div>
  }

  if (error) {
    return <div className={styles.container}>{error}</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Каталог проектов</h1>
      <div className={styles.grid}>
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            title={project.title}
            location={project.location}
            priceFrom={project.priceFrom}
            status={project.status}
          />
        ))}
      </div>
    </div>
  )
}
