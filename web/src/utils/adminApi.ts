const API_URL = import.meta.env.VITE_API_URL || ''

export async function adminFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  return fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })
}
