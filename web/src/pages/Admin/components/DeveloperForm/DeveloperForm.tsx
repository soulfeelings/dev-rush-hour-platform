import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input } from '../../../../ui'
import { Image as ImageIcon } from 'lucide-react'
import { type DeveloperCreateRequest, type Developer } from '../../../../api'
import { MediaPicker } from '../MediaPicker'
import { generateSlug } from '../../../../utils/generateSlug'
import styles from './DeveloperForm.module.scss'

import { STORAGE_KEYS } from '../../../../constants/storage'

const STORAGE_KEY = STORAGE_KEYS.DEVELOPER_FORM

type DeveloperFormProps = {
  onSubmit: (data: DeveloperCreateRequest) => void
  loading: boolean
  initialData?: Developer | null
  isEditMode?: boolean
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
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        logoUrl: initialData.logoUrl || '',
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
  const [pickerOpen, setPickerOpen] = useState(false)

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
      logoUrl: initialData.logoUrl || '',
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
      logoUrl: form.logoUrl || undefined,
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
      <div className={styles.inputWithButton}>
        <Input
          label="Logo URL"
          value={form.logoUrl}
          onChange={e => setForm({ ...form, logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setPickerOpen(true)}
          iconLeft={<ImageIcon size={16} />}
        >
          Browse
        </Button>
      </div>
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

      {/* Media Picker */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={url => setForm({ ...form, logoUrl: url })}
      />
    </form>
  )
}
