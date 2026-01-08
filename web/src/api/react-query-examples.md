# Примеры использования React Query хуков

## Публичный API

### Получить список проектов

```typescript
import { useListProjects, type Project } from '@/api'

function ProjectsList() {
  const { data, isLoading, error, refetch } = useListProjects()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const projects = data?.data || []

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  )
}
```

### Получить проект по slug с параметрами

```typescript
import { useGetProject, type Project } from '@/api'

function ProjectDetail({ slug }: { slug: string }) {
  const { data, isLoading, error } = useGetProject(slug, {
    query: {
      enabled: !!slug, // Запрос выполнится только если slug есть
      staleTime: 5 * 60 * 1000, // Кэш на 5 минут
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const project = data?.data
  if (!project) return <div>Project not found</div>

  return <div>{project.name}</div>
}
```

### Получить список лотов с фильтрами

```typescript
import { useListLots, type Lot } from '@/api'

function LotsList({ projectSlug }: { projectSlug?: string }) {
  const { data, isLoading, error } = useListLots(
    {
      project: projectSlug,
      type: 'apartment',
      bedrooms: 2,
      priceMin: 500000,
      priceMax: 2000000,
      sort: 'price_asc',
      page: 1,
      limit: 20,
    },
    {
      query: {
        enabled: !!projectSlug, // Запрос только если есть projectSlug
      },
    }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const lotsData = data?.data
  const lots = lotsData?.items || []
  const total = lotsData?.total || 0

  return (
    <div>
      <p>Found {total} lots</p>
      {lots.map(lot => (
        <div key={lot.id}>
          {lot.type} - {lot.bedrooms} bedrooms - ${lot.priceAmount}
        </div>
      ))}
    </div>
  )
}
```

### Создать заявку (mutation)

```typescript
import { useCreateLead, type LeadCreateRequest } from '@/api'
import { useQueryClient } from '@tanstack/react-query'

function LeadForm({ projectId, lotId }: { projectId?: string; lotId?: string }) {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useCreateLead({
    mutation: {
      onSuccess: () => {
        // Обновить кэш после успешного создания
        queryClient.invalidateQueries({ queryKey: ['leads'] })
        alert('Заявка создана!')
      },
      onError: (error) => {
        console.error('Failed to create lead:', error)
      },
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const leadData: LeadCreateRequest = {
      type: 'callback',
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      projectId,
      lotId,
    }

    mutate({ data: leadData })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="phone" placeholder="Phone" required />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Submit'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  )
}
```

## Админский API

### Получить список застройщиков

```typescript
import { useAdminListDevelopers, type Developer } from '@/api/generated/admin/rushHourRealEstatePlatformAPI'

function DevelopersList() {
  const { data, isLoading, error } = useAdminListDevelopers()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const developers = data?.data || []

  return (
    <div>
      {developers.map(dev => (
        <div key={dev.id}>{dev.name}</div>
      ))}
    </div>
  )
}
```

### Создать застройщика (mutation)

```typescript
import {
  useAdminCreateDeveloper,
  type DeveloperCreateRequest
} from '@/api/generated/admin/rushHourRealEstatePlatformAPI'
import { useQueryClient } from '@tanstack/react-query'

function CreateDeveloperForm() {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useAdminCreateDeveloper({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'developers'] })
        alert('Застройщик создан!')
      },
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const developerData: DeveloperCreateRequest = {
      slug: formData.get('slug') as string,
      name: formData.get('name') as string,
      status: 'active',
    }

    mutate({ data: developerData })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="slug" placeholder="Slug" required />
      <input name="name" placeholder="Name" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  )
}
```

### Обновить проект (mutation)

```typescript
import {
  useAdminUpdateProject,
  type ProjectUpdateRequest
} from '@/api/generated/admin/rushHourRealEstatePlatformAPI'
import { useQueryClient } from '@tanstack/react-query'

function UpdateProjectForm({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useAdminUpdateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] })
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
        alert('Проект обновлен!')
      },
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const updateData: ProjectUpdateRequest = {
      name: formData.get('name') as string,
      status: formData.get('status') as 'active' | 'archived',
    }

    mutate({ id: projectId, data: updateData })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <select name="status">
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  )
}
```

## Использование в хуках

```typescript
import { useListProjects, type Project } from '@/api'
import { useMemo } from 'react'

export function useProjects() {
  const { data, isLoading, error, refetch } = useListProjects()

  const projects = useMemo(() => data?.data || [], [data])

  return {
    projects,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  }
}
```

## Оптимистичные обновления

```typescript
import {
  useAdminUpdateProject,
  type ProjectUpdateRequest,
} from '@/api/generated/admin/rushHourRealEstatePlatformAPI'
import { useQueryClient } from '@tanstack/react-query'

function OptimisticUpdate({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { mutate } = useAdminUpdateProject({
    mutation: {
      onMutate: async variables => {
        // Отменить текущие запросы
        await queryClient.cancelQueries({ queryKey: ['projects', projectId] })

        // Сохранить предыдущее значение
        const previousProject = queryClient.getQueryData(['projects', projectId])

        // Оптимистично обновить кэш
        queryClient.setQueryData(['projects', projectId], (old: any) => ({
          ...old,
          ...variables.data,
        }))

        return { previousProject }
      },
      onError: (err, variables, context) => {
        // Откатить изменения при ошибке
        if (context?.previousProject) {
          queryClient.setQueryData(['projects', projectId], context.previousProject)
        }
      },
      onSettled: () => {
        // Обновить данные после завершения
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      },
    },
  })

  // ...
}
```
