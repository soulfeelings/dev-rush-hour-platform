import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input } from '../../../../ui'
import { generateSlug } from '../../../../utils/generateSlug'
import { badgeIconMap } from '../../../../utils/badgeIcons'
import { Gift, Sofa, Tag, Stamp, Waves, Anchor, Sparkles, Key } from 'lucide-react'
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
  sortOrder?: string
}

type FormData = {
  slug: string
  name: string
  backgroundColor: string
  textColor: string
  icon: string
  iconColor: string
  sortOrder: string
}

function getRgb(hex: string): string {
  const clean = hex.replace('#', '')
  return '#' + clean.slice(0, 6).padEnd(6, '0')
}

function getAlpha(hex: string): number {
  const clean = hex.replace('#', '')
  if (clean.length <= 6) return 100
  const alphaHex = clean.slice(6, 8)
  return Math.round((parseInt(alphaHex, 16) / 255) * 100)
}

function buildHex(rgb: string, alpha: number): string {
  const clean = rgb.replace('#', '').slice(0, 6)
  if (alpha >= 100) return '#' + clean
  const alphaHex = Math.round((alpha / 100) * 255)
    .toString(16)
    .padStart(2, '0')
  return '#' + clean + alphaHex
}

const AVAILABLE_ICONS = [
  { name: 'gift', component: Gift, label: 'Gift' },
  { name: 'sofa', component: Sofa, label: 'Sofa' },
  { name: 'tag', component: Tag, label: 'Tag' },
  { name: 'passport', component: Stamp, label: 'Passport' },
  { name: 'waves', component: Waves, label: 'Waves' },
  { name: 'anchor', component: Anchor, label: 'Anchor' },
  { name: 'sparkles', component: Sparkles, label: 'Sparkles' },
  { name: 'key', component: Key, label: 'Key' },
] as const

export function BadgeForm({ onSubmit, loading, initialData, isEditMode = false }: BadgeFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      backgroundColor: '',
      textColor: '',
      icon: '',
      iconColor: '#FFD400',
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
        iconColor: '',
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
      iconColor: '',
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
      form.iconColor !== initialFormData.iconColor ||
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
      iconColor: form.iconColor || undefined,
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
        placeholder="e.g., Special Price"
      />
      <Input label="Slug" value={form.slug} disabled />

      <div className={styles.colorRow}>
        <div className={styles.colorField}>
          <label className={styles.colorLabel}>Background Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={getRgb(form.backgroundColor || '#000000')}
              onChange={e => {
                const alpha = getAlpha(form.backgroundColor)
                setForm({ ...form, backgroundColor: buildHex(e.target.value, alpha) })
              }}
              className={styles.colorPicker}
            />
            <Input
              value={form.backgroundColor}
              onChange={e => setForm({ ...form, backgroundColor: e.target.value })}
              placeholder="#0048FFCC"
              error={errors.backgroundColor}
              required
            />
          </div>
          <div className={styles.opacityRow}>
            <label className={styles.opacityLabel}>
              Opacity: {getAlpha(form.backgroundColor)}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={getAlpha(form.backgroundColor)}
              onChange={e => {
                const alpha = parseInt(e.target.value, 10)
                setForm({
                  ...form,
                  backgroundColor: buildHex(getRgb(form.backgroundColor || '#000000'), alpha),
                })
              }}
              className={styles.opacitySlider}
            />
          </div>
        </div>
        <div className={styles.colorField}>
          <label className={styles.colorLabel}>Text Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={getRgb(form.textColor || '#FFFFFF')}
              onChange={e => {
                const alpha = getAlpha(form.textColor)
                setForm({ ...form, textColor: buildHex(e.target.value, alpha) })
              }}
              className={styles.colorPicker}
            />
            <Input
              value={form.textColor}
              onChange={e => setForm({ ...form, textColor: e.target.value })}
              placeholder="#FFFFFFCC"
              error={errors.textColor}
              required
            />
          </div>
          <div className={styles.opacityRow}>
            <label className={styles.opacityLabel}>Opacity: {getAlpha(form.textColor)}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={getAlpha(form.textColor)}
              onChange={e => {
                const alpha = parseInt(e.target.value, 10)
                setForm({
                  ...form,
                  textColor: buildHex(getRgb(form.textColor || '#FFFFFF'), alpha),
                })
              }}
              className={styles.opacitySlider}
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
          {form.icon && badgeIconMap[form.icon] && (
            <span className={styles.previewIcon} style={{ color: form.iconColor || '#FFD400' }}>
              {badgeIconMap[form.icon]}
            </span>
          )}
          {form.name || 'Badge Preview'}
        </span>
      </div>

      <div className={styles.iconSection}>
        <label className={styles.colorLabel}>Icon (optional)</label>
        <div className={styles.iconGrid}>
          <button
            type="button"
            className={`${styles.iconOption} ${!form.icon ? styles.iconOptionActive : ''}`}
            onClick={() => setForm({ ...form, icon: '' })}
            title="No icon"
          >
            <span className={styles.noIcon}>—</span>
          </button>
          {AVAILABLE_ICONS.map(({ name, component: IconComponent, label }) => (
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

      {form.icon && (
        <div className={styles.colorField}>
          <label className={styles.colorLabel}>Icon Color (optional)</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={getRgb(form.iconColor || '#FFD400')}
              onChange={e => {
                const alpha = getAlpha(form.iconColor)
                setForm({ ...form, iconColor: buildHex(e.target.value, alpha) })
              }}
              className={styles.colorPicker}
            />
            <Input
              value={form.iconColor}
              onChange={e => setForm({ ...form, iconColor: e.target.value })}
              placeholder="#FFFFFFCC"
            />
          </div>
          <div className={styles.opacityRow}>
            <label className={styles.opacityLabel}>Opacity: {getAlpha(form.iconColor)}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={getAlpha(form.iconColor)}
              onChange={e => {
                const alpha = parseInt(e.target.value, 10)
                setForm({
                  ...form,
                  iconColor: buildHex(getRgb(form.iconColor || '#FFD400'), alpha),
                })
              }}
              className={styles.opacitySlider}
            />
          </div>
        </div>
      )}

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
            : 'Create Badge'}
      </Button>
    </form>
  )
}
