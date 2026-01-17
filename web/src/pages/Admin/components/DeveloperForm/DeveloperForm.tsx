import { useState } from 'react'
import { Button, Input, Select } from '../../../../ui'
import { type DeveloperCreateRequest } from '../../../../api'
import styles from './DeveloperForm.module.scss'

type DeveloperFormProps = {
  onSubmit: (data: DeveloperCreateRequest) => void
  loading: boolean
}

export function DeveloperForm({ onSubmit, loading }: DeveloperFormProps) {
  const [form, setForm] = useState({
    slug: '',
    name: '',
    status: 'active',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: DeveloperCreateRequest = {
      slug: form.slug,
      name: form.name,
      status: form.status as 'active' | 'inactive',
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Slug"
        value={form.slug}
        onChange={e => setForm({ ...form, slug: e.target.value })}
        required
      />
      <Input
        label="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
      />
      <Select
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        value={form.status}
        onChange={value => setForm({ ...form, status: value })}
      />
      <Button type="submit" disabled={loading} fullWidth>
        {loading ? 'Creating...' : 'Create Developer'}
      </Button>
    </form>
  )
}
