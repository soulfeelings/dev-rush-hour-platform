# Примеры использования API клиента

## Публичный API

### Получить список проектов

```typescript
import { listProjects } from '@/api'

// Простой запрос
const response = await listProjects()
if (response.status === 200) {
  const projects = response.data // Project[]
}

// С фильтрацией
const response = await listProjects({ area: 'dubai-marina' })
if (response.status === 200) {
  const projects = response.data
}
```

### Получить проект по slug

```typescript
import { getProject } from '@/api'

const response = await getProject('dubai-marina-towers')
if (response.status === 200) {
  const project = response.data // Project
} else if (response.status === 404) {
  // Проект не найден
}
```

### Получить список лотов

```typescript
import { listLots } from '@/api'

const response = await listLots({
  project: 'dubai-marina-towers',
  type: 'apartment',
  bedrooms: 2,
  priceMin: 500000,
  priceMax: 2000000,
  sort: 'price_asc',
  page: 1,
  limit: 20,
})

if (response.status === 200) {
  const lotsData = response.data // LotsListResponse
  const lots = lotsData.items // Lot[]
  const total = lotsData.total
}
```

### Создать заявку (lead)

```typescript
import { createLead } from '@/api'
import type { LeadCreateRequest } from '@/api'

const leadData: LeadCreateRequest = {
  type: 'callback',
  name: 'Иван Иванов',
  phone: '+971501234567',
  email: 'ivan@example.com',
  projectId: 'project-uuid',
  lotId: 'lot-uuid',
}

const response = await createLead(leadData)
if (response.status === 201) {
  const lead = response.data // Lead
}
```

## Админский API

### Получить список застройщиков

```typescript
import { adminListDevelopers } from '@/api/generated/admin/rushHourRealEstatePlatformAPI'

const response = await adminListDevelopers()
if (response.status === 200) {
  const developers = response.data // Developer[]
}
```

### Создать застройщика

```typescript
import { adminCreateDeveloper } from '@/api/generated/admin/rushHourRealEstatePlatformAPI'
import type { DeveloperCreateRequest } from '@/api'

const developerData: DeveloperCreateRequest = {
  slug: 'emaar',
  name: 'Emaar Properties',
  status: 'active',
}

const response = await adminCreateDeveloper(developerData)
if (response.status === 201) {
  const developer = response.data // Developer
}
```

### Обновить проект

```typescript
import { adminUpdateProject } from '@/api/generated/admin/rushHourRealEstatePlatformAPI'
import type { ProjectUpdateRequest } from '@/api'

const updateData: ProjectUpdateRequest = {
  name: 'Новое название',
  status: 'active',
}

const response = await adminUpdateProject('project-uuid', updateData)
if (response.status === 200) {
  const updatedProject = response.data // Project
}
```

## Обработка ошибок

```typescript
import { listProjects } from '@/api'

try {
  const response = await listProjects()

  if (response.status === 200) {
    // Успешный ответ
    const projects = response.data
  } else if (response.status === 500) {
    // Ошибка сервера
    const error = response.data // InternalErrorResponse
    console.error('Server error:', error)
  }
} catch (error) {
  // Ошибка сети или другая ошибка
  console.error('Request failed:', error)
}
```

## Использование в React компонентах

```typescript
import { useState, useEffect } from 'react'
import { listProjects, type Project } from '@/api'

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await listProjects()

      if (response.status === 200) {
        setProjects(response.data)
      } else {
        setError('Failed to load projects')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```
