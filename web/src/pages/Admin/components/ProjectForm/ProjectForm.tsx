import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select } from '../../../../ui'
import { type ProjectCreateRequest, type Project } from '../../../../api'
import { MapPicker } from '../MapPicker'
import styles from './ProjectForm.module.scss'

type Developer = {
  id?: string
  name?: string
}

type Area = {
  id?: string
  name?: string
}

type ProjectFormProps = {
  developers: Developer[]
  areas: Area[]
  onSubmit: (data: ProjectCreateRequest) => void
  loading: boolean
  initialData?: Project | null
  isEditMode?: boolean
}

export function ProjectForm({
  developers,
  areas,
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: ProjectFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      status: 'active',
      sale: 'sale',
      developerId: '',
      areaId: '',
      lat: '',
      lng: '',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        status: (initialData.status as string) || 'active',
        sale: (initialData.sale as string) || 'sale',
        developerId: initialData.developerId || '',
        areaId: initialData.areaId || '',
        lat: initialData.lat?.toString() || '',
        lng: initialData.lng?.toString() || '',
      }
    }
    return defaultForm
  }, [initialData, defaultForm])

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const initialFormData = useMemo(() => {
    if (!initialData) return null
    return {
      slug: initialData.slug || '',
      name: initialData.name || '',
      status: (initialData.status as string) || 'active',
      sale: (initialData.sale as string) || 'sale',
      developerId: initialData.developerId || '',
      areaId: initialData.areaId || '',
      lat: initialData.lat?.toString() || '',
      lng: initialData.lng?.toString() || '',
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return (
      form.slug !== initialFormData.slug ||
      form.name !== initialFormData.name ||
      form.status !== initialFormData.status ||
      form.sale !== initialFormData.sale ||
      form.developerId !== initialFormData.developerId ||
      form.areaId !== initialFormData.areaId ||
      form.lat !== initialFormData.lat ||
      form.lng !== initialFormData.lng
    )
  }, [form, initialFormData, isEditMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: ProjectCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: form.status as 'active' | 'archived',
      sale: form.sale as 'sale' | 'start of sales' | 'sales announcement',
      ...(form.developerId && { developerId: form.developerId }),
      ...(form.areaId && { areaId: form.areaId }),
      ...(form.lat && { lat: parseFloat(form.lat) }),
      ...(form.lng && { lng: parseFloat(form.lng) }),
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Slug"
        value={form.slug}
        onChange={e => setForm({ ...form, slug: e.target.value })}
        required
      />
      <Input
        label="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
      />
      <Select
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
      />
      <Select
        label="Sale Status"
        options={[
          { value: 'sale', label: 'Sale' },
          { value: 'start of sales', label: 'Start of Sales' },
          { value: 'sales announcement', label: 'Sales Announcement' },
        ]}
        value={form.sale}
        onChange={value => setForm({ ...form, sale: value })}
      />
      <Select
        label="Developer"
        options={[
          { value: '', label: 'None' },
          ...developers.map(d => ({ value: d.id || '', label: d.name || '' })),
        ]}
        value={form.developerId}
        onChange={value => setForm({ ...form, developerId: value })}
      />
      <Select
        label="Area"
        options={[
          { value: '', label: 'None' },
          ...areas.map(a => ({ value: a.id || '', label: a.name || '' })),
        ]}
        value={form.areaId}
        onChange={value => setForm({ ...form, areaId: value })}
      />
      <MapPicker
        lat={form.lat}
        lng={form.lng}
        onCoordinatesChange={(lat, lng) => setForm({ ...form, lat, lng })}
      />
      <Input
        label="Latitude"
        type="number"
        step="any"
        value={form.lat}
        onChange={e => setForm({ ...form, lat: e.target.value })}
      />
      <Input
        label="Longitude"
        type="number"
        step="any"
        value={form.lng}
        onChange={e => setForm({ ...form, lng: e.target.value })}
      />
      <Button
        type="submit"
        disabled={loading || (isEditMode && !hasChanges)}
        fullWidth
        className={isEditMode && hasChanges ? styles.saveButton : ''}
      >
        {loading
          ? isEditMode
            ? 'Saving...'
            : 'Creating...'
          : isEditMode
            ? 'Save'
            : 'Create Project'}
      </Button>
    </form>
  )
}
