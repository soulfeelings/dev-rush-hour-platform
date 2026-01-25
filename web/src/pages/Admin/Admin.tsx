import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getAdminKey, setAdminKey, removeAdminKey } from '../../utils/adminApi'
import {
  AdminApi,
  type DeveloperCreateRequest,
  type ProjectCreateRequest,
  type CityCreateRequest,
  type Project,
  type LotListItem,
  type Developer,
  type Area,
  type City,
} from '../../api'
import { Toast } from '../../ui'
import { AuthForm } from './components/AuthForm'
import { Sidebar } from './components/Sidebar'
import { RightSidebar } from './components/RightSidebar'
import { DeveloperForm } from './components/DeveloperForm'
import { ProjectForm } from './components/ProjectForm'
import { LotForm } from './components/LotForm'
import { ProjectsTable } from './components/ProjectsTable'
import { LotsTable } from './components/LotsTable'
import { AreasTable } from './components/AreasTable'
import { CitiesTable } from './components/CitiesTable'
import { CityForm } from './components/CityForm'
import { ADMIN_ROUTES, ADMIN_ROUTE_SEGMENTS, ADMIN_API_ENDPOINTS } from './constants'

const {
  useAdminListDevelopers,
  useAdminListAreas,
  useAdminListProjects,
  useAdminCreateDeveloper,
  useAdminCreateProject,
  useAdminCreateLot,
  useAdminCreateCity,
  useAdminUpdateDeveloper,
  useAdminUpdateProject,
  useAdminUpdateLot,
  useAdminUpdateCity,
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
  const [rightSidebarForm, setRightSidebarForm] = useState<
    'developer' | 'project' | 'lot' | 'city' | null
  >(null)
  const [editingEntity, setEditingEntity] = useState<
    Project | LotListItem | Developer | Area | City | null
  >(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
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
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
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
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create lot')
      },
    },
  })

  const updateDeveloperMutation = useAdminUpdateDeveloper({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.DEVELOPERS] })
        setSuccess('Developer updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update developer')
      },
    },
  })

  const updateProjectMutation = useAdminUpdateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.PROJECTS] })
        setSuccess('Project updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update project')
      },
    },
  })

  const updateLotMutation = useAdminUpdateLot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.LOTS] })
        setSuccess('Lot updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update lot')
      },
    },
  })

  const createCityMutation = useAdminCreateCity({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.CITIES] })
        setSuccess('City created successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create city')
      },
    },
  })

  const updateCityMutation = useAdminUpdateCity({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.CITIES] })
        setSuccess('City updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          handleCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update city')
      },
    },
  })

  const loading =
    createDeveloperMutation.isPending ||
    createProjectMutation.isPending ||
    createLotMutation.isPending ||
    createCityMutation.isPending ||
    updateDeveloperMutation.isPending ||
    updateProjectMutation.isPending ||
    updateLotMutation.isPending ||
    updateCityMutation.isPending

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
    setSidebarOpen(false)
    navigate(ADMIN_ROUTES.PROJECTS)
  }

  const getActiveTab = (): 'projects-list' | 'lots-list' | 'areas-list' | 'cities-list' => {
    const path = params['*'] || ADMIN_ROUTE_SEGMENTS.PROJECTS
    if (path === ADMIN_ROUTE_SEGMENTS.LOTS) return 'lots-list'
    if (path === ADMIN_ROUTE_SEGMENTS.AREAS) return 'areas-list'
    if (path === ADMIN_ROUTE_SEGMENTS.CITIES) return 'cities-list'
    return 'projects-list'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tab: 'projects-list' | 'lots-list' | 'areas-list' | 'cities-list') => {
    const pathMap: Record<typeof tab, string> = {
      'projects-list': ADMIN_ROUTE_SEGMENTS.PROJECTS,
      'lots-list': ADMIN_ROUTE_SEGMENTS.LOTS,
      'areas-list': ADMIN_ROUTE_SEGMENTS.AREAS,
      'cities-list': ADMIN_ROUTE_SEGMENTS.CITIES,
    }
    navigate(`${ADMIN_ROUTES.BASE}/${pathMap[tab]}`)
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
  }

  const handleNewClick = (formType: 'developer' | 'project' | 'lot' | 'city') => {
    setEditingEntity(null)
    setRightSidebarForm(formType)
    setRightSidebarOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleEditClick = (
    entity: Project | LotListItem | Developer | Area | City,
    formType: 'developer' | 'project' | 'lot' | 'city'
  ) => {
    setEditingEntity(entity)
    setRightSidebarForm(formType)
    setRightSidebarOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseRightSidebar = () => {
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
    setEditingEntity(null)
    setFormKey((prev: number) => prev + 1)
  }

  const handleDeveloperSubmit = (payload: DeveloperCreateRequest) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateDeveloperMutation.mutate({ id: editingEntity.id, data: payload })
    } else {
      createDeveloperMutation.mutate({ data: payload })
    }
  }

  const handleProjectSubmit = (payload: ProjectCreateRequest) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateProjectMutation.mutate({ id: editingEntity.id, data: payload })
    } else {
      createProjectMutation.mutate({ data: payload })
    }
  }

  const handleLotSubmit = (payload: Record<string, unknown>) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateLotMutation.mutate({ id: editingEntity.id, data: payload as never })
    } else {
      createLotMutation.mutate({ data: payload as never })
    }
  }

  const handleCitySubmit = (payload: CityCreateRequest) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateCityMutation.mutate({ id: editingEntity.id, data: payload })
    } else {
      createCityMutation.mutate({ data: payload })
    }
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
    const isEditMode = !!editingEntity
    if (rightSidebarForm === 'developer') return isEditMode ? 'Edit Developer' : 'Create Developer'
    if (rightSidebarForm === 'project') return isEditMode ? 'Edit Project' : 'Create Project'
    if (rightSidebarForm === 'lot') return isEditMode ? 'Edit Lot' : 'Create Lot'
    if (rightSidebarForm === 'city') return isEditMode ? 'Edit City' : 'Create City'
    return ''
  }

  const isEditMode = !!editingEntity

  return (
    <div className={styles.admin}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => {
          handleTabChange(tab)
          setSidebarOpen(false)
        }}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={styles.content}>
        <Routes>
          <Route
            path={ADMIN_ROUTE_SEGMENTS.PROJECTS}
            element={
              <ProjectsTable
                onNewClick={() => handleNewClick('project')}
                onEditClick={project => handleEditClick(project, 'project')}
              />
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.LOTS}
            element={
              <LotsTable
                onNewClick={() => handleNewClick('lot')}
                onEditClick={lot => handleEditClick(lot, 'lot')}
              />
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.AREAS}
            element={
              <AreasTable
                onNewClick={() => handleNewClick('developer')}
                onEditClick={area => handleEditClick(area, 'developer')}
              />
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.CITIES}
            element={
              <CitiesTable
                onNewClick={() => handleNewClick('city')}
                onEditClick={city => handleEditClick(city, 'city')}
              />
            }
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
          <DeveloperForm
            key={formKey}
            onSubmit={handleDeveloperSubmit}
            loading={loading}
            initialData={
              isEditMode && 'slug' in editingEntity ? (editingEntity as Developer) : null
            }
            isEditMode={isEditMode}
          />
        )}
        {rightSidebarForm === 'project' && (
          <ProjectForm
            key={formKey}
            developers={developers}
            areas={areas}
            onSubmit={handleProjectSubmit}
            loading={loading}
            initialData={isEditMode && 'slug' in editingEntity ? (editingEntity as Project) : null}
            isEditMode={isEditMode}
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
            initialData={
              isEditMode && 'projectId' in editingEntity ? (editingEntity as LotListItem) : null
            }
            isEditMode={isEditMode}
          />
        )}
        {rightSidebarForm === 'city' && (
          <CityForm
            key={formKey}
            onSubmit={handleCitySubmit}
            loading={loading}
            initialData={isEditMode && 'slug' in editingEntity ? (editingEntity as City) : null}
            isEditMode={isEditMode}
          />
        )}
      </RightSidebar>

      <Toast open={!!success} onClose={() => setSuccess(null)} variant="success" duration={3000}>
        {success}
      </Toast>

      <Toast open={!!error} onClose={() => setError(null)} variant="error" duration={5000}>
        {error}
      </Toast>

      <button
        type="button"
        className={styles.mobileMenuButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  )
}
