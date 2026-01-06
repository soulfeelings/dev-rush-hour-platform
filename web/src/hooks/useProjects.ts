import { useState, useEffect } from 'react'
import type { Property } from '../types/property'
import { apiProjectsToProperties } from '../utils/apiAdapters'

export function useProjects() {
  const [projects, setProjects] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/projects')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const apiProjects = await response.json()
      const properties = apiProjectsToProperties(apiProjects)

      setProjects(properties)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')

      // Fallback to mock data if API fails
      console.warn('Falling back to mock data')
      const { mockProperties } = await import('../data/mockProperties')
      setProjects(mockProperties.filter(p => p.status === 'active'))
    } finally {
      setLoading(false)
    }
  }

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects
  }
}
