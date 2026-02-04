import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Select } from '../../../../ui'
import type { BadgeCreateRequest } from '../../../../api/generated/schemas/badgeCreateRequest'
import type { Badge } from '../../../../api/generated/schemas/badge'
import styles from './BadgeForm.module.scss'

const STORAGE_KEY = 'admin_badge_form_draft'

type BadgeFormProps = {
  onSubmit: (data: BadgeCreateRequest) => void
  loading: boolean
  initialData?: Badge | null
  isEditMode?: boolean
}

type ValidationErrors = {
  backgroundColor?: string
  textColor?: string
  status?: string
  sortOrder?: string
}

type FormData = {
  slug: string
  name: string
  backgroundColor: string
  textColor: string
  icon: string
  status: string
  sortOrder: string
}

export function BadgeForm({ onSubmit, loading, initialData, isEditMode = false }: BadgeFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      backgroundColor: '',
      textColor: '',
      icon: '',
      status: '',
      sortOrder: '',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        backgroundColor: initialData.backgroundColor || '',
        textColor: initialData.textColor || '',
        icon: initialData.icon || '',
        status: (initialData.status as string) || '',
        sortOrder: initialData.sortOrder?.toString() || '',
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
      backgroundColor: initialData.backgroundColor || '',
      textColor: initialData.textColor || '',
      icon: initialData.icon || '',
      status: (initialData.status as string) || '',
      sortOrder: initialData.sortOrder?.toString() || '',
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return (
      form.slug !== initialFormData.slug ||
      form.name !== initialFormData.name ||
      form.backgroundColor !== initialFormData.backgroundColor ||
      form.textColor !== initialFormData.textColor ||
      form.icon !== initialFormData.icon ||
      form.status !== initialFormData.status ||
      form.sortOrder !== initialFormData.sortOrder
    )
  }, [form, initialFormData, isEditMode])

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState(false)

  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    if (!form.backgroundColor) {
      newErrors.backgroundColor = 'Background color is required'
    }
    if (!form.textColor) {
      newErrors.textColor = 'Text color is required'
    }
    if (!form.status) {
      newErrors.status = 'Status is required'
    }
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
    const payload: BadgeCreateRequest = {
      slug: form.slug,
      name: form.name,
      backgroundColor: form.backgroundColor,
      textColor: form.textColor,
      icon: form.icon || undefined,
      status: form.status as 'active' | 'inactive',
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
        label="Slug"
        value={form.slug}
        onChange={e => setForm({ ...form, slug: e.target.value })}
        required
        placeholder="e.g., special-price"
      />
      <Input
        label="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
        placeholder="e.g., Special Price"
      />

      <div className={styles.colorRow}>
        <div className={styles.colorField}>
          <label className={styles.colorLabel}>Background Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={form.backgroundColor || '#000000'}
              onChange={e => setForm({ ...form, backgroundColor: e.target.value })}
              className={styles.colorPicker}
            />
            <Input
              value={form.backgroundColor}
              onChange={e => setForm({ ...form, backgroundColor: e.target.value })}
              placeholder="#25D366"
              error={errors.backgroundColor}
              required
            />
          </div>
        </div>
        <div className={styles.colorField}>
          <label className={styles.colorLabel}>Text Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={form.textColor || '#FFFFFF'}
              onChange={e => setForm({ ...form, textColor: e.target.value })}
              className={styles.colorPicker}
            />
            <Input
              value={form.textColor}
              onChange={e => setForm({ ...form, textColor: e.target.value })}
              placeholder="#FFFFFF"
              error={errors.textColor}
              required
            />
          </div>
        </div>
      </div>

      <div className={styles.previewSection}>
        <label className={styles.colorLabel}>Preview</label>
        <span
          className={styles.badgePreview}
          style={{
            backgroundColor: form.backgroundColor,
            color: form.textColor,
          }}
        >
          {form.name || 'Badge Preview'}
        </span>
      </div>

      <Input
        label="Icon (optional)"
        value={form.icon}
        onChange={e => setForm({ ...form, icon: e.target.value })}
        placeholder="e.g., gift, tag, star"
      />

      <Input
        label="Sort Order"
        type="number"
        value={form.sortOrder}
        onChange={e => setForm({ ...form, sortOrder: e.target.value })}
        error={errors.sortOrder}
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
        {loading
          ? isEditMode
            ? 'Saving...'
            : 'Creating...'
          : isEditMode
            ? 'Save'
            : 'Create Badge'}
      </Button>
    </form>
  )
}
