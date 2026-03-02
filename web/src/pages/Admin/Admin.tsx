import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { adminFetch } from '../../utils/adminApi'
import {
  AdminApi,
  type DeveloperCreateRequest,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
  type CityCreateRequest,
  type AreaCreateRequest,
  type Project,
  type LotListItem,
  type Developer,
  type Area,
  type City,
  getAdminListProjectsQueryKey,
  getAdminListLotsQueryKey,
  getAdminListAreasQueryKey,
  getAdminListCitiesQueryKey,
  getAdminListBadgesQueryKey,
  getAdminListInfrastructuresQueryKey,
  getAdminListDevelopersQueryKey,
  getAdminListDeletedDevelopersQueryKey,
  getAdminListDeletedProjectsQueryKey,
  getAdminListDeletedLotsQueryKey,
  getAdminListDeletedAreasQueryKey,
  getAdminListDeletedCitiesQueryKey,
  getAdminListDeletedBadgesQueryKey,
  getAdminListDeletedInfrastructuresQueryKey,
  getListLotsQueryKey,
} from '../../api'
import type { LotsListResponse } from '../../api/generated/schemas/lotsListResponse'
import type { Badge } from '../../api/generated/schemas/badge'
import type { BadgeCreateRequest } from '../../api/generated/schemas/badgeCreateRequest'
import type { Infrastructure } from '../../api/generated/schemas/infrastructure'
import type { InfrastructureCreateRequest } from '../../api/generated/schemas/infrastructureCreateRequest'
import { Toast, FullPageSpinner, Modal, ModalBody, ModalFooter, Button as UIButton } from '../../ui'
import '../../constants/storage'
import { Sidebar } from './components/Sidebar'
import { RightSidebar } from './components/RightSidebar'
import { DeveloperForm } from './components/DeveloperForm'
import { ProjectForm } from './components/ProjectForm'
import { LotForm } from './components/LotForm'
import { AreaForm } from './components/AreaForm'
import { ProjectsTable } from './components/ProjectsTable'
import { LotsTable } from './components/LotsTable'
import { AreasTable } from './components/AreasTable'
import { CitiesTable } from './components/CitiesTable'
import { CityForm } from './components/CityForm'
import { BadgesTable } from './components/BadgesTable'
import { BadgeForm } from './components/BadgeForm'
import { DevelopersTable } from './components/DevelopersTable'
import { DeletedDevelopersTable } from './components/DeletedDevelopersTable'
import { DeletedProjectsTable } from './components/DeletedProjectsTable'
import { DeletedLotsTable } from './components/DeletedLotsTable'
import { DeletedAreasTable } from './components/DeletedAreasTable'
import { DeletedCitiesTable } from './components/DeletedCitiesTable'
import { DeletedBadgesTable } from './components/DeletedBadgesTable'
import { InfrastructuresTable } from './components/InfrastructuresTable'
import { InfrastructureForm } from './components/InfrastructureForm'
import { DeletedInfrastructuresTable } from './components/DeletedInfrastructuresTable'
import { MediaTable } from './components/MediaTable'
import { TeamPage } from './components/TeamPage'
import { ADMIN_ROUTES, ADMIN_ROUTE_SEGMENTS, ADMIN_API_ENDPOINTS } from './constants'

const {
  useAdminListDevelopers,
  useAdminListAreas,
  useAdminListProjects,
  useAdminListBadges,
  useAdminListInfrastructures,
  useAdminListCities,
  useAdminCreateDeveloper,
  useAdminCreateProject,
  useAdminCreateLot,
  useAdminCreateCity,
  useAdminUpdateDeveloper,
  useAdminUpdateProject,
  useAdminUpdateLot,
  useAdminUpdateCity,
  useAdminCreateBadge,
  useAdminUpdateBadge,
  useAdminCreateInfrastructure,
  useAdminUpdateInfrastructure,
  useAdminCreateArea,
  useAdminUpdateArea,
  useAdminSoftDeleteProject,
  useAdminSoftDeleteLot,
  useAdminSoftDeleteArea,
  useAdminSoftDeleteCity,
  useAdminSoftDeleteBadge,
  useAdminSoftDeleteInfrastructure,
  useAdminSoftDeleteDeveloper,
  useAdminRestoreDeveloper,
  useAdminHardDeleteDeveloper,
  useAdminRestoreProject,
  useAdminHardDeleteProject,
  useAdminRestoreLot,
  useAdminHardDeleteLot,
  useAdminRestoreArea,
  useAdminHardDeleteArea,
  useAdminRestoreCity,
  useAdminHardDeleteCity,
  useAdminRestoreBadge,
  useAdminHardDeleteBadge,
  useAdminRestoreInfrastructure,
  useAdminHardDeleteInfrastructure,
} = AdminApi
import styles from './Admin.module.scss'

const isProjectsQueryKey = (queryKey: readonly unknown[]) => {
  const key = queryKey[0]
  return typeof key === 'string' && key.startsWith('/projects')
}

