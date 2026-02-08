import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input } from '../../../../ui'
import { generateSlug } from '../../../../utils/generateSlug'
import type { InfrastructureCreateRequest } from '../../../../api/generated/schemas/infrastructureCreateRequest'
import type { Infrastructure } from '../../../../api/generated/schemas/infrastructure'
import styles from './InfrastructureForm.module.scss'

const STORAGE_KEY = 'admin_infrastructure_form_draft'

type InfrastructureFormProps = {
  onSubmit: (data: InfrastructureCreateRequest) => void
  loading: boolean
  initialData?: Infrastructure | null
  isEditMode?: boolean
}

type ValidationErrors = {
  sortOrder?: string
}

type FormData = {
  slug: string
  name: string
  icon: string
  sortOrder: string
}

export function InfrastructureForm({
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: InfrastructureFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      icon: '',
      sortOrder: '',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        icon: initialData.icon || '',
        sortOrder: initialData.sortOrder?.toString() || '',
      }
    }
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
      icon: initialData.icon || '',
      sortOrder: initialData.sortOrder?.toString() || '',
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return (
      form.slug !== initialFormData.slug ||
      form.name !== initialFormData.name ||
      form.icon !== initialFormData.icon ||
      form.sortOrder !== initialFormData.sortOrder
    )
  }, [form, initialFormData, isEditMode])

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState(false)

  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    if (form.sortOrder === '') {
      newErrors.sortOrder = 'Sort order is required'
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
    const payload: InfrastructureCreateRequest = {
      slug: form.slug,
      name: form.name,
      icon: form.icon || undefined,
      sortOrder: parseInt(form.sortOrder, 10),
    }
    if (!isEditMode) {
      clearCache()
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Name"
        value={form.name}
        onChange={e => {
          const newName = e.target.value
          setForm({ ...form, name: newName, slug: generateSlug(newName) })
        }}
        required
        placeholder="e.g., Swimming Pool"
      />
      <Input label="Slug" value={form.slug} disabled />

      <Input
        label="Icon (optional)"
        value={form.icon}
        onChange={e => setForm({ ...form, icon: e.target.value })}
        placeholder="e.g., pool, gym, parking"
      />

      <Input
        label="Sort Order"
        type="number"
        value={form.sortOrder}
        onChange={e => setForm({ ...form, sortOrder: e.target.value })}
        error={errors.sortOrder}
        required
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
            : 'Create Infrastructure'}
      </Button>
    </form>
  )
}
