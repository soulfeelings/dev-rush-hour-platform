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
      <h1>Admin Access</h1>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter username"
          required
          autoComplete="username"
        />
        <Input
          type="password"
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          autoComplete="current-password"
        />
        {error && <div className={styles.error}>{error}</div>}
        <Button type="submit" fullWidth>
          Login
        </Button>
      </form>
    </div>
  )
}
