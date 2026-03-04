import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Select } from '../../../../ui'
import { generateSlug } from '../../../../utils/generateSlug'
import { searchAreas, extractPolygonPoints } from '../../../../utils/nominatim'
import { OsmAutocomplete } from '../OsmAutocomplete'
import { PolygonPicker } from '../PolygonPicker'
import type { AreaCreateRequest } from '../../../../api/generated/schemas/areaCreateRequest'
import type { Area } from '../../../../api/generated/schemas/area'
import type { City } from '../../../../api/generated/schemas/city'
import styles from './AreaForm.module.scss'

type AreaFormData = {
  slug: string
  name: string
  city: string
  polygon: [number, number][]
}

type AreaFormProps = {
  onSubmit: (data: AreaCreateRequest) => void
  loading: boolean
  initialData?: Area | null
  isEditMode?: boolean
  cities: City[]
  draftData?: AreaFormData
  onDataChange?: (data: AreaFormData, isDirty: boolean) => void
}

type ValidationErrors = {
  city?: string
  polygon?: string
}

type FormData = AreaFormData

export function AreaForm({
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
  cities,
  draftData,
  onDataChange,
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
    if (draftData) return draftData
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
    return defaultForm
  }, [initialData, defaultForm, draftData])

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

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

    const payload: AreaCreateRequest = {
      slug: form.slug,
      name: form.name,
      city: form.city,
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
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <OsmAutocomplete
        label="Name"
        value={form.name}
        onChange={newName => setForm({ ...form, name: newName, slug: generateSlug(newName) })}
        onSelect={result => {
          const polygon = extractPolygonPoints(result)
          setForm(prev => ({
            ...prev,
            name: result.name,
            slug: generateSlug(result.name),
            ...(polygon.length >= 3 ? { polygon } : {}),
          }))
        }}
        fetchSuggestions={query => searchAreas(query, form.city)}
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
