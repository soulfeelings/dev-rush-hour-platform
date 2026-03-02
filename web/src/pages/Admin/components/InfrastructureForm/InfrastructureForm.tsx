import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input } from '../../../../ui'
import { generateSlug } from '../../../../utils/generateSlug'
import { AVAILABLE_INFRASTRUCTURE_ICONS } from '../../../../utils/infrastructureIcons'
import type { InfrastructureCreateRequest } from '../../../../api/generated/schemas/infrastructureCreateRequest'
import type { Infrastructure } from '../../../../api/generated/schemas/infrastructure'
import styles from './InfrastructureForm.module.scss'

type InfrastructureFormData = {
  slug: string
  name: string
  icon: string
  sortOrder: string
}

type InfrastructureFormProps = {
  onSubmit: (data: InfrastructureCreateRequest) => void
  loading: boolean
  initialData?: Infrastructure | null
  isEditMode?: boolean
  draftData?: InfrastructureFormData
  onDataChange?: (data: InfrastructureFormData, isDirty: boolean) => void
}

type ValidationErrors = {
  sortOrder?: string
}

type FormData = InfrastructureFormData

export function InfrastructureForm({
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
  draftData,
  onDataChange,
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
    if (draftData) return draftData
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        icon: initialData.icon || '',
        sortOrder: initialData.sortOrder?.toString() || '',
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

  const handleSubmit = () => {
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
    onSubmit(payload)
  }

  return (
    <div className={styles.form}>
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

      <div className={styles.iconSection}>
        <label className={styles.iconLabel}>Icon (optional)</label>
        <div className={styles.iconGrid}>
          <button
            type="button"
            className={`${styles.iconOption} ${!form.icon ? styles.iconOptionActive : ''}`}
            onClick={() => setForm({ ...form, icon: '' })}
            title="No icon"
          >
            <span className={styles.noIcon}>—</span>
          </button>
          {AVAILABLE_INFRASTRUCTURE_ICONS.map(({ name, component: IconComponent, label }) => (
            <button
              key={name}
              type="button"
              className={`${styles.iconOption} ${form.icon === name ? styles.iconOptionActive : ''}`}
              onClick={() => setForm({ ...form, icon: name })}
              title={label}
            >
              <IconComponent size={20} />
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Sort Order"
        type="number"
        value={form.sortOrder}
        onChange={e => setForm({ ...form, sortOrder: e.target.value })}
        error={errors.sortOrder}
        required
      />

      <Button
        type="button"
        onClick={handleSubmit}
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
    </div>
  )
}
