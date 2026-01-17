import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select } from '../../../../ui'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import styles from './LotForm.module.scss'

type Project = {
  id?: string
  name?: string
}

type Developer = {
  id?: string
  name?: string
}

type Area = {
  id?: string
  name?: string
}

type LotFormData = {
  projectId: string
  developerId: string
  areaId: string
  type: string
  status: string
  bedrooms: string
  bathrooms: string
  areaSqm: string
  floor: string
  priceCurrency: string
  priceAmount: string
}

type LotFormProps = {
  projects: Project[]
  developers: Developer[]
  areas: Area[]
  onSubmit: (data: Record<string, unknown>) => void
  loading: boolean
  initialData?: LotListItem | null
  isEditMode?: boolean
}

export function LotForm({
  projects,
  developers,
  areas,
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: LotFormProps) {
  const defaultForm = useMemo<LotFormData>(
    () => ({
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
    }),
    []
  )

  const initialForm = useMemo<LotFormData>(() => {
    if (initialData) {
      return {
        projectId: initialData.projectId || '',
        developerId: initialData.developerId || '',
        areaId: initialData.areaId || '',
        type: (initialData.type as string) || 'apartment',
        status: (initialData.status as string) || 'active',
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        areaSqm: initialData.areaSqm?.toString() || '',
        floor: initialData.floor?.toString() || '',
        priceCurrency: initialData.priceCurrency || 'AED',
        priceAmount: initialData.priceAmount?.toString() || '',
      }
    }
    return defaultForm
  }, [initialData, defaultForm])

  const [form, setForm] = useState<LotFormData>(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const initialFormData = useMemo(() => {
    if (!initialData) return null
    return {
      projectId: initialData.projectId || '',
      developerId: initialData.developerId || '',
      areaId: initialData.areaId || '',
      type: (initialData.type as string) || 'apartment',
      status: (initialData.status as string) || 'active',
      bedrooms: initialData.bedrooms?.toString() || '',
      bathrooms: initialData.bathrooms?.toString() || '',
      areaSqm: initialData.areaSqm?.toString() || '',
      floor: initialData.floor?.toString() || '',
      priceCurrency: initialData.priceCurrency || 'AED',
      priceAmount: initialData.priceAmount?.toString() || '',
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return (
      form.projectId !== initialFormData.projectId ||
      form.developerId !== initialFormData.developerId ||
      form.areaId !== initialFormData.areaId ||
      form.type !== initialFormData.type ||
      form.status !== initialFormData.status ||
      form.bedrooms !== initialFormData.bedrooms ||
      form.bathrooms !== initialFormData.bathrooms ||
      form.areaSqm !== initialFormData.areaSqm ||
      form.floor !== initialFormData.floor ||
      form.priceCurrency !== initialFormData.priceCurrency ||
      form.priceAmount !== initialFormData.priceAmount
    )
  }, [form, initialFormData, isEditMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {
      projectId: form.projectId,
      type: form.type,
      status: form.status,
      priceCurrency: form.priceCurrency,
      priceAmount: parseFloat(form.priceAmount),
    }

    if (form.developerId) {
      payload.developerId = form.developerId
    }
    if (form.areaId) {
      payload.areaId = form.areaId
    }
    if (form.bedrooms) {
      payload.bedrooms = parseInt(form.bedrooms, 10)
    }
    if (form.bathrooms) {
      payload.bathrooms = parseInt(form.bathrooms, 10)
    }
    if (form.areaSqm) {
      payload.areaSqm = parseFloat(form.areaSqm)
    }
    if (form.floor) {
      payload.floor = parseInt(form.floor, 10)
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Select
        label="Project"
        options={[
          { value: '', label: 'Select Project' },
          ...projects.map(p => ({ value: p.id || '', label: p.name || '' })),
        ]}
        value={form.projectId}
        onChange={value => setForm({ ...form, projectId: value })}
      />
      <Select
        label="Type"
        options={[
          { value: 'apartment', label: 'Apartment' },
          { value: 'villa', label: 'Villa' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'penthouse', label: 'Penthouse' },
        ]}
        value={form.type}
        onChange={value => setForm({ ...form, type: value })}
      />
      <Select
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'hidden', label: 'Hidden' },
          { value: 'reserved', label: 'Reserved' },
          { value: 'sold', label: 'Sold' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
      />
      <Input
        label="Price Amount (AED)"
        type="number"
        step="any"
        value={form.priceAmount}
        onChange={e => setForm({ ...form, priceAmount: e.target.value })}
        required
      />
      <Input
        label="Bedrooms"
        type="number"
        value={form.bedrooms}
        onChange={e => setForm({ ...form, bedrooms: e.target.value })}
      />
      <Input
        label="Bathrooms"
        type="number"
        value={form.bathrooms}
        onChange={e => setForm({ ...form, bathrooms: e.target.value })}
      />
      <Input
        label="Area (sqm)"
        type="number"
        step="any"
        value={form.areaSqm}
        onChange={e => setForm({ ...form, areaSqm: e.target.value })}
      />
      <Input
        label="Floor"
        type="number"
        value={form.floor}
        onChange={e => setForm({ ...form, floor: e.target.value })}
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
      <Button
        type="submit"
        disabled={loading || (isEditMode && !hasChanges)}
        fullWidth
        className={isEditMode && hasChanges ? styles.saveButton : ''}
      >
        {loading ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create Lot'}
      </Button>
    </form>
  )
}