type AdminClaims = {
  email: string
  role: 'superadmin' | 'admin'
  permissions: string[]
}

type FormDraft = {
  id: string
  formType: 'developer' | 'project' | 'lot' | 'area' | 'city' | 'badge' | 'infrastructure'
  data: unknown
  displayName: string
  editingEntity?: Project | LotListItem | Developer | Area | City | Badge | Infrastructure
}

const FORM_TYPE_LABELS: Record<FormDraft['formType'], string> = {
  developer: 'Developer',
  project: 'Project',
  lot: 'Lot',
  area: 'Area',
  city: 'City',
  badge: 'Badge',
  infrastructure: 'Infrastructure',
}

function getDraftDisplayName(formType: FormDraft['formType'], data: unknown): string {
  const name = (data as { name?: string })?.name?.trim() || 'Untitled'
  return `${FORM_TYPE_LABELS[formType]} · ${name}`
}

export default function Admin() {
  const queryClient = useQueryClient()
  const params = useParams<'*'>()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [claims, setClaims] = useState<AdminClaims | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [rightSidebarForm, setRightSidebarForm] = useState<
    'developer' | 'project' | 'lot' | 'area' | 'city' | 'badge' | 'infrastructure' | null
  >(null)
  const [editingEntity, setEditingEntity] = useState<
    Project | LotListItem | Developer | Area | City | Badge | Infrastructure | null
  >(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Session draft state
  const [formDrafts, setFormDrafts] = useState<FormDraft[]>([])
  const [saveForSessionOpen, setSaveForSessionOpen] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<Omit<FormDraft, 'id'> | null>(null)
  const [activeDraftData, setActiveDraftData] = useState<unknown>(null)
  const currentFormDataRef = useRef<unknown>(null)
  const currentFormIsDirtyRef = useRef(false)

  const handleFormDataChange = useCallback((data: unknown, isDirty: boolean) => {
    currentFormDataRef.current = data
    currentFormIsDirtyRef.current = isDirty
  }, [])

  // Check existing session via cookie
  useEffect(() => {
    adminFetch('/admin/auth/me', { method: 'GET' })
      .then(res => {
        if (res.ok) return res.json()
        return null
      })
      .then((data: AdminClaims | null) => {
        if (data) {
          setClaims(data)
          setIsAuthenticated(true)
        } else {
          navigate(ADMIN_ROUTES.AUTH, { replace: true })
        }
      })
      .catch(() => {
        navigate(ADMIN_ROUTES.AUTH, { replace: true })
      })
      .finally(() => setAuthLoading(false))
  }, [navigate])

  // Silent refresh — re-validate session every 14 min (TTL is 15 min)
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setInterval(async () => {
      const res = await adminFetch('/admin/auth/me', { method: 'GET' }).catch(() => null)
      if (!res || res.status === 401) {
        navigate(ADMIN_ROUTES.AUTH, { replace: true })
      } else if (res.ok) {
        const data: AdminClaims = await res.json()
        setClaims(data)
      }
    }, 14 * 60 * 1000)
    return () => clearInterval(id)
  }, [isAuthenticated, navigate])

  const can = (entity: string, action: string): boolean => {
    if (!claims) return false
    if (claims.role === 'superadmin') return true
    return claims.permissions.includes(`${entity}:${action}`)
  }

  const { data: developersData } = useAdminListDevelopers({
    query: { enabled: isAuthenticated },
  })
  const { data: areasData } = useAdminListAreas({
    query: { enabled: isAuthenticated },
  })
  const { data: projectsData } = useAdminListProjects({
    query: { enabled: isAuthenticated },
  })
  const { data: badgesData } = useAdminListBadges({
    query: { enabled: isAuthenticated },
  })
  const { data: infrastructuresData } = useAdminListInfrastructures({
    query: { enabled: isAuthenticated },
  })
  const { data: citiesData } = useAdminListCities({
    query: { enabled: isAuthenticated },
  })

  const developers = developersData || []
  const areas = areasData || []
  const projects = projectsData || []
  const badges = badgesData || []
  const infrastructures = infrastructuresData || []
  const cities = citiesData || []

  const invalidatePublicLotCardsCache = () => {
    queryClient.invalidateQueries({ queryKey: getListLotsQueryKey() })
    queryClient.invalidateQueries({
      predicate: query => isProjectsQueryKey(query.queryKey),
    })
  }

  const createDeveloperMutation = useAdminCreateDeveloper({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.DEVELOPERS] })
        setSuccess('Developer created successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
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
          doCloseRightSidebar()
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
        invalidatePublicLotCardsCache()
        setSuccess('Lot created successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
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
          doCloseRightSidebar()
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
          doCloseRightSidebar()
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
        invalidatePublicLotCardsCache()
        setSuccess('Lot updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update lot')
      },
    },
  })

  const createAreaMutation = useAdminCreateArea({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.AREAS] })
        setSuccess('Area created successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create area')
      },
    },
  })

  const updateAreaMutation = useAdminUpdateArea({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.AREAS] })
        setSuccess('Area updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update area')
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
          doCloseRightSidebar()
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
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update city')
      },
    },
  })

  const createBadgeMutation = useAdminCreateBadge({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.BADGES] })
        setSuccess('Badge created successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create badge')
      },
    },
  })

  const updateBadgeMutation = useAdminUpdateBadge({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.BADGES] })
        setSuccess('Badge updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update badge')
      },
    },
  })

  const createInfrastructureMutation = useAdminCreateInfrastructure({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.INFRASTRUCTURES] })
        setSuccess('Infrastructure created successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to create infrastructure')
      },
    },
  })

  const updateInfrastructureMutation = useAdminUpdateInfrastructure({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.INFRASTRUCTURES] })
        setSuccess('Infrastructure updated successfully!')
        setFormKey((prev: number) => prev + 1)
        setTimeout(() => {
          doCloseRightSidebar()
        }, 100)
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to update infrastructure')
      },
    },
  })

  const deleteProjectMutation = useAdminSoftDeleteProject({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<Project[]>(getAdminListProjectsQueryKey(), oldData =>
          oldData ? oldData.filter(item => item.id !== variables.id) : []
        )
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedProjectsQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to delete project')
      },
    },
  })

  const deleteLotMutation = useAdminSoftDeleteLot({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<LotsListResponse>(getAdminListLotsQueryKey(), oldData =>
          oldData ? { ...oldData, items: (oldData.items ?? []).filter(item => item.id !== variables.id) } : { items: [] }
        )
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedLotsQueryKey() })
        invalidatePublicLotCardsCache()
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to delete lot')
      },
    },
  })

  const deleteAreaMutation = useAdminSoftDeleteArea({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<Area[]>(getAdminListAreasQueryKey(), oldData =>
          oldData ? oldData.filter(item => item.id !== variables.id) : []
        )
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedAreasQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to delete area')
      },
    },
  })

  const deleteCityMutation = useAdminSoftDeleteCity({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<City[]>(getAdminListCitiesQueryKey(), oldData =>
          oldData ? oldData.filter(item => item.id !== variables.id) : []
        )
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedCitiesQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to delete city')
      },
    },
  })

  const deleteBadgeMutation = useAdminSoftDeleteBadge({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<Badge[]>(getAdminListBadgesQueryKey(), oldData =>
          oldData ? oldData.filter(item => item.id !== variables.id) : []
        )
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedBadgesQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to delete badge')
      },
    },
  })

  const deleteInfrastructureMutation = useAdminSoftDeleteInfrastructure({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<Infrastructure[]>(
          getAdminListInfrastructuresQueryKey(),
          oldData => (oldData ? oldData.filter(item => item.id !== variables.id) : [])
        )
        queryClient.invalidateQueries({
          queryKey: getAdminListDeletedInfrastructuresQueryKey(),
        })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to delete infrastructure')
      },
    },
  })

  const deleteDeveloperMutation = useAdminSoftDeleteDeveloper({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.setQueryData<Developer[]>(getAdminListDevelopersQueryKey(), oldData =>
          oldData ? oldData.filter(item => item.id !== variables.id) : []
        )
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedDevelopersQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to delete developer')
      },
    },
  })

  const restoreDeveloperMutation = useAdminRestoreDeveloper({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.DEVELOPERS] })
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedDevelopersQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to restore developer')
      },
    },
  })

  const hardDeleteDeveloperMutation = useAdminHardDeleteDeveloper({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedDevelopersQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to permanently delete developer')
      },
    },
  })

  const restoreProjectMutation = useAdminRestoreProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.PROJECTS] })
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedProjectsQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to restore project')
      },
    },
  })

  const hardDeleteProjectMutation = useAdminHardDeleteProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedProjectsQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to permanently delete project')
      },
    },
  })

  const restoreLotMutation = useAdminRestoreLot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.LOTS] })
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedLotsQueryKey() })
        invalidatePublicLotCardsCache()
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to restore lot')
      },
    },
  })

  const hardDeleteLotMutation = useAdminHardDeleteLot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedLotsQueryKey() })
        invalidatePublicLotCardsCache()
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to permanently delete lot')
      },
    },
  })

  const restoreAreaMutation = useAdminRestoreArea({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.AREAS] })
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedAreasQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to restore area')
      },
    },
  })

  const hardDeleteAreaMutation = useAdminHardDeleteArea({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedAreasQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to permanently delete area')
      },
    },
  })

  const restoreCityMutation = useAdminRestoreCity({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.CITIES] })
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedCitiesQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to restore city')
      },
    },
  })

  const hardDeleteCityMutation = useAdminHardDeleteCity({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedCitiesQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to permanently delete city')
      },
    },
  })

  const restoreBadgeMutation = useAdminRestoreBadge({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.BADGES] })
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedBadgesQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to restore badge')
      },
    },
  })

  const hardDeleteBadgeMutation = useAdminHardDeleteBadge({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListDeletedBadgesQueryKey() })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to permanently delete badge')
      },
    },
  })

  const restoreInfrastructureMutation = useAdminRestoreInfrastructure({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ADMIN_API_ENDPOINTS.INFRASTRUCTURES] })
        queryClient.invalidateQueries({
          queryKey: getAdminListDeletedInfrastructuresQueryKey(),
        })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to restore infrastructure')
      },
    },
  })

  const hardDeleteInfrastructureMutation = useAdminHardDeleteInfrastructure({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getAdminListDeletedInfrastructuresQueryKey(),
        })
      },
      onError: err => {
        setError(err instanceof Error ? err.message : 'Failed to permanently delete infrastructure')
      },
    },
  })

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [hardDeleteLoading, setHardDeleteLoading] = useState(false)

  const loading =
    createDeveloperMutation.isPending ||
    createProjectMutation.isPending ||
    createLotMutation.isPending ||
    createAreaMutation.isPending ||
    createCityMutation.isPending ||
    createBadgeMutation.isPending ||
    createInfrastructureMutation.isPending ||
    updateDeveloperMutation.isPending ||
    updateProjectMutation.isPending ||
    updateLotMutation.isPending ||
    updateAreaMutation.isPending ||
    updateCityMutation.isPending ||
    updateBadgeMutation.isPending ||
    updateInfrastructureMutation.isPending ||
    deleteProjectMutation.isPending ||
    deleteLotMutation.isPending ||
    deleteAreaMutation.isPending ||
    deleteCityMutation.isPending ||
    deleteBadgeMutation.isPending ||
    deleteInfrastructureMutation.isPending ||
    deleteDeveloperMutation.isPending

  const handleLogout = async () => {
    await adminFetch('/admin/auth/logout', { method: 'POST' }).catch(() => { })
    setClaims(null)
    setIsAuthenticated(false)
    setError(null)
    setSuccess(null)
    setFormKey((prev: number) => prev + 1)
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
    setSidebarOpen(false)
    navigate(ADMIN_ROUTES.AUTH, { replace: true })
  }

  const getActiveTab = ():
    | 'projects-list'
    | 'lots-list'
    | 'areas-list'
    | 'cities-list'
    | 'badges-list'
    | 'infrastructures-list'
    | 'developers-list'
    | 'media-list'
    | 'team-list' => {
    const path = params['*'] || ADMIN_ROUTE_SEGMENTS.PROJECTS
    if (path === ADMIN_ROUTE_SEGMENTS.LOTS) return 'lots-list'
    if (path === ADMIN_ROUTE_SEGMENTS.AREAS) return 'areas-list'
    if (path === ADMIN_ROUTE_SEGMENTS.CITIES) return 'cities-list'
    if (path === ADMIN_ROUTE_SEGMENTS.BADGES) return 'badges-list'
    if (path === ADMIN_ROUTE_SEGMENTS.INFRASTRUCTURES) return 'infrastructures-list'
    if (path === ADMIN_ROUTE_SEGMENTS.DEVELOPERS) return 'developers-list'
    if (path === ADMIN_ROUTE_SEGMENTS.MEDIA) return 'media-list'
    if (path === ADMIN_ROUTE_SEGMENTS.TEAM) return 'team-list'
    return 'projects-list'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (
    tab:
      | 'projects-list'
      | 'lots-list'
      | 'areas-list'
      | 'cities-list'
      | 'badges-list'
      | 'infrastructures-list'
      | 'developers-list'
      | 'media-list'
      | 'team-list'
  ) => {
    const pathMap: Record<typeof tab, string> = {
      'developers-list': ADMIN_ROUTE_SEGMENTS.DEVELOPERS,
      'projects-list': ADMIN_ROUTE_SEGMENTS.PROJECTS,
      'lots-list': ADMIN_ROUTE_SEGMENTS.LOTS,
      'areas-list': ADMIN_ROUTE_SEGMENTS.AREAS,
      'cities-list': ADMIN_ROUTE_SEGMENTS.CITIES,
      'badges-list': ADMIN_ROUTE_SEGMENTS.BADGES,
      'infrastructures-list': ADMIN_ROUTE_SEGMENTS.INFRASTRUCTURES,
      'media-list': ADMIN_ROUTE_SEGMENTS.MEDIA,
      'team-list': ADMIN_ROUTE_SEGMENTS.TEAM,
    }
    navigate(`${ADMIN_ROUTES.BASE}/${pathMap[tab]}`)
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
  }

  const handleNewClick = (
    formType: 'developer' | 'project' | 'lot' | 'area' | 'city' | 'badge' | 'infrastructure'
  ) => {
    setEditingEntity(null)
    setActiveDraftData(null)
    setRightSidebarForm(formType)
    setRightSidebarOpen(true)
    currentFormDataRef.current = null
    currentFormIsDirtyRef.current = false
    setError(null)
    setSuccess(null)
  }

  const handleEditClick = (
    entity: Project | LotListItem | Developer | Area | City | Badge | Infrastructure,
    formType: 'developer' | 'project' | 'lot' | 'area' | 'city' | 'badge' | 'infrastructure'
  ) => {
    setEditingEntity(entity)
    setActiveDraftData(null)
    setRightSidebarForm(formType)
    setRightSidebarOpen(true)
    currentFormDataRef.current = null
    currentFormIsDirtyRef.current = false
    setError(null)
    setSuccess(null)
  }

  const doCloseRightSidebar = () => {
    setRightSidebarOpen(false)
    setRightSidebarForm(null)
    setEditingEntity(null)
    setActiveDraftData(null)
    setFormKey((prev: number) => prev + 1)
    currentFormDataRef.current = null
    currentFormIsDirtyRef.current = false
  }

  const handleCloseRightSidebar = () => {
    if (currentFormIsDirtyRef.current && currentFormDataRef.current && rightSidebarForm) {
      setPendingDraft({
        formType: rightSidebarForm,
        data: currentFormDataRef.current,
        displayName: getDraftDisplayName(rightSidebarForm, currentFormDataRef.current),
        editingEntity: editingEntity ?? undefined,
      })
      setSaveForSessionOpen(true)
      return
    }
    doCloseRightSidebar()
  }

  const handleSaveForSession = () => {
    if (pendingDraft) {
      setFormDrafts(prev => [...prev, { ...pendingDraft, id: crypto.randomUUID() }])
    }
    setSaveForSessionOpen(false)
    setPendingDraft(null)
    doCloseRightSidebar()
  }

  const handleDiscardSession = () => {
    setSaveForSessionOpen(false)
    setPendingDraft(null)
    doCloseRightSidebar()
  }

  const handleDraftClick = (draftId: string) => {
    const draft = formDrafts.find(d => d.id === draftId)
    if (!draft) return
    setFormDrafts(prev => prev.filter(d => d.id !== draftId))
    setEditingEntity(draft.editingEntity ?? null)
    setRightSidebarForm(draft.formType)
    setActiveDraftData(draft.data)
    setRightSidebarOpen(true)
    currentFormDataRef.current = null
    currentFormIsDirtyRef.current = false
    setFormKey((prev: number) => prev + 1)
    setError(null)
    setSuccess(null)
  }

  const handleDraftDiscard = (draftId: string) => {
    setFormDrafts(prev => prev.filter(d => d.id !== draftId))
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

  const handleProjectSubmit = (payload: ProjectCreateRequest | ProjectUpdateRequest) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateProjectMutation.mutate({ id: editingEntity.id, data: payload as ProjectUpdateRequest })
    } else {
      createProjectMutation.mutate({ data: payload as ProjectCreateRequest })
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

  const handleAreaSubmit = (payload: AreaCreateRequest) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateAreaMutation.mutate({ id: editingEntity.id, data: payload })
    } else {
      createAreaMutation.mutate({ data: payload })
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

  const handleBadgeSubmit = (payload: BadgeCreateRequest) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateBadgeMutation.mutate({ id: editingEntity.id, data: payload })
    } else {
      createBadgeMutation.mutate({ data: payload })
    }
  }

  const handleInfrastructureSubmit = (payload: InfrastructureCreateRequest) => {
    setError(null)
    setSuccess(null)
    if (editingEntity && 'id' in editingEntity && editingEntity.id) {
      updateInfrastructureMutation.mutate({ id: editingEntity.id, data: payload })
    } else {
      createInfrastructureMutation.mutate({ data: payload })
    }
  }

  const handleDeleteProjects = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setDeleteLoading(true)

    try {
      for (const id of ids) {
        await deleteProjectMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Project deleted successfully!'
          : `${ids.length} projects deleted successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteLots = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setDeleteLoading(true)

    try {
      for (const id of ids) {
        await deleteLotMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1 ? 'Lot deleted successfully!' : `${ids.length} lots deleted successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteAreas = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setDeleteLoading(true)

    try {
      for (const id of ids) {
        await deleteAreaMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Area deleted successfully!'
          : `${ids.length} areas deleted successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCities = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setDeleteLoading(true)

    try {
      for (const id of ids) {
        await deleteCityMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'City deleted successfully!'
          : `${ids.length} cities deleted successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteBadges = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setDeleteLoading(true)

    try {
      for (const id of ids) {
        await deleteBadgeMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Badge deleted successfully!'
          : `${ids.length} badges deleted successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteDevelopers = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setDeleteLoading(true)

    try {
      for (const id of ids) {
        await deleteDeveloperMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Developer deleted successfully!'
          : `${ids.length} developers deleted successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRestoreDevelopers = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setRestoreLoading(true)

    try {
      for (const id of ids) {
        await restoreDeveloperMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Developer restored successfully!'
          : `${ids.length} developers restored successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleHardDeleteDevelopers = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setHardDeleteLoading(true)

    try {
      for (const id of ids) {
        await hardDeleteDeveloperMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Developer permanently deleted!'
          : `${ids.length} developers permanently deleted!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setHardDeleteLoading(false)
    }
  }

  const handleRestoreProjects = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setRestoreLoading(true)

    try {
      for (const id of ids) {
        await restoreProjectMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Project restored successfully!'
          : `${ids.length} projects restored successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleHardDeleteProjects = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setHardDeleteLoading(true)

    try {
      for (const id of ids) {
        await hardDeleteProjectMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Project permanently deleted!'
          : `${ids.length} projects permanently deleted!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setHardDeleteLoading(false)
    }
  }

  const handleRestoreLots = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setRestoreLoading(true)

    try {
      for (const id of ids) {
        await restoreLotMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Lot restored successfully!'
          : `${ids.length} lots restored successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleHardDeleteLots = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setHardDeleteLoading(true)

    try {
      for (const id of ids) {
        await hardDeleteLotMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1 ? 'Lot permanently deleted!' : `${ids.length} lots permanently deleted!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setHardDeleteLoading(false)
    }
  }

  const handleRestoreAreas = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setRestoreLoading(true)

    try {
      for (const id of ids) {
        await restoreAreaMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Area restored successfully!'
          : `${ids.length} areas restored successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleHardDeleteAreas = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setHardDeleteLoading(true)

    try {
      for (const id of ids) {
        await hardDeleteAreaMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1 ? 'Area permanently deleted!' : `${ids.length} areas permanently deleted!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setHardDeleteLoading(false)
    }
  }

  const handleRestoreCities = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setRestoreLoading(true)

    try {
      for (const id of ids) {
        await restoreCityMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'City restored successfully!'
          : `${ids.length} cities restored successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleHardDeleteCities = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setHardDeleteLoading(true)

    try {
      for (const id of ids) {
        await hardDeleteCityMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1 ? 'City permanently deleted!' : `${ids.length} cities permanently deleted!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setHardDeleteLoading(false)
    }
  }

  const handleRestoreBadges = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setRestoreLoading(true)

    try {
      for (const id of ids) {
        await restoreBadgeMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Badge restored successfully!'
          : `${ids.length} badges restored successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleHardDeleteBadges = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setHardDeleteLoading(true)

    try {
      for (const id of ids) {
        await hardDeleteBadgeMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Badge permanently deleted!'
          : `${ids.length} badges permanently deleted!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setHardDeleteLoading(false)
    }
  }

  const handleDeleteInfrastructures = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setDeleteLoading(true)

    try {
      for (const id of ids) {
        await deleteInfrastructureMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Infrastructure deleted successfully!'
          : `${ids.length} infrastructures deleted successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleRestoreInfrastructures = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setRestoreLoading(true)

    try {
      for (const id of ids) {
        await restoreInfrastructureMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Infrastructure restored successfully!'
          : `${ids.length} infrastructures restored successfully!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleHardDeleteInfrastructures = async (ids: string[]) => {
    setError(null)
    setSuccess(null)
    setHardDeleteLoading(true)

    try {
      for (const id of ids) {
        await hardDeleteInfrastructureMutation.mutateAsync({ id })
      }
      setSuccess(
        ids.length === 1
          ? 'Infrastructure permanently deleted!'
          : `${ids.length} infrastructures permanently deleted!`
      )
    } catch {
      // Error is already handled by mutation onError
    } finally {
      setHardDeleteLoading(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return <FullPageSpinner />
  }

  const getRightSidebarTitle = () => {
    const isEditMode = !!editingEntity
    if (rightSidebarForm === 'developer') return isEditMode ? 'Edit Developer' : 'Create Developer'
    if (rightSidebarForm === 'project') return isEditMode ? 'Edit Project' : 'Create Project'
    if (rightSidebarForm === 'lot') return isEditMode ? 'Edit Lot' : 'Create Lot'
    if (rightSidebarForm === 'area') return isEditMode ? 'Edit Area' : 'Create Area'
    if (rightSidebarForm === 'city') return isEditMode ? 'Edit City' : 'Create City'
    if (rightSidebarForm === 'badge') return isEditMode ? 'Edit Badge' : 'Create Badge'
    if (rightSidebarForm === 'infrastructure')
      return isEditMode ? 'Edit Infrastructure' : 'Create Infrastructure'
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
        can={can}
        isSuperadmin={claims?.role === 'superadmin'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={styles.content}>
        <Routes>
          <Route
            path={ADMIN_ROUTE_SEGMENTS.DEVELOPERS}
            element={
              <>
                <DevelopersTable
                  onNewClick={() => handleNewClick('developer')}
                  onEditClick={developer => handleEditClick(developer, 'developer')}
                  onDelete={handleDeleteDevelopers}
                  deleteLoading={deleteLoading}
                  drafts={formDrafts.filter(d => d.formType === 'developer').map(d => ({ id: d.id, displayName: d.displayName }))}
                  onDraftClick={handleDraftClick}
                  onDraftDiscard={handleDraftDiscard}
                />
                <DeletedDevelopersTable
                  onRestore={handleRestoreDevelopers}
                  onHardDelete={handleHardDeleteDevelopers}
                  restoreLoading={restoreLoading}
                  hardDeleteLoading={hardDeleteLoading}
                />
              </>
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.PROJECTS}
            element={
              <>
                <ProjectsTable
                  onNewClick={() => handleNewClick('project')}
                  onEditClick={project => handleEditClick(project, 'project')}
                  onDelete={handleDeleteProjects}
                  deleteLoading={deleteLoading}
                  drafts={formDrafts.filter(d => d.formType === 'project').map(d => ({ id: d.id, displayName: d.displayName }))}
                  onDraftClick={handleDraftClick}
                  onDraftDiscard={handleDraftDiscard}
                />
                <DeletedProjectsTable
                  onRestore={handleRestoreProjects}
                  onHardDelete={handleHardDeleteProjects}
                  restoreLoading={restoreLoading}
                  hardDeleteLoading={hardDeleteLoading}
                />
              </>
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.LOTS}
            element={
              <>
                <LotsTable
                  onNewClick={() => handleNewClick('lot')}
                  onEditClick={lot => handleEditClick(lot, 'lot')}
                  onDelete={handleDeleteLots}
                  deleteLoading={deleteLoading}
                  drafts={formDrafts.filter(d => d.formType === 'lot').map(d => ({ id: d.id, displayName: d.displayName }))}
                  onDraftClick={handleDraftClick}
                  onDraftDiscard={handleDraftDiscard}
                />
                <DeletedLotsTable
                  onRestore={handleRestoreLots}
                  onHardDelete={handleHardDeleteLots}
                  restoreLoading={restoreLoading}
                  hardDeleteLoading={hardDeleteLoading}
                />
              </>
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.AREAS}
            element={
              <>
                <AreasTable
                  onNewClick={() => handleNewClick('area')}
                  onEditClick={area => handleEditClick(area, 'area')}
                  onDelete={handleDeleteAreas}
                  deleteLoading={deleteLoading}
                  drafts={formDrafts.filter(d => d.formType === 'area').map(d => ({ id: d.id, displayName: d.displayName }))}
                  onDraftClick={handleDraftClick}
                  onDraftDiscard={handleDraftDiscard}
                />
                <DeletedAreasTable
                  onRestore={handleRestoreAreas}
                  onHardDelete={handleHardDeleteAreas}
                  restoreLoading={restoreLoading}
                  hardDeleteLoading={hardDeleteLoading}
                />
              </>
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.CITIES}
            element={
              <>
                <CitiesTable
                  onNewClick={() => handleNewClick('city')}
                  onEditClick={city => handleEditClick(city, 'city')}
                  onDelete={handleDeleteCities}
                  deleteLoading={deleteLoading}
                  drafts={formDrafts.filter(d => d.formType === 'city').map(d => ({ id: d.id, displayName: d.displayName }))}
                  onDraftClick={handleDraftClick}
                  onDraftDiscard={handleDraftDiscard}
                />
                <DeletedCitiesTable
                  onRestore={handleRestoreCities}
                  onHardDelete={handleHardDeleteCities}
                  restoreLoading={restoreLoading}
                  hardDeleteLoading={hardDeleteLoading}
                />
              </>
            }
          />
          <Route
            path={ADMIN_ROUTE_SEGMENTS.BADGES}
            element={
              <>
                <BadgesTable
                  onNewClick={() => handleNewClick('badge')}
                  onEditClick={badge => handleEditClick(badge, 'badge')}
                  onDelete={handleDeleteBadges}
                  deleteLoading={deleteLoading}
                  drafts={formDrafts.filter(d => d.formType === 'badge').map(d => ({ id: d.id, displayName: d.displayName }))}
                  onDraftClick={handleDraftClick}
                  onDraftDiscard={handleDraftDiscard}
                />
                <DeletedBadgesTable
                  onRestore={handleRestoreBadges}
                  onHardDelete={handleHardDeleteBadges}
                  restoreLoading={restoreLoading}
                  hardDeleteLoading={hardDeleteLoading}
                />
              </>
            }
          />

          <Route
            path={ADMIN_ROUTE_SEGMENTS.INFRASTRUCTURES}
            element={
              <>
                <InfrastructuresTable
                  onNewClick={() => handleNewClick('infrastructure')}
                  onEditClick={infrastructure => handleEditClick(infrastructure, 'infrastructure')}
                  onDelete={handleDeleteInfrastructures}
                  deleteLoading={deleteLoading}
                  drafts={formDrafts.filter(d => d.formType === 'infrastructure').map(d => ({ id: d.id, displayName: d.displayName }))}
                  onDraftClick={handleDraftClick}
                  onDraftDiscard={handleDraftDiscard}
                />
                <DeletedInfrastructuresTable
                  onRestore={handleRestoreInfrastructures}
                  onHardDelete={handleHardDeleteInfrastructures}
                  restoreLoading={restoreLoading}
                  hardDeleteLoading={hardDeleteLoading}
                />
              </>
            }
          />

          <Route
            path={ADMIN_ROUTE_SEGMENTS.MEDIA}
            element={
              <MediaTable
                onError={(msg: string) => setError(msg)}
                onSuccess={(msg: string) => setSuccess(msg)}
              />
            }
          />

          <Route path={ADMIN_ROUTE_SEGMENTS.TEAM} element={<TeamPage />} />

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
            draftData={activeDraftData as Parameters<typeof DeveloperForm>[0]['draftData']}
            onDataChange={handleFormDataChange}
          />
        )}

        {rightSidebarForm === 'project' && (
          <ProjectForm
            key={formKey}
            developers={developers}
            areas={areas}
            cities={cities}
            badges={badges}
            infrastructures={infrastructures}
            onSubmit={handleProjectSubmit}
            loading={loading}
            initialData={isEditMode && 'slug' in editingEntity ? (editingEntity as Project) : null}
            isEditMode={isEditMode}
            draftData={activeDraftData as Parameters<typeof ProjectForm>[0]['draftData']}
            onDataChange={handleFormDataChange}
          />
        )}
        {rightSidebarForm === 'lot' && (
          <LotForm
            key={formKey}
            projects={projects}
            badges={badges}
            onSubmit={handleLotSubmit}
            loading={loading}
            initialData={
              isEditMode && 'projectId' in editingEntity ? (editingEntity as LotListItem) : null
            }
            isEditMode={isEditMode}
            draftData={activeDraftData as Parameters<typeof LotForm>[0]['draftData']}
            onDataChange={handleFormDataChange}
          />
        )}
        {rightSidebarForm === 'area' && (
          <AreaForm
            key={formKey}
            onSubmit={handleAreaSubmit}
            loading={loading}
            initialData={isEditMode && 'slug' in editingEntity ? (editingEntity as Area) : null}
            isEditMode={isEditMode}
            cities={cities}
            draftData={activeDraftData as Parameters<typeof AreaForm>[0]['draftData']}
            onDataChange={handleFormDataChange}
          />
        )}
        {rightSidebarForm === 'city' && (
          <CityForm
            key={formKey}
            onSubmit={handleCitySubmit}
            loading={loading}
            initialData={isEditMode && 'slug' in editingEntity ? (editingEntity as City) : null}
            isEditMode={isEditMode}
            draftData={activeDraftData as Parameters<typeof CityForm>[0]['draftData']}
            onDataChange={handleFormDataChange}
          />
        )}
        {rightSidebarForm === 'badge' && (
          <BadgeForm
            key={formKey}
            onSubmit={handleBadgeSubmit}
            loading={loading}
            initialData={isEditMode && 'slug' in editingEntity ? (editingEntity as Badge) : null}
            isEditMode={isEditMode}
            draftData={activeDraftData as Parameters<typeof BadgeForm>[0]['draftData']}
            onDataChange={handleFormDataChange}
          />
        )}
        {rightSidebarForm === 'infrastructure' && (
          <InfrastructureForm
            key={formKey}
            onSubmit={handleInfrastructureSubmit}
            loading={loading}
            initialData={
              isEditMode && 'slug' in editingEntity ? (editingEntity as Infrastructure) : null
            }
            isEditMode={isEditMode}
            draftData={activeDraftData as Parameters<typeof InfrastructureForm>[0]['draftData']}
            onDataChange={handleFormDataChange}
          />
        )}
      </RightSidebar>

      <Toast open={!!success} onClose={() => setSuccess(null)} variant="success" duration={3000}>
        {success}
      </Toast>

      <Toast open={!!error} onClose={() => setError(null)} variant="error" duration={5000}>
        {error}
      </Toast>

      <Modal open={saveForSessionOpen} onClose={handleDiscardSession} title="Unsaved Changes">
        <ModalBody>
          <p>You have unsaved changes. Save them for this session?</p>
          {pendingDraft && <p><strong>{pendingDraft.displayName}</strong></p>}
        </ModalBody>
        <ModalFooter>
          <UIButton variant="secondary" onClick={handleDiscardSession}>No, discard</UIButton>
          <UIButton variant="primary" onClick={handleSaveForSession}>Yes, save</UIButton>
        </ModalFooter>
      </Modal>

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
