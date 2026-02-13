import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Input,
  Select,
  ImagePreview,
  YouTubePreview,
  Checkbox,
  Textarea,
  Badge as BadgeUI,
} from '../../../../ui'
import { Plus, X } from 'lucide-react'
import {
  type ProjectCreateRequest,
  type Project,
  type Badge,
  type Infrastructure,
} from '../../../../api'
import { MapPicker } from '../MapPicker'
import { generateSlug } from '../../../../utils/generateSlug'
import styles from './ProjectForm.module.scss'

import { STORAGE_KEYS } from '../../../../constants/storage'

const STORAGE_KEY = STORAGE_KEYS.PROJECT_FORM

// Функции для работы с датой формата YYYY-MM
const parseCompletionDate = (dateStr: string): { month: string; year: string } => {
  if (!dateStr || !dateStr.match(/^\d{4}-\d{2}$/)) {
    return { month: '', year: '' }
  }
  const [year, month] = dateStr.split('-')
  return { month, year }
}

const formatCompletionDate = (month: string, year: string): string => {
  if (!month || !year) return ''
  return `${year}-${month}`
}

type Developer = {
  id?: string
  name?: string
}

type Area = {
  id?: string
  name?: string
}

type ValidationErrors = {
  status?: string
  sale?: string
  hoverUrl?: string
  paymentPlan?: string
}

// Payment plan validation: numbers separated by slashes, total must equal 100
const validatePaymentPlan = (value: string): string | undefined => {
  if (!value) return undefined // Optional field

  // Check format: only digits and slashes, must start and end with digit
  const formatRegex = /^\d+(?:\/\d+)*$/
  if (!formatRegex.test(value)) {
    return 'Payment plan must be numbers separated by slashes (e.g., 60/40 or 30/10/60)'
  }

  // Check that total equals 100
  const numbers = value.split('/').map(n => parseInt(n, 10))
  const total = numbers.reduce((sum, n) => sum + n, 0)
  if (total !== 100) {
    return `Payment plan must total 100% (currently ${total}%)`
  }

  return undefined
}

type FormData = {
  slug: string
  name: string
  status: string
  sale: string
  developerId: string
  areaId: string
  lat: string
  lng: string
  coverUrl: string
  hoverUrl: string
  logoUrl: string
  gallery: string[]
  youtubeUrl: string
  timeline: {
    projectAnnouncement: string
    bookingStarted: string
    constructionStarted: string
    constructionProgress: string
    constructionProgressPercent: string
    expectedCompletion: string
  }
  description: string
  roi: string
  ourPrice: string
  developerPrice: string
  paymentPlan: string
  completionDate: string
  isFeatured: boolean
  badgeIds: string[]
  infrastructureIds: string[]
}

type ProjectFormProps = {
  developers: Developer[]
  areas: Area[]
  badges: Badge[]
  infrastructures: Infrastructure[]
  onSubmit: (data: ProjectCreateRequest) => void
  loading: boolean
  initialData?: Project | null
  isEditMode?: boolean
}

