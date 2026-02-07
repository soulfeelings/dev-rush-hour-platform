import { useEffect, useMemo, useState, useCallback } from 'react'
import { Button, Input } from '../../../../ui'
import { generateSlug } from '../../../../utils/generateSlug'
import { type CityCreateRequest, type City } from '../../../../api'
import styles from './CityForm.module.scss'

const STORAGE_KEY = 'admin_city_form_draft'

type CityFormProps = {
  onSubmit: (data: CityCreateRequest) => void
  loading: boolean
  initialData?: City | null
  isEditMode?: boolean
}

type FormData = {
  slug: string
  name: string
}

export function CityForm({ onSubmit, loading, initialData, isEditMode = false }: CityFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
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
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return form.slug !== initialFormData.slug || form.name !== initialFormData.name
  }, [form, initialFormData, isEditMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CityCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: 'active',
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
      />
      <Input label="Slug" value={form.slug} disabled />
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
