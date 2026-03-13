import { useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Button, Input, Select, ImagePreview, Checkbox, Badge as BadgeUI, Typography } from '../../../../ui'
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import type { Badge } from '../../../../api/generated/schemas/badge'
import type { LotCreateRequest } from '../../../../api/generated/schemas/lotCreateRequest'
import type { LotUpdateRequest } from '../../../../api/generated/schemas/lotUpdateRequest'
import type { LotData } from '../../../../api/generated/schemas/lotData'
import type { LotMedia } from '../../../../api/generated/schemas/lotMedia'
import { DirectionPicker } from '../DirectionPicker'
import { MediaPicker } from '../MediaPicker'
import { ImageUploadButton } from '../ImageUploadButton/ImageUploadButton'
import { MediaUrlInput } from '../MediaUrlInput'
import styles from './LotForm.module.scss'

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
  areaSqft: string
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
  dldPermitNo: string
}

type ValidationErrors = {
  projectId?: string
  type?: string
  status?: string
}

type LotFormProps = {
  projects: Project[]
  badges: Badge[]
  onSubmit: (data: LotCreateRequest | LotUpdateRequest) => void
  loading: boolean
  initialData?: LotListItem | null
  isEditMode?: boolean
  draftData?: LotFormData
  onDataChange?: (data: LotFormData, isDirty: boolean) => void
}

export type LotFormHandle = { submit: () => void }

