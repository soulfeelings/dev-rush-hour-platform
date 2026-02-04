import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Select } from '../../../../ui'
import { type CityCreateRequest, type City } from '../../../../api'
import styles from './CityForm.module.scss'

const STORAGE_KEY = 'admin_city_form_draft'

type CityFormProps = {
  onSubmit: (data: CityCreateRequest) => void
  loading: boolean
  initialData?: City | null
  isEditMode?: boolean
}

type ValidationErrors = {
  status?: string
}

type FormData = {
  slug: string
  name: string
  status: string
}

export function CityForm({ onSubmit, loading, initialData, isEditMode = false }: CityFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      status: '',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        status: (initialData.status as string) || '',
      }
    }
    // Load from localStorage for new forms
    if (!isEditMode) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) {
          return JSON.parse(cached) as FormData
        }
      } catch {
        // Ignore parse errors
      }
    }
    return defaultForm
  }, [initialData, defaultForm, isEditMode])

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  // Cache form data to localStorage for new forms
  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    }
  }, [form, isEditMode])

  const clearCache = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const initialFormData = useMemo(() => {
    if (!initialData) return null
    return {
      slug: initialData.slug || '',
      name: initialData.name || '',
      status: (initialData.status as string) || '',
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

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState(false)

  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    if (!form.status) {
      newErrors.status = 'Status is required'
    }
    return newErrors
  }

  useEffect(() => {
    if (touched) {
      setErrors(validate())
    }
  }, [form, touched])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }
    const payload: CityCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: form.status as 'active' | 'inactive',
    }
    if (!isEditMode) {
      clearCache()
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
          { value: '', label: 'Select Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
        error={errors.status}
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
