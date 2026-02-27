import { useEffect, useMemo, useState, useCallback } from 'react'
import { Button, Input } from '../../../../ui'
import { generateSlug } from '../../../../utils/generateSlug'
import { type CityCreateRequest, type City } from '../../../../api'
import styles from './CityForm.module.scss'

type CityFormData = {
  slug: string
  name: string
}

type CityFormProps = {
  onSubmit: (data: CityCreateRequest) => void
  loading: boolean
  initialData?: City | null
  isEditMode?: boolean
  draftData?: CityFormData
  onDataChange?: (data: CityFormData, isDirty: boolean) => void
}

type FormData = CityFormData

export function CityForm({
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
  draftData,
  onDataChange,
}: CityFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (draftData) return draftData
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
      }
    }
    return defaultForm
  }, [initialData, defaultForm, draftData])

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

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

  const stableOnDataChange = useCallback(
    (f: FormData) => {
      if (!onDataChange) return
      const isDirty = isEditMode
        ? hasChanges
        : JSON.stringify(f) !== JSON.stringify(defaultForm)
      onDataChange(f, isDirty)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onDataChange, isEditMode, hasChanges, defaultForm]
  )

  useEffect(() => {
    stableOnDataChange(form)
  }, [form, stableOnDataChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CityCreateRequest = {
      slug: form.slug,
      name: form.name,
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
