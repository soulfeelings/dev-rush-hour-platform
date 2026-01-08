import { useState, useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LogOut } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Input, Select } from '../../ui'
import { getAdminKey, setAdminKey, removeAdminKey } from '../../utils/adminApi'
import { AdminApi, type DeveloperCreateRequest, type ProjectCreateRequest } from '../../api'

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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAdminKey())

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

  const [projectForm, setProjectForm] = useState({
    slug: '',
    name: '',
    status: 'active',
    sale: 'sale',
    developerId: '',
    areaId: '',
    lat: '',
    lng: '',
  })

  const [developerForm, setDeveloperForm] = useState({
    slug: '',
    name: '',
    status: 'active',
  })

  const [lotForm, setLotForm] = useState({
    projectId: '',
    developerId: '',
    areaId: '',
    type: 'apartment',
    status: 'active',
    bedrooms: '',
    bathrooms: '',
    areaSqm: '',
    floor: '',
    priceCurrency: 'AED',
    priceAmount: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const createDeveloperMutation = useAdminCreateDeveloper({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/admin/developers'] })
        setSuccess('Developer created successfully!')
        setDeveloperForm({
          slug: '',
          name: '',
          status: 'active',
        })
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
        setProjectForm({
          slug: '',
          name: '',
          status: 'active',
          sale: 'sale',
          developerId: '',
          areaId: '',
          lat: '',
          lng: '',
        })
        if (markerRef.current) {
          markerRef.current.remove()
        }
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
        setLotForm({
          projectId: '',
          developerId: '',
          areaId: '',
          type: 'apartment',
          status: 'active',
          bedrooms: '',
          bathrooms: '',
          areaSqm: '',
          floor: '',
          priceCurrency: 'AED',
          priceAmount: '',
        })
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

  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (activeTab !== 'project' || !mapContainerRef.current) {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }

    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [25.2048, 55.2708],
        zoom: 11,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      mapRef.current.on('click', e => {
        const { lat, lng } = e.latlng
        setProjectForm(prev => ({
          ...prev,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        }))
      })
    }

    const map = mapRef.current
    if (!map) return

    if (projectForm.lat && projectForm.lng) {
      const lat = parseFloat(projectForm.lat)
      const lng = parseFloat(projectForm.lng)

      if (!isNaN(lat) && !isNaN(lng)) {
        const coordinates: [number, number] = [lat, lng]

        if (!markerRef.current) {
          markerRef.current = L.marker(coordinates, {
            icon: L.icon({
              iconUrl:
                'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl:
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
            draggable: true,
          }).addTo(map)

          markerRef.current.on('dragend', e => {
            const pos = e.target.getLatLng()
            setProjectForm(prev => ({
              ...prev,
              lat: pos.lat.toFixed(6),
              lng: pos.lng.toFixed(6),
            }))
          })
        } else {
          const currentPos = markerRef.current.getLatLng()
          if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
            markerRef.current.setLatLng(coordinates)
            map.setView(coordinates, Math.max(map.getZoom(), 13))
          }
        }
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [activeTab, projectForm.lat, projectForm.lng])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (username === 'admin' && password === 'admin') {
      const adminKey = import.meta.env.VITE_ADMIN_KEY || 'admin-key'
      setAdminKey(adminKey)
      setIsAuthenticated(true)
      setUsername('')
      setPassword('')
    } else {
      setError('Invalid username or password')
    }
  }

  const handleLogout = () => {
    removeAdminKey()
    setIsAuthenticated(false)
    setError(null)
    setSuccess(null)
    setDeveloperForm({
      slug: '',
      name: '',
      status: 'active',
    })
    setProjectForm({
      slug: '',
      name: '',
      status: 'active',
      sale: 'sale',
      developerId: '',
      areaId: '',
      lat: '',
      lng: '',
    })
    setLotForm({
      projectId: '',
      developerId: '',
      areaId: '',
      type: 'apartment',
      status: 'active',
      bedrooms: '',
      bathrooms: '',
      areaSqm: '',
      floor: '',
      priceCurrency: 'AED',
      priceAmount: '',
    })
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
    if (markerRef.current) {
      markerRef.current.remove()
    }
  }

  // Данные загружаются автоматически через react-query хуки

  const handleDeveloperSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const payload: DeveloperCreateRequest = {
      slug: developerForm.slug,
      name: developerForm.name,
      status: developerForm.status as 'active' | 'inactive',
    }

    createDeveloperMutation.mutate({ data: payload })
  }

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const payload: ProjectCreateRequest = {
      slug: projectForm.slug,
      name: projectForm.name,
      status: projectForm.status as 'active' | 'archived',
      sale: projectForm.sale as 'sale' | 'start of sales' | 'sales announcement',
      ...(projectForm.developerId && { developerId: projectForm.developerId }),
      ...(projectForm.areaId && { areaId: projectForm.areaId }),
      ...(projectForm.lat && { lat: parseFloat(projectForm.lat) }),
      ...(projectForm.lng && { lng: parseFloat(projectForm.lng) }),
    }

    createProjectMutation.mutate({ data: payload })
  }

  const handleLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const payload: Record<string, unknown> = {
        projectId: lotForm.projectId,
        type: lotForm.type,
        status: lotForm.status,
        priceCurrency: lotForm.priceCurrency,
        priceAmount: parseFloat(lotForm.priceAmount),
      }

      if (lotForm.developerId) {
        payload.developerId = lotForm.developerId
      }
      if (lotForm.areaId) {
        payload.areaId = lotForm.areaId
      }
      if (lotForm.bedrooms) {
        payload.bedrooms = parseInt(lotForm.bedrooms, 10)
      }
      if (lotForm.bathrooms) {
        payload.bathrooms = parseInt(lotForm.bathrooms, 10)
      }
      if (lotForm.areaSqm) {
        payload.areaSqm = parseFloat(lotForm.areaSqm)
      }
      if (lotForm.floor) {
        payload.floor = parseInt(lotForm.floor, 10)
      }

      setSuccess('Lot created successfully!')
      setLotForm({
        projectId: '',
        developerId: '',
        areaId: '',
        type: 'apartment',
        status: 'active',
        bedrooms: '',
        bathrooms: '',
        areaSqm: '',
        floor: '',
        priceCurrency: 'AED',
        priceAmount: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lot')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.admin}>
        <div className={styles.authForm}>
          <h1>Admin Access</h1>
          <form onSubmit={handleAuth}>
            <Input
              type="text"
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="username"
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
            {error && <div className={styles.error}>{error}</div>}
            <Button type="submit" fullWidth>
              Login
            </Button>
          </form>
        </div>
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

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'developer' ? styles.active : ''}`}
            onClick={() => setActiveTab('developer')}
          >
            Create Developer
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'project' ? styles.active : ''}`}
            onClick={() => setActiveTab('project')}
          >
            Create Project
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'lot' ? styles.active : ''}`}
            onClick={() => setActiveTab('lot')}
          >
            Create Lot
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {activeTab === 'developer' && (
          <form onSubmit={handleDeveloperSubmit} className={styles.form}>
            <Input
              label="Slug"
              value={developerForm.slug}
              onChange={e => setDeveloperForm({ ...developerForm, slug: e.target.value })}
              required
            />
            <Input
              label="Name"
              value={developerForm.name}
              onChange={e => setDeveloperForm({ ...developerForm, name: e.target.value })}
              required
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              value={developerForm.status}
              onChange={value => setDeveloperForm({ ...developerForm, status: value })}
            />
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Creating...' : 'Create Developer'}
            </Button>
          </form>
        )}

        {activeTab === 'project' && (
          <form onSubmit={handleProjectSubmit} className={styles.form}>
            <Input
              label="Slug"
              value={projectForm.slug}
              onChange={e => setProjectForm({ ...projectForm, slug: e.target.value })}
              required
            />
            <Input
              label="Name"
              value={projectForm.name}
              onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
              required
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
              value={projectForm.status}
              onChange={value => setProjectForm({ ...projectForm, status: value })}
            />
            <Select
              label="Sale Status"
              options={[
                { value: 'sale', label: 'Sale' },
                { value: 'start of sales', label: 'Start of Sales' },
                { value: 'sales announcement', label: 'Sales Announcement' },
              ]}
              value={projectForm.sale}
              onChange={value => setProjectForm({ ...projectForm, sale: value })}
            />
            <Select
              label="Developer"
              options={[
                { value: '', label: 'None' },
                ...developers.map(d => ({ value: d.id || '', label: d.name || '' })),
              ]}
              value={projectForm.developerId}
              onChange={value => setProjectForm({ ...projectForm, developerId: value })}
            />
            <Select
              label="Area"
              options={[
                { value: '', label: 'None' },
                ...areas.map(a => ({ value: a.id || '', label: a.name || '' })),
              ]}
              value={projectForm.areaId}
              onChange={value => setProjectForm({ ...projectForm, areaId: value })}
            />
            <div>
              <label className={styles.mapLabel}>Location (click on map to set coordinates)</label>
              <div ref={mapContainerRef} className={styles.map} />
            </div>
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={projectForm.lat}
              onChange={e => setProjectForm({ ...projectForm, lat: e.target.value })}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={projectForm.lng}
              onChange={e => setProjectForm({ ...projectForm, lng: e.target.value })}
            />
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </form>
        )}

        {activeTab === 'lot' && (
          <form onSubmit={handleLotSubmit} className={styles.form}>
            <Select
              label="Project"
              options={[
                { value: '', label: 'Select Project' },
                ...projects.map(p => ({ value: p.id || '', label: p.name || '' })),
              ]}
              value={lotForm.projectId}
              onChange={value => setLotForm({ ...lotForm, projectId: value })}
            />
            <Select
              label="Type"
              options={[
                { value: 'apartment', label: 'Apartment' },
                { value: 'villa', label: 'Villa' },
                { value: 'townhouse', label: 'Townhouse' },
                { value: 'penthouse', label: 'Penthouse' },
              ]}
              value={lotForm.type}
              onChange={value => setLotForm({ ...lotForm, type: value })}
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'hidden', label: 'Hidden' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'sold', label: 'Sold' },
              ]}
              value={lotForm.status}
              onChange={value => setLotForm({ ...lotForm, status: value })}
            />
            <Input
              label="Price Amount (AED)"
              type="number"
              step="any"
              value={lotForm.priceAmount}
              onChange={e => setLotForm({ ...lotForm, priceAmount: e.target.value })}
              required
            />
            <Input
              label="Bedrooms"
              type="number"
              value={lotForm.bedrooms}
              onChange={e => setLotForm({ ...lotForm, bedrooms: e.target.value })}
            />
            <Input
              label="Bathrooms"
              type="number"
              value={lotForm.bathrooms}
              onChange={e => setLotForm({ ...lotForm, bathrooms: e.target.value })}
            />
            <Input
              label="Area (sqm)"
              type="number"
              step="any"
              value={lotForm.areaSqm}
              onChange={e => setLotForm({ ...lotForm, areaSqm: e.target.value })}
            />
            <Input
              label="Floor"
              type="number"
              value={lotForm.floor}
              onChange={e => setLotForm({ ...lotForm, floor: e.target.value })}
            />
            <Select
              label="Developer"
              options={[
                { value: '', label: 'None' },
                ...developers.map(d => ({ value: d.id || '', label: d.name || '' })),
              ]}
              value={lotForm.developerId}
              onChange={value => setLotForm({ ...lotForm, developerId: value })}
            />
            <Select
              label="Area"
              options={[
                { value: '', label: 'None' },
                ...areas.map(a => ({ value: a.id || '', label: a.name || '' })),
              ]}
              value={lotForm.areaId}
              onChange={value => setLotForm({ ...lotForm, areaId: value })}
            />
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Creating...' : 'Create Lot'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
