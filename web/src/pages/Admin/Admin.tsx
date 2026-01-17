import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import { getAdminKey, setAdminKey, removeAdminKey } from '../../utils/adminApi'
import { AdminApi, type DeveloperCreateRequest, type ProjectCreateRequest } from '../../api'
import { AuthForm } from './components/AuthForm'
import { Sidebar } from './components/Sidebar'
import { RightSidebar } from './components/RightSidebar'
import { DeveloperForm } from './components/DeveloperForm'
import { ProjectForm } from './components/ProjectForm'
import { LotForm } from './components/LotForm'
import { ProjectsTable } from './components/ProjectsTable'
import { LotsTable } from './components/LotsTable'
import { AreasTable } from './components/AreasTable'
import { ADMIN_ROUTES, ADMIN_ROUTE_SEGMENTS, ADMIN_API_ENDPOINTS } from './constants'

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
  const params = useParams<'*'>()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAdminKey())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [rightSidebarForm, setRightSidebarForm] = useState<'developer' | 'project' | 'lot' | null>(
    null
  )

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
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.DEVELOPERS] })
        setSuccess('Developer created successfully!')
        setFormKey((prev: number) => prev + 1)
        handleCloseRightSidebar()
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create developer')
      },
    },
  })

  const createProjectMutation = useAdminCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.PROJECTS] })
        setSuccess('Project created successfully!')
        setFormKey((prev: number) => prev + 1)
        handleCloseRightSidebar()
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create project')
      },
    },
  })

  const createLotMutation = useAdminCreateLot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.LOTS] })
        setSuccess('Lot created successfully!')
        setFormKey((prev: number) => prev + 1)
        handleCloseRightSidebar()
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
    setFormKey((prev: number) => prev + 1)
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
    navigate(ADMIN_ROUTES.PROJECTS)
  }

  const getActiveTab = (): 'projects-list' | 'lots-list' | 'areas-list' => {
    const path = params['*'] || ADMIN_ROUTE_SEGMENTS.PROJECTS
    if (path === ADMIN_ROUTE_SEGMENTS.LOTS) return 'lots-list'
    if (path === ADMIN_ROUTE_SEGMENTS.AREAS) return 'areas-list'
    return 'projects-list'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tab: 'projects-list' | 'lots-list' | 'areas-list') => {
    const pathMap: Record<typeof tab, string> = {
      'projects-list': ADMIN_ROUTE_SEGMENTS.PROJECTS,
      'lots-list': ADMIN_ROUTE_SEGMENTS.LOTS,
      'areas-list': ADMIN_ROUTE_SEGMENTS.AREAS,
    }
    navigate(`${ADMIN_ROUTES.BASE}/${pathMap[tab]}`)
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
  }

  const handleNewClick = (formType: 'developer' | 'project' | 'lot') => {
    setRightSidebarForm(formType)
    setRightSidebarOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseRightSidebar = () => {
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
    setFormKey((prev: number) => prev + 1)
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
        <div className={styles.authForm}>
          <AuthForm onAuth={handleAuth} error={error} />
        </div>
      </div>
    )
  }

  const getRightSidebarTitle = () => {
    if (rightSidebarForm === 'developer') return 'Create Developer'
    if (rightSidebarForm === 'project') return 'Create Project'
    if (rightSidebarForm === 'lot') return 'Create Lot'
    return ''
  }

  return (
    <div className={styles.admin}>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} />
      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <Routes>
          <Route
            path={ADMIN_ROUTE_SEGMENTS.PROJECTS}
            element={<ProjectsTable onNewClick={() => handleNewClick('project')} />}
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.LOTS}
            element={<LotsTable onNewClick={() => handleNewClick('lot')} />}
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.AREAS}
            element={<AreasTable onNewClick={() => handleNewClick('developer')} />}
          />
          <Route path="*" element={<Navigate to={ADMIN_ROUTES.PROJECTS} replace />} />
        </Routes>
      </div>

      <RightSidebar
        isOpen={rightSidebarOpen}
        onClose={handleCloseRightSidebar}
        title={getRightSidebarTitle()}
      >
        {rightSidebarForm === 'developer' && (
          <DeveloperForm key={formKey} onSubmit={handleDeveloperSubmit} loading={loading} />
        )}
        {rightSidebarForm === 'project' && (
          <ProjectForm
            key={formKey}
            developers={developers}
            areas={areas}
            onSubmit={handleProjectSubmit}
            loading={loading}
          />
        )}
        {rightSidebarForm === 'lot' && (
          <LotForm
            key={formKey}
            projects={projects}
            developers={developers}
            areas={areas}
            onSubmit={handleLotSubmit}
            loading={loading}
          />
        )}
      </RightSidebar>
    </div>
  )
}
