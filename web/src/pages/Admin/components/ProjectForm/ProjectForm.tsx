import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select, ImagePreview } from '../../../../ui'
import { Plus, X } from 'lucide-react'
import { type ProjectCreateRequest, type Project } from '../../../../api'
import { MapPicker } from '../MapPicker'
import styles from './ProjectForm.module.scss'

type Developer = {
  id?: string
  name?: string
}

type Area = {
  id?: string
  name?: string
}

type ProjectFormProps = {
  developers: Developer[]
  areas: Area[]
  onSubmit: (data: ProjectCreateRequest) => void
  loading: boolean
  initialData?: Project | null
  isEditMode?: boolean
}

export function ProjectForm({
  developers,
  areas,
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: ProjectFormProps) {
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      status: 'active',
      sale: 'sale',
      developerId: '',
      areaId: '',
      lat: '',
      lng: '',
      coverUrl: '',
      gallery: [] as string[],
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        status: (initialData.status as string) || 'active',
        sale: (initialData.sale as string) || 'sale',
        developerId: initialData.developerId || '',
        areaId: initialData.areaId || '',
        lat: initialData.lat?.toString() || '',
        lng: initialData.lng?.toString() || '',
        coverUrl: initialData.data?.media?.cover?.url || '',
        gallery:
          initialData.data?.media?.gallery?.map(item => item.url || '').filter(Boolean) || [],
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
      status: (initialData.status as string) || 'active',
      sale: (initialData.sale as string) || 'sale',
      developerId: initialData.developerId || '',
      areaId: initialData.areaId || '',
      lat: initialData.lat?.toString() || '',
      lng: initialData.lng?.toString() || '',
      coverUrl: initialData.data?.media?.cover?.url || '',
      gallery: initialData.data?.media?.gallery?.map(item => item.url || '').filter(Boolean) || [],
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    const galleryChanged =
      form.gallery.length !== initialFormData.gallery.length ||
      form.gallery.some((url, idx) => url !== initialFormData.gallery[idx])
    return (
      form.slug !== initialFormData.slug ||
      form.name !== initialFormData.name ||
      form.status !== initialFormData.status ||
      form.sale !== initialFormData.sale ||
      form.developerId !== initialFormData.developerId ||
      form.areaId !== initialFormData.areaId ||
      form.lat !== initialFormData.lat ||
      form.lng !== initialFormData.lng ||
      form.coverUrl !== initialFormData.coverUrl ||
      galleryChanged
    )
  }, [form, initialFormData, isEditMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: ProjectCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: form.status as 'active' | 'archived',
      sale: form.sale as 'sale' | 'start of sales' | 'sales announcement',
      ...(form.developerId && { developerId: form.developerId }),
      ...(form.areaId && { areaId: form.areaId }),
      ...(form.lat && { lat: parseFloat(form.lat) }),
      ...(form.lng && { lng: parseFloat(form.lng) }),
    }

    const mediaData: Record<string, unknown> = {}
    if (form.coverUrl) {
      mediaData.cover = { url: form.coverUrl }
    }
    if (form.gallery.length > 0) {
      mediaData.gallery = form.gallery.filter(Boolean).map(url => ({ url }))
    }

    if (Object.keys(mediaData).length > 0) {
      payload.data = { media: mediaData }
    }

    onSubmit(payload)
  }

  const addGalleryItem = () => {
    setForm({ ...form, gallery: [...form.gallery, ''] })
  }

  const removeGalleryItem = (index: number) => {
    setForm({ ...form, gallery: form.gallery.filter((_, i) => i !== index) })
  }

  const updateGalleryItem = (index: number, url: string) => {
    const newGallery = [...form.gallery]
    newGallery[index] = url
    setForm({ ...form, gallery: newGallery })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Slug"
        value={form.slug}
        onChange={e => setForm({ ...form, slug: e.target.value })}
        required
      />
      <Input
        label="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
      />
      <Select
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
      />
      <Select
        label="Sale Status"
        options={[
          { value: 'sale', label: 'Sale' },
          { value: 'start of sales', label: 'Start of Sales' },
          { value: 'sales announcement', label: 'Sales Announcement' },
        ]}
        value={form.sale}
        onChange={value => setForm({ ...form, sale: value })}
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
      <MapPicker
        lat={form.lat}
        lng={form.lng}
        onCoordinatesChange={(lat, lng) => setForm({ ...form, lat, lng })}
      />
      <Input
        label="Latitude"
        type="number"
        step="any"
        value={form.lat}
        onChange={e => setForm({ ...form, lat: e.target.value })}
      />
      <Input
        label="Longitude"
        type="number"
        step="any"
        value={form.lng}
        onChange={e => setForm({ ...form, lng: e.target.value })}
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
            <label className={styles.mediaListLabel}>Gallery</label>
            <Button type="button" onClick={addGalleryItem} variant="secondary" size="sm">
              <Plus size={16} />
              Add Image
            </Button>
          </div>
          {form.gallery.map((url, index) => (
            <div key={index} className={styles.mediaItem}>
              <div className={styles.mediaItemContent}>
                <Input
                  type="url"
                  value={url}
                  onChange={e => updateGalleryItem(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {url && <ImagePreview src={url} alt={`Gallery ${index + 1} preview`} />}
              </div>
              <Button
                type="button"
                onClick={() => removeGalleryItem(index)}
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
        {loading
          ? isEditMode
            ? 'Saving...'
            : 'Creating...'
          : isEditMode
            ? 'Save'
            : 'Create Project'}
      </Button>
    </form>
  )
}
