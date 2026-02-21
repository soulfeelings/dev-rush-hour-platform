import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider, useMsal } from '@azure/msal-react'
import { adminFetch } from '../../utils/adminApi'
import { ADMIN_ROUTES } from './constants'
import { AdminMsalProviderContext } from './AdminMsalProviderContext'
import { useAdminMsalProvider } from './useAdminMsalProvider'

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: 'sessionStorage' },
})

function MsalRedirectHandler() {
  const { setLoading } = useAdminMsalProvider()
  const { instance } = useMsal()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    instance.handleRedirectPromise()
      .then(async (result) => {
        console.log('[MSAL] handleRedirectPromise', result)
        if (!result?.accessToken) return

        try {
          const res = await adminFetch('/admin/auth/microsoft', {
            method: 'POST',
            body: JSON.stringify({ access_token: result.accessToken }),
          })
          if (res.ok) {
            navigate(ADMIN_ROUTES.PROJECTS, { replace: true })
          } else {
            const body = await res.json().catch(() => ({}))
            navigate(ADMIN_ROUTES.AUTH, {
              replace: true,
              state: { error: body.error || 'Access denied' },
            })
          }
        } catch {
          navigate(ADMIN_ROUTES.AUTH, {
            replace: true,
            state: { error: 'Login failed. Please try again.' },
          })
        } finally {
          setLoading(false)
        }
      })
      .catch((e) => console.error('[MSAL] handleRedirectPromise error', e)).finally(() => setLoading(false))
  }, [instance, navigate, setLoading])

  return null
}

type Props = { children: React.ReactNode }


export function AdminMsalProvider({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    msalInstance.initialize().then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <MsalProvider instance={msalInstance}>
      <AdminMsalProviderContext.Provider value={{ loading, setLoading }}>
        <MsalRedirectHandler />
        {children}
      </AdminMsalProviderContext.Provider>
    </MsalProvider>
  )
}
