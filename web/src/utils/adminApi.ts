const API_URL = import.meta.env.VITE_API_URL || ''

export function getAdminKey(): string | null {
  const storedKey = localStorage.getItem('admin_key')
  if (storedKey) {
    return storedKey
  }
  return null
}

export function setAdminKey(key: string): void {
  localStorage.setItem('admin_key', key)
}

export function removeAdminKey(): void {
  localStorage.removeItem('admin_key')
}

export async function adminFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const adminKey = getAdminKey()
  if (!adminKey) {
    throw new Error('Admin key not found')
  }

  const headers = new Headers(options.headers)
  headers.set('X-Admin-Key', adminKey)
  headers.set('Content-Type', 'application/json')

  return fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  })
}
