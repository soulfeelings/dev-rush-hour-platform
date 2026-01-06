import { useState, useEffect } from 'react'
import type { Property } from '../types/property'
import { apiProjectsToProperties } from '../utils/apiAdapters'

const API_URL = import.meta.env.VITE_API_URL || ''

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

      const response = await fetch(`${API_URL}/api/projects`)

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
      console.warn('Falling back to mock data 1212312')
    } finally {
      setLoading(false)
    }
  }

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  }
}
