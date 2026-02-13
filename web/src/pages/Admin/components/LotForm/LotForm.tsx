import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Select, ImagePreview, Checkbox } from '../../../../ui'
import { Badge as BadgeUI } from '../../../../ui/Badge'
import { Plus, X } from 'lucide-react'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import type { Badge } from '../../../../api/generated/schemas/badge'
import styles from './LotForm.module.scss'

import { STORAGE_KEYS } from '../../../../constants/storage'

const STORAGE_KEY = STORAGE_KEYS.LOT_FORM

type Project = {
  id?: string
  name?: string
}

type Developer = {
  id?: string
  name?: string
}

type Area = {
  id?: string
  name?: string
}

type LotFormData = {
  projectId: string
  developerId: string
  areaId: string
  type: string
  status: string
  bedrooms: string
  bathrooms: string
  areaSqm: string
  floor: string
  priceFromUs: string
  priceFromDeveloper: string
  roi: string
  coverUrl: string
  photos: string[]
  floorPlanImages: string[]
  badgeIds: string[]
}

type ValidationErrors = {
  projectId?: string
  type?: string
  status?: string
}

type LotFormProps = {
  projects: Project[]
  developers: Developer[]
  areas: Area[]
  badges?: Badge[]
  onSubmit: (data: Record<string, unknown>) => void
  loading: boolean
  initialData?: LotListItem | null
  isEditMode?: boolean
}

