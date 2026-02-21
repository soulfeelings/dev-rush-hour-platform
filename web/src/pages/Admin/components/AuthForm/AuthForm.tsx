import { useMsal } from '@azure/msal-react'
import styles from './AuthForm.module.scss'
import { ADMIN_ROUTES } from '../../constants'
import { useAdminMsalProvider } from '../../useAdminMsalProvider'
type AuthFormProps = {
  error: string | null
}

export function AuthForm({ error }: AuthFormProps) {
  const { instance } = useMsal()
  const { loading, setLoading } = useAdminMsalProvider()

  const handleMicrosoftLogin = () => {
    setLoading(true)
    instance.loginRedirect({
      scopes: ["User.Read"], // see next section,
      redirectUri: window.location.origin + ADMIN_ROUTES.AUTH,
    });
  }

  return (
    <div className={styles.authForm}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>Sign in with your work account to continue</p>
      </div>
      <div className={styles.buttonGroup}>
        <div className={styles.providers}>
          <button
            type="button"
            className={styles.microsoftButton}
            onClick={handleMicrosoftLogin}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="9" height="9" fill="#F35325" />
                <rect x="11" y="1" width="9" height="9" fill="#81BC06" />
                <rect x="1" y="11" width="9" height="9" fill="#05A6F0" />
                <rect x="11" y="11" width="9" height="9" fill="#FFBA08" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Sign in with Microsoft'}
          </button>
        </div>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
