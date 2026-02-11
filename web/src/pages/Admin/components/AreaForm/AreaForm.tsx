import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Select } from '../../../../ui'
import { generateSlug } from '../../../../utils/generateSlug'
import { PolygonPicker } from '../PolygonPicker'
import type { AreaCreateRequest } from '../../../../api/generated/schemas/areaCreateRequest'
import type { Area } from '../../../../api/generated/schemas/area'
import type { City } from '../../../../api/generated/schemas/city'
import { STORAGE_KEYS } from '../../../../constants/storage'
import styles from './AreaForm.module.scss'

const STORAGE_KEY = STORAGE_KEYS.AREA_FORM

type AreaFormProps = {
  onSubmit: (data: AreaCreateRequest) => void
  loading: boolean
  initialData?: Area | null
  isEditMode?: boolean
  cities: City[]
}

type ValidationErrors = {
  city?: string
  polygon?: string
}

type FormData = {
  slug: string
  name: string
  city: string
  polygon: [number, number][]
}

export function AreaForm({
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
  cities,
}: AreaFormProps) {
  const defaultForm = useMemo<FormData>(
    () => ({
      slug: '',
      name: '',
      city: '',
      polygon: [],
    }),
    []
  )

  const initialForm = useMemo<FormData>(() => {
    if (initialData) {
      const points: [number, number][] =
        initialData.data?.boundary?.coordinates?.[0]?.map(
          ([lng, lat]) => [lat, lng] as [number, number]
        ) || []
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        city: initialData.city || '',
        polygon: points,
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

  const initialFormData = useMemo<FormData | null>(() => {
    if (!initialData) return null
    const points: [number, number][] =
      initialData.data?.boundary?.coordinates?.[0]?.map(
        ([lng, lat]) => [lat, lng] as [number, number]
      ) || []
    return {
      slug: initialData.slug || '',
      name: initialData.name || '',
      city: initialData.city || '',
      polygon: points,
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    return (
      form.slug !== initialFormData.slug ||
      form.name !== initialFormData.name ||
      form.city !== initialFormData.city ||
      JSON.stringify(form.polygon) !== JSON.stringify(initialFormData.polygon)
    )
  }, [form, initialFormData, isEditMode])

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState(false)

  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    if (!form.city) {
      newErrors.city = 'City is required'
    }
    if (form.polygon.length < 3) {
      newErrors.polygon = 'At least 3 points are required to form a polygon'
    }
    return newErrors
  }

  useEffect(() => {
    if (touched) {
      setErrors(validate())
    }
  }, [form, touched])

  const cityOptions = useMemo(
    () => cities.map(c => ({ value: c.slug || '', label: c.name || c.slug || '' })),
    [cities]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const centroidLat = form.polygon.reduce((s, p) => s + p[0], 0) / form.polygon.length
    const centroidLng = form.polygon.reduce((s, p) => s + p[1], 0) / form.polygon.length

    const payload: AreaCreateRequest = {
      slug: form.slug,
      name: form.name,
      city: form.city,
      lat: centroidLat,
      lng: centroidLng,
      data:
        form.polygon.length >= 3
          ? {
              boundary: {
                type: 'Polygon',
                coordinates: [form.polygon.map(([lat, lng]) => [lng, lat])],
              },
            }
          : undefined,
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
        placeholder="e.g., Dubai Marina"
      />
      <Input label="Slug" value={form.slug} disabled />

      <Select
        label="City"
        options={cityOptions}
        value={form.city}
        onChange={value => setForm({ ...form, city: value })}
        placeholder="Select a city"
        error={errors.city}
        searchable
      />

      <PolygonPicker
        points={form.polygon}
        onPointsChange={polygon => setForm(prev => ({ ...prev, polygon }))}
      />
      {touched && errors.polygon && <span className={styles.polygonError}>{errors.polygon}</span>}

      <Button
        type="submit"
        disabled={loading || (isEditMode && !hasChanges)}
        fullWidth
        className={isEditMode && hasChanges ? styles.saveButton : ''}
      >
        {loading ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create Area'}
      </Button>
    </form>
  )
}