export function ProjectForm({
  developers,
  areas,
  badges,
  infrastructures,
  onSubmit,
  loading,
  initialData,
  isEditMode = false,
}: ProjectFormProps) {
  const { t } = useTranslation()

  // Получаем переведенные месяцы
  const MONTHS = useMemo(
    () => [
      { value: '01', label: t('admin.projectForm.completionDate.months.january') },
      { value: '02', label: t('admin.projectForm.completionDate.months.february') },
      { value: '03', label: t('admin.projectForm.completionDate.months.march') },
      { value: '04', label: t('admin.projectForm.completionDate.months.april') },
      { value: '05', label: t('admin.projectForm.completionDate.months.may') },
      { value: '06', label: t('admin.projectForm.completionDate.months.june') },
      { value: '07', label: t('admin.projectForm.completionDate.months.july') },
      { value: '08', label: t('admin.projectForm.completionDate.months.august') },
      { value: '09', label: t('admin.projectForm.completionDate.months.september') },
      { value: '10', label: t('admin.projectForm.completionDate.months.october') },
      { value: '11', label: t('admin.projectForm.completionDate.months.november') },
      { value: '12', label: t('admin.projectForm.completionDate.months.december') },
    ],
    [t]
  )

  // Годы от 2000 до 2050
  const YEARS = useMemo(
    () =>
      Array.from({ length: 51 }, (_, i) => {
        const year = 2000 + i
        return { value: year.toString(), label: year.toString() }
      }),
    []
  )
  const defaultForm = useMemo(
    () => ({
      slug: '',
      name: '',
      status: '',
      sale: '',
      developerId: '',
      areaId: '',
      lat: '',
      lng: '',
      coverUrl: '',
      hoverUrl: '',
      logoUrl: '',
      gallery: [] as string[],
      youtubeUrl: '',
      timeline: {
        projectAnnouncement: '',
        bookingStarted: '',
        constructionStarted: '',
        constructionProgress: '',
        constructionProgressPercent: '',
        expectedCompletion: '',
      },
      description: '',
      roi: '',
      ourPrice: '',
      developerPrice: '',
      paymentPlan: '',
      completionDate: '',
      isFeatured: false,
      badgeIds: [] as string[],
      infrastructureIds: [] as string[],
    }),
    []
  )

  const initialForm = useMemo(() => {
    if (initialData) {
      const descriptionValue = initialData.data?.description
      const descriptionStr =
        typeof descriptionValue === 'string'
          ? descriptionValue
          : typeof descriptionValue === 'object' && descriptionValue !== null
            ? (descriptionValue as Record<string, string>).en || ''
            : ''
      return {
        slug: initialData.slug || '',
        name: initialData.name || '',
        status: (initialData.status as string) || '',
        sale: (initialData.sale as string) || '',
        developerId: initialData.developerId || '',
        areaId: initialData.areaId || '',
        lat: initialData.lat?.toString() || '',
        lng: initialData.lng?.toString() || '',
        coverUrl: initialData.data?.media?.cover?.url || '',
        hoverUrl: initialData.data?.media?.hover?.url || '',
        logoUrl: initialData.data?.media?.logo?.url || '',
        gallery:
          initialData.data?.media?.gallery?.map(item => item.url || '').filter(Boolean) || [],
        youtubeUrl: initialData.data?.youtubeUrl || '',
        timeline: {
          projectAnnouncement: initialData.data?.timeline?.projectAnnouncement || '',
          bookingStarted: initialData.data?.timeline?.bookingStarted || '',
          constructionStarted: initialData.data?.timeline?.constructionStarted || '',
          constructionProgress: initialData.data?.timeline?.constructionProgress || '',
          constructionProgressPercent:
            initialData.data?.timeline?.constructionProgressPercent?.toString() || '',
          expectedCompletion: initialData.data?.timeline?.expectedCompletion || '',
        },
        description: descriptionStr,
        roi: initialData.data?.roi?.toString() || '',
        ourPrice: initialData.data?.ourPrice?.toString() || '',
        developerPrice: initialData.data?.developerPrice?.toString() || '',
        paymentPlan: initialData.data?.paymentPlan || '',
        completionDate: initialData.data?.completionDate || '',
        isFeatured: initialData.data?.isFeatured ?? false,
        badgeIds: initialData.badges?.map(b => b.id).filter((id): id is string => !!id) || [],
        infrastructureIds:
          initialData.infrastructures?.map(i => i.id).filter((id): id is string => !!id) || [],
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

  // Парсим completionDate на месяц и год для начального состояния
  const initialDateParsed = useMemo(
    () => parseCompletionDate(initialForm.completionDate),
    [initialForm.completionDate]
  )

  const [selectedMonth, setSelectedMonth] = useState(initialDateParsed.month)
  const [selectedYear, setSelectedYear] = useState(initialDateParsed.year)

  // Синхронизируем локальное состояние с form.completionDate при изменении initialForm
  useEffect(() => {
    setForm(initialForm)
    const parsed = parseCompletionDate(initialForm.completionDate)
    setSelectedMonth(parsed.month)
    setSelectedYear(parsed.year)
  }, [initialForm])

  // Обновляем form.completionDate при изменении месяца или года
  useEffect(() => {
    const newDate = formatCompletionDate(selectedMonth, selectedYear)
    const currentDate = form.completionDate
    if (newDate !== currentDate) {
      setForm(prev => ({ ...prev, completionDate: newDate }))
    }
  }, [selectedMonth, selectedYear, form.completionDate])

  // Обработчики для изменения месяца и года
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
  }

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
    const descriptionValue = initialData.data?.description
    const descriptionStr =
      typeof descriptionValue === 'string'
        ? descriptionValue
        : typeof descriptionValue === 'object' && descriptionValue !== null
          ? (descriptionValue as Record<string, string>).en || ''
          : ''
    return {
      slug: initialData.slug || '',
      name: initialData.name || '',
      status: (initialData.status as string) || '',
      sale: (initialData.sale as string) || '',
      developerId: initialData.developerId || '',
      areaId: initialData.areaId || '',
      lat: initialData.lat?.toString() || '',
      lng: initialData.lng?.toString() || '',
      coverUrl: initialData.data?.media?.cover?.url || '',
      hoverUrl: initialData.data?.media?.hover?.url || '',
      logoUrl: initialData.data?.media?.logo?.url || '',
      gallery: initialData.data?.media?.gallery?.map(item => item.url || '').filter(Boolean) || [],
      youtubeUrl: initialData.data?.youtubeUrl || '',
      timeline: {
        projectAnnouncement: initialData.data?.timeline?.projectAnnouncement || '',
        bookingStarted: initialData.data?.timeline?.bookingStarted || '',
        constructionStarted: initialData.data?.timeline?.constructionStarted || '',
        constructionProgress: initialData.data?.timeline?.constructionProgress || '',
        constructionProgressPercent:
          (
            initialData.data?.timeline as Record<string, unknown> | undefined
          )?.constructionProgressPercent?.toString() || '',
        expectedCompletion: initialData.data?.timeline?.expectedCompletion || '',
      },
      description: descriptionStr,
      roi: initialData.data?.roi?.toString() || '',
      ourPrice: initialData.data?.ourPrice?.toString() || '',
      developerPrice: initialData.data?.developerPrice?.toString() || '',
      paymentPlan: initialData.data?.paymentPlan || '',
      completionDate: initialData.data?.completionDate || '',
      isFeatured: initialData.data?.isFeatured ?? false,
      badgeIds: initialData.badges?.map(b => b.id).filter((id): id is string => !!id) || [],
      infrastructureIds:
        initialData.infrastructures?.map(i => i.id).filter((id): id is string => !!id) || [],
    }
  }, [initialData])

  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false
    const galleryChanged =
      form.gallery.length !== initialFormData.gallery.length ||
      form.gallery.some((url: string, idx: number) => url !== initialFormData.gallery[idx])
    const timelineChanged =
      form.timeline.projectAnnouncement !== initialFormData.timeline.projectAnnouncement ||
      form.timeline.bookingStarted !== initialFormData.timeline.bookingStarted ||
      form.timeline.constructionStarted !== initialFormData.timeline.constructionStarted ||
      form.timeline.constructionProgress !== initialFormData.timeline.constructionProgress ||
      form.timeline.constructionProgressPercent !==
        initialFormData.timeline.constructionProgressPercent ||
      form.timeline.expectedCompletion !== initialFormData.timeline.expectedCompletion
    const badgeIdsChanged =
      form.badgeIds.length !== initialFormData.badgeIds.length ||
      form.badgeIds.some((id: string, idx: number) => id !== initialFormData.badgeIds[idx])
    const infrastructureIdsChanged =
      form.infrastructureIds.length !== initialFormData.infrastructureIds.length ||
      form.infrastructureIds.some((id: string, idx: number) => id !== initialFormData.infrastructureIds[idx])
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
      form.hoverUrl !== initialFormData.hoverUrl ||
      form.logoUrl !== initialFormData.logoUrl ||
      form.youtubeUrl !== initialFormData.youtubeUrl ||
      form.description !== initialFormData.description ||
      form.roi !== initialFormData.roi ||
      form.ourPrice !== initialFormData.ourPrice ||
      form.developerPrice !== initialFormData.developerPrice ||
      form.paymentPlan !== initialFormData.paymentPlan ||
      form.completionDate !== initialFormData.completionDate ||
      form.isFeatured !== initialFormData.isFeatured ||
      galleryChanged ||
      timelineChanged ||
      badgeIdsChanged ||
      infrastructureIdsChanged
    )
  }, [form, initialFormData, isEditMode])

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState(false)

  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    if (!form.status) {
      newErrors.status = 'Status is required'
    }
    if (!form.sale) {
      newErrors.sale = 'Sale status is required'
    }
    if (!form.hoverUrl) {
      newErrors.hoverUrl = 'Hover image URL is required'
    }
    const paymentPlanError = validatePaymentPlan(form.paymentPlan)
    if (paymentPlanError) {
      newErrors.paymentPlan = paymentPlanError
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
    const payload: ProjectCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: form.status as 'active' | 'archived',
      sale: form.sale as 'sale' | 'start of sales' | 'sales announcement',
      ...(form.developerId && { developerId: form.developerId }),
      ...(form.areaId && { areaId: form.areaId }),
      ...(form.lat && { lat: parseFloat(form.lat) }),
      ...(form.lng && { lng: parseFloat(form.lng) }),
      badgeIds: form.badgeIds,
      infrastructureIds: form.infrastructureIds,
    }

    const dataPayload: Record<string, unknown> = {}

    const mediaData: Record<string, unknown> = {}
    if (form.coverUrl) {
      mediaData.cover = { url: form.coverUrl }
    }
    if (form.hoverUrl) {
      mediaData.hover = { url: form.hoverUrl }
    }
    if (form.logoUrl) {
      mediaData.logo = { url: form.logoUrl }
    }
    if (form.gallery.length > 0) {
      mediaData.gallery = form.gallery.filter(Boolean).map((url: string) => ({ url }))
    }
    if (Object.keys(mediaData).length > 0) {
      dataPayload.media = mediaData
    }

    if (form.youtubeUrl) {
      dataPayload.youtubeUrl = form.youtubeUrl
    }

    const timelineData: Record<string, string | number> = {}
    if (form.timeline.projectAnnouncement)
      timelineData.projectAnnouncement = form.timeline.projectAnnouncement
    if (form.timeline.bookingStarted) timelineData.bookingStarted = form.timeline.bookingStarted
    if (form.timeline.constructionStarted)
      timelineData.constructionStarted = form.timeline.constructionStarted
    if (form.timeline.constructionProgress)
      timelineData.constructionProgress = form.timeline.constructionProgress
    if (form.timeline.constructionProgressPercent)
      timelineData.constructionProgressPercent = parseInt(
        form.timeline.constructionProgressPercent,
        10
      )
    if (form.timeline.expectedCompletion)
      timelineData.expectedCompletion = form.timeline.expectedCompletion
    if (Object.keys(timelineData).length > 0) {
      dataPayload.timeline = timelineData
    }

    if (form.description) {
      dataPayload.description = form.description
    }
    if (form.roi) {
      dataPayload.roi = parseFloat(form.roi)
    }
    if (form.ourPrice) {
      dataPayload.ourPrice = parseFloat(form.ourPrice)
    }
    if (form.developerPrice) {
      dataPayload.developerPrice = parseFloat(form.developerPrice)
    }
    if (form.paymentPlan) {
      dataPayload.paymentPlan = form.paymentPlan
    }
    if (form.completionDate) {
      dataPayload.completionDate = form.completionDate
    }
    dataPayload.isFeatured = form.isFeatured

    if (Object.keys(dataPayload).length > 0) {
      payload.data = dataPayload
    }

    if (!isEditMode) {
      clearCache()
    }
    onSubmit(payload)
  }

  const addGalleryItem = () => {
    setForm({ ...form, gallery: [...form.gallery, ''] })
  }

  const removeGalleryItem = (index: number) => {
    setForm({ ...form, gallery: form.gallery.filter((_: string, i: number) => i !== index) })
  }

  const updateGalleryItem = (index: number, url: string) => {
    const newGallery = [...form.gallery]
    newGallery[index] = url
    setForm({ ...form, gallery: newGallery })
  }

  const toggleBadge = (badgeId: string) => {
    const newBadgeIds = form.badgeIds.includes(badgeId)
      ? form.badgeIds.filter((id: string) => id !== badgeId)
      : [...form.badgeIds, badgeId]
    setForm({ ...form, badgeIds: newBadgeIds })
  }

  const toggleInfrastructure = (infraId: string) => {
    const newInfraIds = form.infrastructureIds.includes(infraId)
      ? form.infrastructureIds.filter((id: string) => id !== infraId)
      : [...form.infrastructureIds, infraId]
    setForm({ ...form, infrastructureIds: newInfraIds })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Name"
        value={form.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const newName = e.target.value
          setForm({ ...form, name: newName, slug: generateSlug(newName) })
        }}
        required
      />
      <Input label="Slug" value={form.slug} disabled />
      <Select
        label="Status"
        options={[
          { value: '', label: 'Select Status' },
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
        error={errors.status}
      />
      <Select
        label="Sale Status"
        options={[
          { value: '', label: 'Select Sale Status' },
          { value: 'sale', label: 'Sale' },
          { value: 'start of sales', label: 'Start of Sales' },
          { value: 'sales announcement', label: 'Sales Announcement' },
        ]}
        value={form.sale}
        onChange={value => setForm({ ...form, sale: value })}
        error={errors.sale}
      />
      <label className={styles.badgeItem}>
        <Checkbox
          checked={form.isFeatured}
          onChange={() => setForm({ ...form, isFeatured: !form.isFeatured })}
        />
        <span>Featured Project</span>
      </label>
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
        <h3 className={styles.sectionTitle}>Pricing & ROI</h3>
        <div className={styles.priceRow}>
          <Input
            label="Our Price From (AED)"
            type="number"
            step="any"
            value={form.ourPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, ourPrice: e.target.value })}
            placeholder="Enter our price"
          />
          <Input
            label="Developer Price From (AED)"
            type="number"
            step="any"
            value={form.developerPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, developerPrice: e.target.value })}
            placeholder="Enter developer price"
          />
        </div>
        <Input
          label="ROI (%)"
          type="number"
          step="0.01"
          value={form.roi}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, roi: e.target.value })}
          placeholder="Return on Investment percentage"
        />
        <Input
          label="Payment Plan"
          value={form.paymentPlan}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, paymentPlan: e.target.value })}
          onBlur={() => {
            const error = validatePaymentPlan(form.paymentPlan)
            setErrors(prev => ({ ...prev, paymentPlan: error }))
          }}
          placeholder="e.g., 60/40 or 30/10/60 (must total 100%)"
          error={errors.paymentPlan}
        />
      </div>
      <div className={styles.mediaSection}>
        <h3 className={styles.sectionTitle}>Completion</h3>
        <div className={styles.completionDateRow}>
          <Select
            label={t('admin.projectForm.completionDate.year')}
            options={[
              { value: '', label: t('admin.projectForm.completionDate.selectYear') },
              ...YEARS,
            ]}
            value={selectedYear}
            onChange={handleYearChange}
          />
          <Select
            label={t('admin.projectForm.completionDate.month')}
            options={[
              { value: '', label: t('admin.projectForm.completionDate.selectMonth') },
              ...MONTHS,
            ]}
            value={selectedMonth}
            onChange={handleMonthChange}
          />
        </div>
      </div>
      <div className={styles.mediaSection}>
        <h3 className={styles.sectionTitle}>Description</h3>
        <Textarea
          label="Project Description"
          value={form.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
          placeholder="Enter project description..."
          rows={4}
        />
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
      {infrastructures.length > 0 && (
        <div className={styles.mediaSection}>
          <h3 className={styles.sectionTitle}>Complex Infrastructure</h3>
          <div className={styles.badgesList}>
            {infrastructures.map(infra => (
              <label key={infra.id} className={styles.badgeItem}>
                <Checkbox
                  checked={infra.id ? form.infrastructureIds.includes(infra.id) : false}
                  onChange={() => infra.id && toggleInfrastructure(infra.id)}
                />
                <span
                  className={styles.badgeLabel}
                  style={{
                    backgroundColor: infra.backgroundColor || '#e0e0e0',
                    color: infra.textColor || '#000000',
                  }}
                >
                  {infra.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, lat: e.target.value })}
      />
      <Input
        label="Longitude"
        type="number"
        step="any"
        value={form.lng}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, lng: e.target.value })}
      />
      <div className={styles.mediaSection}>
        <h3 className={styles.sectionTitle}>Media</h3>
        <div className={styles.coverImageWrapper}>
          <Input
            label="Cover Image URL"
            type="url"
            value={form.coverUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, coverUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          {form.coverUrl && <ImagePreview src={form.coverUrl} alt="Cover preview" />}
        </div>
        <div className={styles.coverImageWrapper}>
          <Input
            label="Hover Image URL"
            type="url"
            value={form.hoverUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, hoverUrl: e.target.value })}
            placeholder="https://example.com/hover-image.jpg"
            error={errors.hoverUrl}
            required
          />
          {form.hoverUrl && <ImagePreview src={form.hoverUrl} alt="Hover preview" />}
        </div>
        <div className={styles.coverImageWrapper}>
          <Input
            label="Project Logo URL"
            type="url"
            value={form.logoUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
          {form.logoUrl && <ImagePreview src={form.logoUrl} alt="Logo preview" />}
        </div>
        <div className={styles.mediaList}>
          <div className={styles.mediaListHeader}>
            <label className={styles.mediaListLabel}>Gallery</label>
            <Button type="button" onClick={addGalleryItem} variant="secondary" size="sm">
              <Plus size={16} />
              Add Image
            </Button>
          </div>
          {form.gallery.map((url: string, index: number) => (
            <div key={index} className={styles.mediaItem}>
              <div className={styles.mediaItemContent}>
                <Input
                  type="url"
                  value={url}
                  onChange={(e: { target: { value: string } }) => updateGalleryItem(index, e.target.value)}
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
      <div className={styles.youtubeSection}>
        <Input
          label="YouTube Video URL"
          type="url"
          value={form.youtubeUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, youtubeUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <YouTubePreview url={form.youtubeUrl} size="medium" />
      </div>
      <div className={styles.mediaSection}>
        <h3 className={styles.sectionTitle}>Project Timeline</h3>
        <Input
          label="Project Announcement"
          type="date"
          value={form.timeline.projectAnnouncement}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({
              ...form,
              timeline: { ...form.timeline, projectAnnouncement: e.target.value },
            })
          }
        />
        <Input
          label="Booking Started"
          type="date"
          value={form.timeline.bookingStarted}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({
              ...form,
              timeline: { ...form.timeline, bookingStarted: e.target.value },
            })
          }
        />
        <Input
          label="Construction Started"
          type="date"
          value={form.timeline.constructionStarted}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({
              ...form,
              timeline: { ...form.timeline, constructionStarted: e.target.value },
            })
          }
        />
        <div className={styles.progressRow}>
          <Input
            label="Construction Progress"
            type="date"
            value={form.timeline.constructionProgress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({
                ...form,
                timeline: { ...form.timeline, constructionProgress: e.target.value },
              })
            }
          />
          <Input
            label="Progress (%)"
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.timeline.constructionProgressPercent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value
              if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 100)) {
                setForm({
                  ...form,
                  timeline: { ...form.timeline, constructionProgressPercent: val },
                })
              }
            }}
            placeholder="0–100"
          />
        </div>
        <Input
          label="Expected Completion"
          type="date"
          value={form.timeline.expectedCompletion}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({
              ...form,
              timeline: { ...form.timeline, expectedCompletion: e.target.value },
            })
          }
        />
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
