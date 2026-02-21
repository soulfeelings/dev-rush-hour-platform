import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Select, ImagePreview, Checkbox, Badge as BadgeUI } from '../../../../ui'
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import type { Badge } from '../../../../api/generated/schemas/badge'
import { DirectionPicker } from '../DirectionPicker'
import { MediaPicker } from '../MediaPicker'
import styles from './LotForm.module.scss'

import { STORAGE_KEYS } from '../../../../constants/storage'

const STORAGE_KEY = STORAGE_KEYS.LOT_FORM

type Project = {
  id?: string
  name?: string
  lat?: number
  lng?: number
}

type LotFormData = {
  projectId: string
  type: string
  status: string
  bedrooms: string
  bathrooms: string
  areaSqm: string
  floor: string
  priceAmount: string
  developerPrice: string
  roi: string
  badgeIds: string[]
  view: string
  orientation: string
  coverUrl: string
  photos: string[]
  floorPlanImages: string[]
  viewPhotos: string[]
}

type ValidationErrors = {
  projectId?: string
  type?: string
  status?: string
}

type LotFormProps = {
  projects: Project[]
  badges: Badge[]
  onSubmit: (data: Record<string, unknown>) => void
  loading: boolean
  initialData?: LotListItem | null
  isEditMode?: boolean
}

