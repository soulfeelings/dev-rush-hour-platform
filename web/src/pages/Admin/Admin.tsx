import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../../ui'
import { getAdminKey, setAdminKey, removeAdminKey } from '../../utils/adminApi'
import { AdminApi, type DeveloperCreateRequest, type ProjectCreateRequest } from '../../api'
import { AuthForm } from './components/AuthForm'
import { AdminTabs } from './components/AdminTabs'
import { DeveloperForm } from './components/DeveloperForm'
import { ProjectForm } from './components/ProjectForm'
import { LotForm } from './components/LotForm'

const {
  useAdminListDevelopers,
  useAdminListAreas,
  useAdminListProjects,
  useAdminCreateDeveloper,
  useAdminCreateProject,
  useAdminCreateLot,
} = AdminApi
import styles from './Admin.module.scss'

export default function Admin() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'developer' | 'project' | 'lot'>('developer')
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAdminKey())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  const { data: developersData } = useAdminListDevelopers({
    query: { enabled: isAuthenticated },
  })
  const { data: areasData } = useAdminListAreas({
    query: { enabled: isAuthenticated },
  })
  const { data: projectsData } = useAdminListProjects({
    query: { enabled: isAuthenticated },
  })

  const developers = developersData || []
  const areas = areasData || []
  const projects = projectsData || []

  const createDeveloperMutation = useAdminCreateDeveloper({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/admin/developers'] })
        setSuccess('Developer created successfully!')
        setFormKey(prev => prev + 1)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create developer')
      },
    },
  })

  const createProjectMutation = useAdminCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/admin/projects'] })
        setSuccess('Project created successfully!')
        setFormKey(prev => prev + 1)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create project')
      },
    },
  })

  const createLotMutation = useAdminCreateLot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/admin/lots'] })
        setSuccess('Lot created successfully!')
        setFormKey(prev => prev + 1)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create lot')
      },
    },
  })

  const loading =
    createDeveloperMutation.isPending ||
    createProjectMutation.isPending ||
    createLotMutation.isPending

  const handleAuth = (username: string, password: string) => {
    setError(null)
    if (username === 'admin' && password === 'admin') {
      const adminKey = import.meta.env.VITE_ADMIN_KEY || 'admin-key'
      setAdminKey(adminKey)
      setIsAuthenticated(true)
    } else {
      setError('Invalid username or password')
    }
  }

  const handleLogout = () => {
    removeAdminKey()
    setIsAuthenticated(false)
    setError(null)
    setSuccess(null)
    setFormKey(prev => prev + 1)
  }

  const handleDeveloperSubmit = (payload: DeveloperCreateRequest) => {
    setError(null)
    setSuccess(null)
    createDeveloperMutation.mutate({ data: payload })
  }

  const handleProjectSubmit = (payload: ProjectCreateRequest) => {
    setError(null)
    setSuccess(null)
    createProjectMutation.mutate({ data: payload })
  }

  const handleLotSubmit = (payload: Record<string, unknown>) => {
    setError(null)
    setSuccess(null)
    createLotMutation.mutate({ data: payload as never })
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.admin}>
        <AuthForm onAuth={handleAuth} error={error} />
      </div>
    )
  }

  return (
    <div className={styles.admin}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Admin Panel</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {activeTab === 'developer' && (
          <DeveloperForm key={formKey} onSubmit={handleDeveloperSubmit} loading={loading} />
        )}

        {activeTab === 'project' && (
          <ProjectForm
            key={formKey}
            developers={developers}
            areas={areas}
            onSubmit={handleProjectSubmit}
            loading={loading}
          />
        )}

        {activeTab === 'lot' && (
          <LotForm
            key={formKey}
            projects={projects}
            developers={developers}
            areas={areas}
            onSubmit={handleLotSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
