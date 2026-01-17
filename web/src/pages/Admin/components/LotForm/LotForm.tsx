import { useState } from 'react'
import { Button, Input, Select } from '../../../../ui'
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
}

export function LotForm({ projects, developers, areas, onSubmit, loading }: LotFormProps) {
  const [form, setForm] = useState<LotFormData>({
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
      <Button type="submit" disabled={loading} fullWidth>
        {loading ? 'Creating...' : 'Create Lot'}
      </Button>
    </form>
  )
}
