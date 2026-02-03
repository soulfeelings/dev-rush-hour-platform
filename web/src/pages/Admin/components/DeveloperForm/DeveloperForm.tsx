import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input } from '../../../../ui'
import { type DeveloperCreateRequest, type Developer } from '../../../../api'
import { generateSlug } from '../../../../utils/generateSlug'
import styles from './DeveloperForm.module.scss'

const STORAGE_KEY = 'admin_developer_form_draft'

type DeveloperFormProps = {
  onSubmit: (data: DeveloperCreateRequest) => void
  loading: boolean
  initialData?: Developer | null
  isEditMode?: boolean
}

type DeveloperDataFields = {
  logoUrl?: string
}

type FormData = {
  slug: string
  name: string
  logoUrl: string
}

export function DeveloperForm({
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: DeveloperFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      logoUrl: '',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      const dataFields = initialData.data as DeveloperDataFields | undefined
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        logoUrl: dataFields?.logoUrl || '',
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
    const dataFields = initialData.data as DeveloperDataFields | undefined
    return {
      slug: initialData.slug || '',
      name: initialData.name || '',
      logoUrl: dataFields?.logoUrl || '',
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return (
      form.slug !== initialFormData.slug ||
      form.name !== initialFormData.name ||
      form.logoUrl !== initialFormData.logoUrl
    )
  }, [form, initialFormData, isEditMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: DeveloperCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: 'active',
      data: {
        logoUrl: form.logoUrl || undefined,
      },
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
      <Input
        label="Logo URL"
        value={form.logoUrl}
        onChange={e => setForm({ ...form, logoUrl: e.target.value })}
        placeholder="https://example.com/logo.png"
      />
      {form.logoUrl && (
        <div className={styles.logoPreview}>
          <span className={styles.logoPreviewLabel}>Logo Preview:</span>
          <img
            src={form.logoUrl}
            alt="Developer logo preview"
            className={styles.logoPreviewImage}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
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
            : 'Create Developer'}
      </Button>
    </form>
  )
}