export function LotForm({
  projects,
  badges,
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: LotFormProps) {
  const defaultForm = useMemo<LotFormData>(
    () => ({
      projectId: '',
      type: '',
      status: '',
      bedrooms: '',
      bathrooms: '',
      areaSqm: '',
      floor: '',
      priceAmount: '',
      developerPrice: '',
      roi: '',
      badgeIds: [] as string[],
      view: '',
      orientation: '',
      coverUrl: '',
      photos: [],
      floorPlanImages: [],
      viewPhotos: [],
    }),
    []
  )

  const initialForm = useMemo<LotFormData>(() => {
    if (initialData) {
      return {
        projectId: initialData.projectId || '',
        type: (initialData.type as string) || '',
        status: (initialData.status as string) || '',
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        areaSqm: initialData.areaSqm?.toString() || '',
        floor: initialData.floor?.toString() || '',
        priceAmount: initialData.priceFromUs?.toString() || '',
        developerPrice: initialData.priceFromDeveloper?.toString() || '',
        roi: initialData.roi?.toString() || '',
        badgeIds: initialData.badgeIds?.filter((id): id is string => !!id) || [],
        view: (initialData.data as Record<string, unknown>)?.view as string || '',
        orientation: (initialData.data as Record<string, unknown>)?.orientation as string || '',
        coverUrl: initialData.data?.media?.cover?.url || '',
        photos: initialData.data?.media?.photos?.map(p => p.url || '').filter(Boolean) || [],
        floorPlanImages:
          initialData.data?.media?.floorPlanImages?.map(p => p.url || '').filter(Boolean) || [],
        viewPhotos:
          initialData.data?.media?.viewPhotos?.map(p => p.url || '').filter(Boolean) || [],
      }
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
  }, [initialData, defaultForm, isEditMode])

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

  const initialFormData = useMemo(() => {
    if (!initialData) return null
    return {
      projectId: initialData.projectId || '',
      type: (initialData.type as string) || '',
      status: (initialData.status as string) || '',
      bedrooms: initialData.bedrooms?.toString() || '',
      bathrooms: initialData.bathrooms?.toString() || '',
      areaSqm: initialData.areaSqm?.toString() || '',
      floor: initialData.floor?.toString() || '',
      priceAmount: initialData.priceFromUs?.toString() || '',
      developerPrice: initialData.priceFromDeveloper?.toString() || '',
      roi: initialData.roi?.toString() || '',
      badgeIds: initialData.badgeIds?.filter((id): id is string => !!id) || [],
      view: (initialData.data as Record<string, unknown>)?.view as string || '',
      orientation: (initialData.data as Record<string, unknown>)?.orientation as string || '',
      coverUrl: initialData.data?.media?.cover?.url || '',
      photos: initialData.data?.media?.photos?.map(p => p.url || '').filter(Boolean) || [],
      floorPlanImages:
        initialData.data?.media?.floorPlanImages?.map(p => p.url || '').filter(Boolean) || [],
      viewPhotos:
        initialData.data?.media?.viewPhotos?.map(p => p.url || '').filter(Boolean) || [],
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    const photosChanged =
      form.photos.length !== initialFormData.photos.length ||
      form.photos.some((url, idx) => url !== initialFormData.photos[idx])
    const floorPlanImagesChanged =
      form.floorPlanImages.length !== initialFormData.floorPlanImages.length ||
      form.floorPlanImages.some((url, idx) => url !== initialFormData.floorPlanImages[idx])
    const viewPhotosChanged =
      form.viewPhotos.length !== initialFormData.viewPhotos.length ||
      form.viewPhotos.some((url, idx) => url !== initialFormData.viewPhotos[idx])
    const badgeIdsChanged =
      form.badgeIds.length !== initialFormData.badgeIds.length ||
      form.badgeIds.some((id, idx) => id !== initialFormData.badgeIds[idx])
    return (
      form.projectId !== initialFormData.projectId ||
      form.type !== initialFormData.type ||
      form.status !== initialFormData.status ||
      form.bedrooms !== initialFormData.bedrooms ||
      form.bathrooms !== initialFormData.bathrooms ||
      form.areaSqm !== initialFormData.areaSqm ||
      form.floor !== initialFormData.floor ||
      form.priceAmount !== initialFormData.priceAmount ||
      form.developerPrice !== initialFormData.developerPrice ||
      form.roi !== initialFormData.roi ||
      form.view !== initialFormData.view ||
      form.orientation !== initialFormData.orientation ||
      form.coverUrl !== initialFormData.coverUrl ||
      photosChanged ||
      floorPlanImagesChanged ||
      viewPhotosChanged ||
      badgeIdsChanged
    )
  }, [form, initialFormData, isEditMode])

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState(false)

  // Media picker state
  const [pickerOpen, setPickerOpen] = useState<
    'coverUrl' | 'photos' | 'floorPlanImages' | 'viewPhotos' | null
  >(null)

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
      priceFromUs: parseFloat(form.priceAmount),
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
    if (form.developerPrice) {
      payload.priceFromDeveloper = parseFloat(form.developerPrice)
    }
    if (form.roi) {
      payload.roi = parseFloat(form.roi)
    }
    if (form.badgeIds.length > 0) {
      payload.badgeIds = form.badgeIds
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
    if (form.viewPhotos.length > 0) {
      mediaData.viewPhotos = form.viewPhotos.filter(Boolean).map(url => ({ url }))
    }

    const dataPayload: Record<string, unknown> = {}
    if (Object.keys(mediaData).length > 0) {
      dataPayload.media = mediaData
    }
    if (form.view) {
      dataPayload.view = form.view
    }
    if (form.orientation) {
      dataPayload.orientation = form.orientation
    }
    if (Object.keys(dataPayload).length > 0) {
      payload.data = dataPayload
    }

    if (!isEditMode) {
      clearCache()
    }
    onSubmit(payload)
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

  const addViewPhoto = () => {
    setForm({ ...form, viewPhotos: [...form.viewPhotos, ''] })
  }

  const removeViewPhoto = (index: number) => {
    setForm({ ...form, viewPhotos: form.viewPhotos.filter((_, i) => i !== index) })
  }

  const updateViewPhoto = (index: number, url: string) => {
    const newViewPhotos = [...form.viewPhotos]
    newViewPhotos[index] = url
    setForm({ ...form, viewPhotos: newViewPhotos })
  }

  const toggleBadge = (badgeId: string) => {
    const newBadgeIds = form.badgeIds.includes(badgeId)
      ? form.badgeIds.filter(id => id !== badgeId)
      : [...form.badgeIds, badgeId]
    setForm({ ...form, badgeIds: newBadgeIds })
  }

  const selectedProject = useMemo(
    () => projects.find(p => p.id === form.projectId),
    [projects, form.projectId]
  )

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
        searchable
      />
      <Select
        label="Type"
        options={[
          { value: '', label: 'Select Type' },
          { value: 'apartment', label: 'Apartment' },
          { value: 'villa', label: 'Villa' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'penthouse', label: 'Penthouse' },
          { value: 'duplex', label: 'Duplex' },
          { value: 'triplex', label: 'Triplex' },
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
        value={form.priceAmount}
        onChange={e => setForm({ ...form, priceAmount: e.target.value })}
        required
      />
      <Input
        label="Developer Price (AED)"
        type="number"
        step="any"
        value={form.developerPrice}
        onChange={e => setForm({ ...form, developerPrice: e.target.value })}
      />
      <Input
        label="ROI (%)"
        type="number"
        step="0.01"
        value={form.roi}
        onChange={e => setForm({ ...form, roi: e.target.value })}
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
      <div className={styles.mediaSection}>
        <h3 className={styles.sectionTitle}>Media</h3>
        <div className={styles.coverImageWrapper}>
          <div className={styles.inputWithButton}>
            <Input
              label="Cover Image URL"
              type="url"
              value={form.coverUrl}
              onChange={e => setForm({ ...form, coverUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPickerOpen('coverUrl')}
              iconLeft={<ImageIcon size={16} />}
            >
              Browse
            </Button>
          </div>
          {form.coverUrl && <ImagePreview src={form.coverUrl} alt="Cover preview" />}
        </div>
        <div className={styles.mediaList}>
          <div className={styles.mediaListHeader}>
            <label className={styles.mediaListLabel}>Photos</label>
            <div className={styles.mediaListActions}>
              <Button
                type="button"
                onClick={() => setPickerOpen('photos')}
                variant="secondary"
                size="sm"
                iconLeft={<ImageIcon size={16} />}
              >
                Browse
              </Button>
              <Button type="button" onClick={addPhoto} variant="secondary" size="sm">
                <Plus size={16} />
                Add Photo
              </Button>
            </div>
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
            <div className={styles.mediaListActions}>
              <Button
                type="button"
                onClick={() => setPickerOpen('floorPlanImages')}
                variant="secondary"
                size="sm"
                iconLeft={<ImageIcon size={16} />}
              >
                Browse
              </Button>
              <Button type="button" onClick={addFloorPlanImage} variant="secondary" size="sm">
                <Plus size={16} />
                Add Floor Plan
              </Button>
            </div>
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
      <div className={styles.mediaSection}>
        <h3 className={styles.sectionTitle}>View Details</h3>
        <DirectionPicker
          value={form.orientation}
          onChange={orientation => setForm({ ...form, orientation })}
          lat={selectedProject?.lat}
          lng={selectedProject?.lng}
        />
        <div className={styles.mediaList}>
          <div className={styles.mediaListHeader}>
            <label className={styles.mediaListLabel}>View Photos</label>
            <div className={styles.mediaListActions}>
              <Button
                type="button"
                onClick={() => setPickerOpen('viewPhotos')}
                variant="secondary"
                size="sm"
                iconLeft={<ImageIcon size={16} />}
              >
                Browse
              </Button>
              <Button type="button" onClick={addViewPhoto} variant="secondary" size="sm">
                <Plus size={16} />
                Add View Photo
              </Button>
            </div>
          </div>
          {form.viewPhotos.map((url, index) => (
            <div key={index} className={styles.mediaItem}>
              <div className={styles.mediaItemContent}>
                <Input
                  type="url"
                  value={url}
                  onChange={e => updateViewPhoto(index, e.target.value)}
                  placeholder="https://example.com/view-photo.jpg"
                />
                {url && <ImagePreview src={url} alt={`View photo ${index + 1} preview`} />}
              </div>
              <Button
                type="button"
                onClick={() => removeViewPhoto(index)}
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
      <Button
        type="submit"
        disabled={loading || (isEditMode && !hasChanges)}
        fullWidth
        className={isEditMode && hasChanges ? styles.saveButton : ''}
      >
        {loading ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save' : 'Create Lot'}
      </Button>

      {/* Media Pickers */}
      <MediaPicker
        open={pickerOpen === 'coverUrl'}
        onClose={() => setPickerOpen(null)}
        onSelect={url => setForm({ ...form, coverUrl: url })}
      />
      <MediaPicker
        open={pickerOpen === 'photos'}
        onClose={() => setPickerOpen(null)}
        multiple
        onSelectMultiple={urls => setForm({ ...form, photos: [...form.photos, ...urls] })}
      />
      <MediaPicker
        open={pickerOpen === 'floorPlanImages'}
        onClose={() => setPickerOpen(null)}
        multiple
        onSelectMultiple={urls =>
          setForm({ ...form, floorPlanImages: [...form.floorPlanImages, ...urls] })
        }
      />
      <MediaPicker
        open={pickerOpen === 'viewPhotos'}
        onClose={() => setPickerOpen(null)}
        multiple
        onSelectMultiple={urls => setForm({ ...form, viewPhotos: [...form.viewPhotos, ...urls] })}
      />
    </form>
  )
}
