import { apiClient } from './client'
import { API_URL, BASE_PATH } from './constants'
import type { Error as ApiError } from './generated/schemas/error'

type RequestConfig = {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: Record<string, unknown>
  data?: unknown
  signal?: AbortSignal
  headers?: HeadersInit
}

export const adminInstance = async <T>(
  config: RequestConfig,
  options?: RequestInit
): Promise<T> => {
  const { url, method, params, data, signal, headers: configHeaders } = config

  const baseUrl = API_URL
  let fullPath = `${baseUrl}${BASE_PATH}${url.startsWith('/') ? url : `/${url}`}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      fullPath += `?${queryString}`
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  const headers = configHeaders
    ? { ...defaultHeaders, ...configHeaders }
    : options?.headers
      ? { ...defaultHeaders, ...options.headers }
      : defaultHeaders

  const response = await apiClient.fetch(fullPath, {
    ...options,
    method,
    signal: signal || options?.signal,
    headers,
    credentials: 'include',
    body: data ? JSON.stringify(data) : options?.body,
  })

  if (!response.ok) {
    const body: ApiError | null = await response.json().catch(() => null)
    const message = body?.error?.message || `API Error: ${response.statusText}`
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
