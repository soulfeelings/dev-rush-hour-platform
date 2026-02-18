import { useLocation } from 'react-router-dom'
import { AuthForm } from '../AuthForm'

export function AdminAuthPage() {
  const location = useLocation()
  const error = (location.state as { error?: string } | null)?.error ?? null

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '2rem 1rem' }}>
      <AuthForm error={error} />
    </div>
  )
}
