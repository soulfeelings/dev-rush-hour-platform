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

export const customInstance = async <T>(
  config: RequestConfig,
  options?: RequestInit
): Promise<T> => {
  const { url, method, params, data, signal, headers: configHeaders } = config

  // Формируем базовый URL: если VITE_API_URL не задан, используем '/api' для работы через vite proxy
  const baseUrl = API_URL

  // Объединяем baseUrl и url, убирая лишние слэши
  let fullPath = `${baseUrl}${BASE_PATH}${url.startsWith('/') ? url : `/${url}`}`

  // Добавляем query параметры
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

  // Объединяем headers: configHeaders > defaultHeaders > options.headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  const headers = configHeaders
    ? { ...defaultHeaders, ...configHeaders }
    : options?.headers
      ? { ...defaultHeaders, ...options.headers }
      : defaultHeaders

  // Используем относительный путь для работы через vite proxy
  // Приоритет: config > options
  const response = await apiClient.fetch(fullPath, {
    ...options,
    method,
    signal: signal || options?.signal,
    headers,
    body: data ? JSON.stringify(data) : options?.body,
  })

  if (!response.ok) {
    const body: ApiError | null = await response.json().catch(() => null)
    const message = body?.error?.message || `API Error: ${response.statusText}`
    throw new Error(message)
  }

  return response.json()
}
