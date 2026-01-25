import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select } from '../../../../ui'
import { type CityCreateRequest, type City } from '../../../../api'
import styles from './CityForm.module.scss'

type CityFormProps = {
  onSubmit: (data: CityCreateRequest) => void
  loading: boolean
  initialData?: City | null
  isEditMode?: boolean
}

export function CityForm({ onSubmit, loading, initialData, isEditMode = false }: CityFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      status: 'active',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        status: (initialData.status as string) || 'active',
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
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return (
      form.slug !== initialFormData.slug ||
      form.name !== initialFormData.name ||
      form.status !== initialFormData.status
    )
  }, [form, initialFormData, isEditMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CityCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: form.status as 'active' | 'inactive',
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
          { value: 'inactive', label: 'Inactive' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
      />
      <Button
        type="submit"
        disabled={loading || (isEditMode && !hasChanges)}
        fullWidth
        className={isEditMode && hasChanges ? styles.saveButton : ''}
      >
        {loading ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create City'}
      </Button>
    </form>
  )
}