export function LotForm({
  projects,
  developers,
  areas,
  badges = [],
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: LotFormProps) {
  const defaultForm = useMemo<LotFormData>(
    () => ({
      projectId: '',
      developerId: '',
      areaId: '',
      type: '',
      status: '',
      bedrooms: '',
      bathrooms: '',
      areaSqm: '',
      floor: '',
      priceFromUs: '',
      priceFromDeveloper: '',
      roi: '',
      coverUrl: '',
      photos: [],
      floorPlanImages: [],
      badgeIds: [],
    }),
    []
  )

  const initialFormData = useMemo<LotFormData | null>(() => {
    if (!initialData) return null
    return {
      projectId: initialData.projectId || '',
      developerId: initialData.developerId || '',
      areaId: initialData.areaId || '',
      type: (initialData.type as string) || '',
      status: (initialData.status as string) || '',
      bedrooms: initialData.bedrooms?.toString() || '',
      bathrooms: initialData.bathrooms?.toString() || '',
      areaSqm: initialData.areaSqm?.toString() || '',
      floor: initialData.floor?.toString() || '',
      priceFromUs: initialData.priceFromUs?.toString() || '',
      priceFromDeveloper: initialData.priceFromDeveloper?.toString() || '',
      roi: initialData.roi?.toString() || '',
      coverUrl: initialData.data?.media?.cover?.url || '',
      photos: initialData.data?.media?.photos?.map(p => p.url || '').filter(Boolean) || [],
      floorPlanImages:
        initialData.data?.media?.floorPlanImages?.map(p => p.url || '').filter(Boolean) || [],
      badgeIds: initialData.badges?.map(b => b.id).filter((id): id is string => !!id) || [],
    }
  }, [initialData])

  const initialForm = useMemo<LotFormData>(() => {
    if (initialFormData) {
      return initialFormData
    }
    // Load from localStorage for new forms
    if (!isEditMode) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) {
          return JSON.parse(cached) as LotFormData
        }
      } catch {
        // Ignore parse errors
      }
    }
    return defaultForm
  }, [initialFormData, defaultForm, isEditMode])

  const [form, setForm] = useState<LotFormData>(initialForm)

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

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    const photosChanged =
      form.photos.length !== initialFormData.photos.length ||
      form.photos.some((url, idx) => url !== initialFormData.photos[idx])
    const floorPlanImagesChanged =
      form.floorPlanImages.length !== initialFormData.floorPlanImages.length ||
      form.floorPlanImages.some((url, idx) => url !== initialFormData.floorPlanImages[idx])
    const badgeIdsChanged =
      form.badgeIds.length !== initialFormData.badgeIds.length ||
      form.badgeIds.some((id, idx) => id !== initialFormData.badgeIds[idx])
    return (
      form.projectId !== initialFormData.projectId ||
      form.developerId !== initialFormData.developerId ||
      form.areaId !== initialFormData.areaId ||
      form.type !== initialFormData.type ||
      form.status !== initialFormData.status ||
      form.bedrooms !== initialFormData.bedrooms ||
      form.bathrooms !== initialFormData.bathrooms ||
      form.areaSqm !== initialFormData.areaSqm ||
      form.floor !== initialFormData.floor ||
      form.priceFromUs !== initialFormData.priceFromUs ||
      form.priceFromDeveloper !== initialFormData.priceFromDeveloper ||
      form.roi !== initialFormData.roi ||
      form.coverUrl !== initialFormData.coverUrl ||
      photosChanged ||
      floorPlanImagesChanged ||
      badgeIdsChanged
    )
  }, [form, initialFormData, isEditMode])

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState(false)

  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    if (!form.projectId) {
      newErrors.projectId = 'Project is required'
    }
    if (!form.type) {
      newErrors.type = 'Type is required'
    }
    if (!form.status) {
      newErrors.status = 'Status is required'
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
    const payload: Record<string, unknown> = {
      projectId: form.projectId,
      type: form.type,
      status: form.status,
      priceFromUs: parseFloat(form.priceFromUs),
    }

    if (form.developerId) {
      payload.developerId = form.developerId
    }
    if (form.areaId) {
      payload.areaId = form.areaId
    }
    if (form.bedrooms) {
      payload.bedrooms = parseInt(form.bedrooms, 10)
    }
    if (form.bathrooms) {
      payload.bathrooms = parseInt(form.bathrooms, 10)
    }
    if (form.areaSqm) {
      payload.areaSqm = parseFloat(form.areaSqm)
    }
    if (form.floor) {
      payload.floor = parseInt(form.floor, 10)
    }
    if (form.priceFromDeveloper) {
      payload.priceFromDeveloper = parseFloat(form.priceFromDeveloper)
    }
    if (form.roi) {
      payload.roi = parseFloat(form.roi)
    }

    const mediaData: Record<string, unknown> = {}
    if (form.coverUrl) {
      mediaData.cover = { url: form.coverUrl }
    }
    if (form.photos.length > 0) {
      mediaData.photos = form.photos.filter(Boolean).map(url => ({ url }))
    }
    if (form.floorPlanImages.length > 0) {
      mediaData.floorPlanImages = form.floorPlanImages.filter(Boolean).map(url => ({ url }))
    }

    if (Object.keys(mediaData).length > 0) {
      payload.data = { media: mediaData }
    }

    payload.badgeIds = form.badgeIds

    if (!isEditMode) {
      clearCache()
    }
    onSubmit(payload)
  }

  const toggleBadge = (badgeId: string) => {
    const newBadgeIds = form.badgeIds.includes(badgeId)
      ? form.badgeIds.filter(id => id !== badgeId)
      : [...form.badgeIds, badgeId]
    setForm({ ...form, badgeIds: newBadgeIds })
  }

  const addPhoto = () => {
    setForm({ ...form, photos: [...form.photos, ''] })
  }

  const removePhoto = (index: number) => {
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== index) })
  }

  const updatePhoto = (index: number, url: string) => {
    const newPhotos = [...form.photos]
    newPhotos[index] = url
    setForm({ ...form, photos: newPhotos })
  }

  const addFloorPlanImage = () => {
    setForm({ ...form, floorPlanImages: [...form.floorPlanImages, ''] })
  }

  const removeFloorPlanImage = (index: number) => {
    setForm({ ...form, floorPlanImages: form.floorPlanImages.filter((_, i) => i !== index) })
  }

  const updateFloorPlanImage = (index: number, url: string) => {
    const newFloorPlanImages = [...form.floorPlanImages]
    newFloorPlanImages[index] = url
    setForm({ ...form, floorPlanImages: newFloorPlanImages })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Select
        label="Project"
        options={[
          { value: '', label: 'Select Project' },
          ...projects.map(p => ({ value: p.id || '', label: p.name || '' })),
        ]}
        value={form.projectId}
        onChange={value => setForm({ ...form, projectId: value })}
        error={errors.projectId}
      />
      <Select
        label="Type"
        options={[
          { value: '', label: 'Select Type' },
          { value: 'apartment', label: 'Apartment' },
          { value: 'villa', label: 'Villa' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'penthouse', label: 'Penthouse' },
        ]}
        value={form.type}
        onChange={value => setForm({ ...form, type: value })}
        error={errors.type}
      />
      <Select
        label="Status"
        options={[
          { value: '', label: 'Select Status' },
          { value: 'active', label: 'Active' },
          { value: 'hidden', label: 'Hidden' },
          { value: 'reserved', label: 'Reserved' },
          { value: 'sold', label: 'Sold' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
        error={errors.status}
      />
      <Input
        label="Our Price (AED)"
        type="number"
        step="any"
        value={form.priceFromUs}
        onChange={e => setForm({ ...form, priceFromUs: e.target.value })}
        placeholder="e.g. 850000"
      />
      <Input
        label="Developer Price (AED)"
        type="number"
        step="any"
        value={form.priceFromDeveloper}
        onChange={e => setForm({ ...form, priceFromDeveloper: e.target.value })}
        placeholder="e.g. 1000000"
      />
      <Input
        label="ROI (%)"
        type="number"
        step="any"
        value={form.roi}
        onChange={e => setForm({ ...form, roi: e.target.value })}
        placeholder="e.g. 7.5"
      />
      <Input
        label="Bedrooms"
        type="number"
        value={form.bedrooms}
        onChange={e => setForm({ ...form, bedrooms: e.target.value })}
      />
      <Input
        label="Bathrooms"
        type="number"
        value={form.bathrooms}
        onChange={e => setForm({ ...form, bathrooms: e.target.value })}
      />
      <Input
        label="Area (sqm)"
        type="number"
        step="any"
        value={form.areaSqm}
        onChange={e => setForm({ ...form, areaSqm: e.target.value })}
      />
      <Input
        label="Floor"
        type="number"
        value={form.floor}
        onChange={e => setForm({ ...form, floor: e.target.value })}
      />
      <Select
        label="Developer"
        options={[
          { value: '', label: 'None' },
          ...developers.map(d => ({ value: d.id || '', label: d.name || '' })),
        ]}
        value={form.developerId}
        onChange={value => setForm({ ...form, developerId: value })}
      />
      <Select
        label="Area"
        options={[
          { value: '', label: 'None' },
          ...areas.map(a => ({ value: a.id || '', label: a.name || '' })),
        ]}
        value={form.areaId}
        onChange={value => setForm({ ...form, areaId: value })}
      />
      <div className={styles.mediaSection}>
        <h3 className={styles.sectionTitle}>Media</h3>
        <div className={styles.coverImageWrapper}>
          <Input
            label="Cover Image URL"
            type="url"
            value={form.coverUrl}
            onChange={e => setForm({ ...form, coverUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          {form.coverUrl && <ImagePreview src={form.coverUrl} alt="Cover preview" />}
        </div>
        <div className={styles.mediaList}>
          <div className={styles.mediaListHeader}>
            <label className={styles.mediaListLabel}>Photos</label>
            <Button type="button" onClick={addPhoto} variant="secondary" size="sm">
              <Plus size={16} />
              Add Photo
            </Button>
          </div>
          {form.photos.map((url, index) => (
            <div key={index} className={styles.mediaItem}>
              <div className={styles.mediaItemContent}>
                <Input
                  type="url"
                  value={url}
                  onChange={e => updatePhoto(index, e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
                {url && <ImagePreview src={url} alt={`Photo ${index + 1} preview`} />}
              </div>
              <Button
                type="button"
                onClick={() => removePhoto(index)}
                variant="secondary"
                size="sm"
                className={styles.removeButton}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
        <div className={styles.mediaList}>
          <div className={styles.mediaListHeader}>
            <label className={styles.mediaListLabel}>Floor Plan Images</label>
            <Button type="button" onClick={addFloorPlanImage} variant="secondary" size="sm">
              <Plus size={16} />
              Add Floor Plan
            </Button>
          </div>
          {form.floorPlanImages.map((url, index) => (
            <div key={index} className={styles.mediaItem}>
              <div className={styles.mediaItemContent}>
                <Input
                  type="url"
                  value={url}
                  onChange={e => updateFloorPlanImage(index, e.target.value)}
                  placeholder="https://example.com/floor-plan.jpg"
                />
                {url && <ImagePreview src={url} alt={`Floor plan ${index + 1} preview`} />}
              </div>
              <Button
                type="button"
                onClick={() => removeFloorPlanImage(index)}
                variant="secondary"
                size="sm"
                className={styles.removeButton}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
      {badges.length > 0 && (
        <div className={styles.mediaSection}>
          <h3 className={styles.sectionTitle}>Badges</h3>
          <div className={styles.badgesList}>
            {badges.map(badge => (
              <label key={badge.id} className={styles.badgeItem}>
                <Checkbox
                  checked={badge.id ? form.badgeIds.includes(badge.id) : false}
                  onChange={() => badge.id && toggleBadge(badge.id)}
                />
                <BadgeUI
                  text={badge.name || ''}
                  backgroundColor={badge.backgroundColor || '#e0e0e0'}
                  textColor={badge.textColor || '#000000'}
                  iconName={badge.icon}
                  iconColor={badge.iconColor}
                  size="small"
                />
              </label>
            ))}
          </div>
        </div>
      )}
      <Button
        type="submit"
        disabled={loading || (isEditMode && !hasChanges)}
        fullWidth
        className={isEditMode && hasChanges ? styles.saveButton : ''}
      >
        {loading ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create Lot'}
      </Button>
    </form>
  )
}
