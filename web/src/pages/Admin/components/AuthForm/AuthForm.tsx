import { useState } from 'react'
import { Button, Input } from '../../../../ui'
import styles from './AuthForm.module.scss'

type AuthFormProps = {
  onAuth: (username: string, password: string) => void
  error: string | null
}

export function AuthForm({ onAuth, error }: AuthFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAuth(username, password)
    setUsername('')
    setPassword('')
  }

  return (
    <div className={styles.authForm}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>Enter your credentials to continue</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <Input
            type="text"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
            required
            autoComplete="username"
          />
        </div>
        <div className={styles.inputGroup}>
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
        <div className={styles.buttonGroup}>
          <Button type="submit" fullWidth>
            Login
          </Button>
        </div>
      </form>
    </div>
  )
}
