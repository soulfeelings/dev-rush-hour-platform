import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select } from '../../../../ui'
import type { BadgeCreateRequest } from '../../../../api/generated/schemas/badgeCreateRequest'
import type { Badge } from '../../../../api/generated/schemas/badge'
import styles from './BadgeForm.module.scss'

type BadgeFormProps = {
  onSubmit: (data: BadgeCreateRequest) => void
  loading: boolean
  initialData?: Badge | null
  isEditMode?: boolean
}

export function BadgeForm({ onSubmit, loading, initialData, isEditMode = false }: BadgeFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      backgroundColor: '#25D366',
      textColor: '#FFFFFF',
      icon: '',
      status: 'active',
      sortOrder: 0,
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        backgroundColor: initialData.backgroundColor || '#000000',
        textColor: initialData.textColor || '#FFFFFF',
        icon: initialData.icon || '',
        status: (initialData.status as string) || 'active',
        sortOrder: initialData.sortOrder || 0,
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
      backgroundColor: initialData.backgroundColor || '#000000',
      textColor: initialData.textColor || '#FFFFFF',
      icon: initialData.icon || '',
      status: (initialData.status as string) || 'active',
      sortOrder: initialData.sortOrder || 0,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: BadgeCreateRequest = {
      slug: form.slug,
      name: form.name,
      backgroundColor: form.backgroundColor,
      textColor: form.textColor,
      icon: form.icon || undefined,
      status: form.status as 'active' | 'inactive',
      sortOrder: form.sortOrder,
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
              value={form.backgroundColor}
              onChange={e => setForm({ ...form, backgroundColor: e.target.value })}
              className={styles.colorPicker}
            />
            <Input
              value={form.backgroundColor}
              onChange={e => setForm({ ...form, backgroundColor: e.target.value })}
              placeholder="#25D366"
            />
          </div>
        </div>
        <div className={styles.colorField}>
          <label className={styles.colorLabel}>Text Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={form.textColor}
              onChange={e => setForm({ ...form, textColor: e.target.value })}
              className={styles.colorPicker}
            />
            <Input
              value={form.textColor}
              onChange={e => setForm({ ...form, textColor: e.target.value })}
              placeholder="#FFFFFF"
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
        value={form.sortOrder.toString()}
        onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
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