export const LotForm = forwardRef<LotFormHandle, LotFormProps>(function LotForm({
  projects,
  badges,
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
  draftData,
  onDataChange,
}, ref) {
  const defaultForm = useMemo<LotFormData>(
    () => ({
      projectId: '',
      type: '',
      status: 'draft',
      bedrooms: '',
      bathrooms: '',
      areaSqft: '',
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
      dldPermitNo: '',
    }),
    []
  )

  const initialForm = useMemo<LotFormData>(() => {
    if (draftData) return draftData
    if (initialData) {
      return {
        projectId: initialData.projectId || '',
        type: (initialData.type as string) || '',
        status: (initialData.status as string) || '',
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        areaSqft: initialData.areaSqft?.toString() || '',
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
        dldPermitNo: initialData.dldPermitNo || '',
      }
    }
    return defaultForm
  }, [initialData, defaultForm, isEditMode, draftData])

  const [form, setForm] = useState<LotFormData>(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const initialFormData = useMemo(() => {
    if (!initialData) return null
    return {
      projectId: initialData.projectId || '',
      type: (initialData.type as string) || '',
      status: (initialData.status as string) || '',
      bedrooms: initialData.bedrooms?.toString() || '',
      bathrooms: initialData.bathrooms?.toString() || '',
      areaSqft: initialData.areaSqft?.toString() || '',
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
      dldPermitNo: initialData.dldPermitNo || '',
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
      form.areaSqft !== initialFormData.areaSqft ||
      form.floor !== initialFormData.floor ||
      form.priceAmount !== initialFormData.priceAmount ||
      form.developerPrice !== initialFormData.developerPrice ||
      form.roi !== initialFormData.roi ||
      form.view !== initialFormData.view ||
      form.orientation !== initialFormData.orientation ||
      form.coverUrl !== initialFormData.coverUrl ||
      form.dldPermitNo !== initialFormData.dldPermitNo ||
      photosChanged ||
      floorPlanImagesChanged ||
      viewPhotosChanged ||
      badgeIdsChanged
    )
  }, [form, initialFormData, isEditMode])

  const stableOnDataChange = useCallback(
    (f: LotFormData) => {
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

  const buildCreatePayload = (): LotCreateRequest => {
    const payload: LotCreateRequest = {
      projectId: form.projectId,
      type: form.type as LotCreateRequest['type'],
      status: form.status as LotCreateRequest['status'],
      priceFromUs: parseFloat(form.priceAmount),
    }

    if (form.bedrooms) payload.bedrooms = parseInt(form.bedrooms, 10)
    if (form.bathrooms) payload.bathrooms = parseInt(form.bathrooms, 10)
    if (form.areaSqft) payload.areaSqft = parseFloat(form.areaSqft)
    if (form.floor) payload.floor = parseInt(form.floor, 10)
    if (form.developerPrice) payload.priceFromDeveloper = parseFloat(form.developerPrice)
    if (form.roi) payload.roi = parseFloat(form.roi)
    if (form.badgeIds.length > 0) payload.badgeIds = form.badgeIds

    const media: LotMedia = {}
    if (form.coverUrl) media.cover = { url: form.coverUrl }
    if (form.photos.length > 0) media.photos = form.photos.filter(Boolean).map(url => ({ url }))
    if (form.floorPlanImages.length > 0)
      media.floorPlanImages = form.floorPlanImages.filter(Boolean).map(url => ({ url }))
    if (form.viewPhotos.length > 0)
      media.viewPhotos = form.viewPhotos.filter(Boolean).map(url => ({ url }))

    const data: LotData = {}
    if (Object.keys(media).length > 0) data.media = media
    if (form.view) data.view = form.view
    if (form.orientation) data.orientation = form.orientation
    if (Object.keys(data).length > 0) payload.data = data
    if (form.dldPermitNo) payload.dldPermitNo = form.dldPermitNo

    return payload
  }

  const buildEditPayload = (d: typeof initialFormData): LotUpdateRequest => {
    const payload: LotUpdateRequest = {}

    if (form.projectId !== d!.projectId) payload.projectId = form.projectId
    if (form.type !== d!.type) payload.type = form.type as LotUpdateRequest['type']
    if (form.status !== d!.status) payload.status = form.status as LotUpdateRequest['status']
    if (form.priceAmount !== d!.priceAmount) payload.priceFromUs = parseFloat(form.priceAmount)
    if (form.bedrooms !== d!.bedrooms)
      payload.bedrooms = form.bedrooms ? parseInt(form.bedrooms, 10) : undefined
    if (form.bathrooms !== d!.bathrooms)
      payload.bathrooms = form.bathrooms ? parseInt(form.bathrooms, 10) : undefined
    if (form.areaSqft !== d!.areaSqft)
      payload.areaSqft = form.areaSqft ? parseFloat(form.areaSqft) : undefined
    if (form.floor !== d!.floor)
      payload.floor = form.floor ? parseInt(form.floor, 10) : undefined
    if (form.developerPrice !== d!.developerPrice)
      payload.priceFromDeveloper = form.developerPrice ? parseFloat(form.developerPrice) : undefined
    if (form.roi !== d!.roi)
      payload.roi = form.roi ? parseFloat(form.roi) : undefined

    const badgeIdsChanged =
      form.badgeIds.length !== d!.badgeIds.length ||
      form.badgeIds.some((id, idx) => id !== d!.badgeIds[idx])
    if (badgeIdsChanged) payload.badgeIds = form.badgeIds

    const mediaChanged =
      form.coverUrl !== d!.coverUrl ||
      form.photos.length !== d!.photos.length ||
      form.photos.some((url, idx) => url !== d!.photos[idx]) ||
      form.floorPlanImages.length !== d!.floorPlanImages.length ||
      form.floorPlanImages.some((url, idx) => url !== d!.floorPlanImages[idx]) ||
      form.viewPhotos.length !== d!.viewPhotos.length ||
      form.viewPhotos.some((url, idx) => url !== d!.viewPhotos[idx])

    const data: LotData = {}
    if (mediaChanged) {
      const media: LotMedia = {}
      if (form.coverUrl) media.cover = { url: form.coverUrl }
      if (form.photos.length > 0) media.photos = form.photos.filter(Boolean).map(url => ({ url }))
      if (form.floorPlanImages.length > 0)
        media.floorPlanImages = form.floorPlanImages.filter(Boolean).map(url => ({ url }))
      if (form.viewPhotos.length > 0)
        media.viewPhotos = form.viewPhotos.filter(Boolean).map(url => ({ url }))
      if (Object.keys(media).length > 0) data.media = media
    }
    if (form.view !== d!.view) data.view = form.view
    if (form.orientation !== d!.orientation) data.orientation = form.orientation
    if (Object.keys(data).length > 0) payload.data = data
    if (form.dldPermitNo !== d!.dldPermitNo) payload.dldPermitNo = form.dldPermitNo

    return payload
  }

  const submitForm = () => {
    setTouched(true)
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = isEditMode && initialFormData
      ? buildEditPayload(initialFormData)
      : buildCreatePayload()

    onSubmit(payload)
  }

  useImperativeHandle(ref, () => ({ submit: submitForm }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitForm()
  }

  const addPhoto = () => {
    setForm({ ...form, photos: ['', ...form.photos] })
  }

  const removePhoto = (index: number) => {
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== index) })
  }

  const updatePhoto = (index: number, url: string) => {
    const newPhotos = [...form.photos]
    newPhotos[index] = url
    setForm({ ...form, photos: newPhotos })
  }

  const addViewPhoto = () => {
    setForm({ ...form, viewPhotos: ['', ...form.viewPhotos] })
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
          { value: 'draft', label: 'Draft' },
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
        label="Area (sqft)"
        type="number"
        step="any"
        value={form.areaSqft}
        onChange={e => setForm({ ...form, areaSqft: e.target.value })}
      />
      <Input
        label="Floor"
        type="number"
        value={form.floor}
        onChange={e => setForm({ ...form, floor: e.target.value })}
      />
      <Input
        label="DLD Permit No."
        value={form.dldPermitNo}
        onChange={e => {
          const v = e.target.value.replace(/\s/g, '').replace(/\D/g, '')
          setForm({ ...form, dldPermitNo: v })
        }}
        placeholder="e.g. 12345678"
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
        <MediaUrlInput
          label="Cover Image"
          value={form.coverUrl}
          onChange={url => setForm({ ...form, coverUrl: url })}
          onBrowse={() => setPickerOpen('coverUrl')}
        />
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
              <ImageUploadButton
                multiple
                onUpload={url => setForm({ ...form, photos: [...form.photos, url] })}
                onUploadMultiple={urls => setForm({ ...form, photos: [...form.photos, ...urls] })}
              />
              <Button type="button" onClick={addPhoto} variant="secondary" size="sm" iconLeft={<Plus size={16} />}>
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
                  sublabel={<Typography as="p" size="small" color="inherit">You can add here a url from the internet</Typography>}
                />
                {url && <ImagePreview src={url} alt={`Photo ${index + 1} preview`} />}
              </div>
              <button type="button" onClick={() => removePhoto(index)} className={styles.removeButton}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <MediaUrlInput
          label="Floor Plan"
          value={form.floorPlanImages[0] || ''}
          onChange={url => setForm({ ...form, floorPlanImages: url ? [url] : [] })}
          onBrowse={() => setPickerOpen('floorPlanImages')}
          placeholder="https://example.com/floor-plan.jpg"
        />
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
              <ImageUploadButton
                multiple
                onUpload={url => setForm({ ...form, viewPhotos: [...form.viewPhotos, url] })}
                onUploadMultiple={urls => setForm({ ...form, viewPhotos: [...form.viewPhotos, ...urls] })}
              />
              <Button type="button" onClick={addViewPhoto} variant="secondary" size="sm" iconLeft={<Plus size={16} />}>
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
                  sublabel={<Typography as="p" size="small" color="inherit">You can add here a url from the internet</Typography>}
                />
                {url && <ImagePreview src={url} alt={`View photo ${index + 1} preview`} />}
              </div>
              <button type="button" onClick={() => removeViewPhoto(index)} className={styles.removeButton}>
                <X size={16} />
              </button>
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
        onSelect={url => setForm({ ...form, floorPlanImages: [url] })}
      />
      <MediaPicker
        open={pickerOpen === 'viewPhotos'}
        onClose={() => setPickerOpen(null)}
        multiple
        onSelectMultiple={urls => setForm({ ...form, viewPhotos: [...form.viewPhotos, ...urls] })}
      />
    </form>
  )
})
