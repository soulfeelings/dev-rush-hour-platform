import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminKey } from '../utils/adminApi'
import { API_URL, BASE_PATH } from '../api/constants'

const MEDIA_QUERY_KEY = 'admin-media'

// --- Types ---

export type MediaItem = {
  id: string
  mimeType: string
  ext: string
  sizeBytes: number | null
  status: string
  createdAt: string
  originalName?: string
}

type MediaUrlItem = {
  id: string
  url: string
  expiresIn: number
}

type MediaUrlsResponse = {
  items: MediaUrlItem[]
  notFound: string[]
}

type UploadResponse = {
  id: string
  url: string
}

// --- API functions ---

const baseUrl = `${API_URL}${BASE_PATH}`

function adminHeaders(): Record<string, string> {
  const adminKey = getAdminKey()
  if (!adminKey) throw new Error('Admin key not found')
  return {
    'X-Admin-Key': adminKey,
    'Content-Type': 'application/json',
  }
}

export async function listMedia(params?: {
  status?: string
  limit?: number
  offset?: number
}): Promise<MediaItem[]> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.offset) search.set('offset', String(params.offset))

  const qs = search.toString()
  const url = `${baseUrl}/admin/media${qs ? `?${qs}` : ''}`

  const res = await fetch(url, { headers: adminHeaders() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `Failed to list media: ${res.statusText}`)
  }
  return res.json()
}

export async function uploadMedia(file: File): Promise<UploadResponse> {
  const adminKey = getAdminKey()
  if (!adminKey) throw new Error('Admin key not found')

  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${baseUrl}/admin/media/upload`, {
    method: 'POST',
    headers: { 'X-Admin-Key': adminKey },
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `Upload failed: ${res.statusText}`)
  }
  return res.json()
}

export async function deleteMedia(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/admin/media/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `Failed to delete media: ${res.statusText}`)
  }
}

export async function getMediaUrls(ids: string[]): Promise<MediaUrlsResponse> {
  if (ids.length === 0) return { items: [], notFound: [] }

  const res = await fetch(`${baseUrl}/media/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `Failed to get media URLs: ${res.statusText}`)
  }
  return res.json()
}

// --- React Query hooks ---

export function useMediaList(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [MEDIA_QUERY_KEY, params],
    queryFn: () => listMedia(params),
  })
}

export function useMediaUrls(ids: string[]) {
  return useQuery({
    queryKey: [MEDIA_QUERY_KEY, 'urls', ids],
    queryFn: () => getMediaUrls(ids),
    enabled: ids.length > 0,
  })
}

export function useMediaUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
    },
  })
}

export function useMediaDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
    },
  })
}
