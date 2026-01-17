import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select } from '../../../../ui'
import { Plus, X } from 'lucide-react'
import type { LotListItem } from '../../../../api/generated/schemas/lotListItem'
import styles from './LotForm.module.scss'

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
  priceCurrency: string
  priceAmount: string
  coverUrl: string
  photos: string[]
  floorPlanImages: string[]
}

type LotFormProps = {
  projects: Project[]
  developers: Developer[]
  areas: Area[]
  onSubmit: (data: Record<string, unknown>) => void
  loading: boolean
  initialData?: LotListItem | null
  isEditMode?: boolean
}

export function LotForm({
  projects,
  developers,
  areas,
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
      type: 'apartment',
      status: 'active',
      bedrooms: '',
      bathrooms: '',
      areaSqm: '',
      floor: '',
      priceCurrency: 'AED',
      priceAmount: '',
      coverUrl: '',
      photos: [],
      floorPlanImages: [],
    }),
    []
  )

  const initialForm = useMemo<LotFormData>(() => {
    if (initialData) {
      return {
        projectId: initialData.projectId || '',
        developerId: initialData.developerId || '',
        areaId: initialData.areaId || '',
        type: (initialData.type as string) || 'apartment',
        status: (initialData.status as string) || 'active',
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        areaSqm: initialData.areaSqm?.toString() || '',
        floor: initialData.floor?.toString() || '',
        priceCurrency: initialData.priceCurrency || 'AED',
        priceAmount: initialData.priceAmount?.toString() || '',
        coverUrl: initialData.data?.media?.cover?.url || '',
        photos: initialData.data?.media?.photos?.map(p => p.url || '').filter(Boolean) || [],
        floorPlanImages:
          initialData.data?.media?.floorPlanImages?.map(p => p.url || '').filter(Boolean) || [],
      }
    }
    return defaultForm
  }, [initialData, defaultForm])

  const [form, setForm] = useState<LotFormData>(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const initialFormData = useMemo(() => {
    if (!initialData) return null
    return {
      projectId: initialData.projectId || '',
      developerId: initialData.developerId || '',
      areaId: initialData.areaId || '',
      type: (initialData.type as string) || 'apartment',
      status: (initialData.status as string) || 'active',
      bedrooms: initialData.bedrooms?.toString() || '',
      bathrooms: initialData.bathrooms?.toString() || '',
      areaSqm: initialData.areaSqm?.toString() || '',
      floor: initialData.floor?.toString() || '',
      priceCurrency: initialData.priceCurrency || 'AED',
      priceAmount: initialData.priceAmount?.toString() || '',
      coverUrl: initialData.data?.media?.cover?.url || '',
      photos: initialData.data?.media?.photos?.map(p => p.url || '').filter(Boolean) || [],
      floorPlanImages:
        initialData.data?.media?.floorPlanImages?.map(p => p.url || '').filter(Boolean) || [],
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
      form.priceCurrency !== initialFormData.priceCurrency ||
      form.priceAmount !== initialFormData.priceAmount ||
      form.coverUrl !== initialFormData.coverUrl ||
      photosChanged ||
      floorPlanImagesChanged
    )
  }, [form, initialFormData, isEditMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {
      projectId: form.projectId,
      type: form.type,
      status: form.status,
      priceCurrency: form.priceCurrency,
      priceAmount: parseFloat(form.priceAmount),
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
      />
      <Select
        label="Type"
        options={[
          { value: 'apartment', label: 'Apartment' },
          { value: 'villa', label: 'Villa' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'penthouse', label: 'Penthouse' },
        ]}
        value={form.type}
        onChange={value => setForm({ ...form, type: value })}
      />
      <Select
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'hidden', label: 'Hidden' },
          { value: 'reserved', label: 'Reserved' },
          { value: 'sold', label: 'Sold' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
      />
      <Input
        label="Price Amount (AED)"
        type="number"
        step="any"
        value={form.priceAmount}
        onChange={e => setForm({ ...form, priceAmount: e.target.value })}
        required
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
          {form.coverUrl && (
            <div className={styles.imagePreview}>
              <img
                src={form.coverUrl}
                alt="Cover preview"
                onError={e => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
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
                {url && (
                  <div className={styles.imagePreview}>
                    <img
                      src={url}
                      alt={`Photo ${index + 1} preview`}
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
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
                {url && (
                  <div className={styles.imagePreview}>
                    <img
                      src={url}
                      alt={`Floor plan ${index + 1} preview`}
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
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
