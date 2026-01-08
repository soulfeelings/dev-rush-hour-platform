import { apiClient } from './client'

// Пример настройки interceptors для API клиента
// Можно использовать в main.tsx или в отдельном файле инициализации

// Request interceptor - добавляет заголовки, логирует запросы и т.д.
apiClient.addRequestInterceptor(async config => {
  // Добавляем заголовки по умолчанию
  const headers = new Headers(config.headers)
  headers.set('Content-Type', 'application/json')

  // Можно добавить токен авторизации
  // const token = localStorage.getItem('token')
  // if (token) {
  //   headers.set('Authorization', `Bearer ${token}`)
  // }

  return {
    ...config,
    headers,
  }
})

// Response interceptor - обрабатывает ответы, логирует и т.д.
apiClient.addResponseInterceptor(async response => {
  // Логирование ответов (опционально)
  // console.log(`[API] ${response.status} ${response.url}`)

  // Обработка ошибок
  if (!response.ok) {
    // Можно обработать специфичные коды ошибок
    if (response.status === 401) {
      // Перенаправление на страницу входа
      // window.location.href = '/login'
    }
  }

  return response
})

// Error interceptor - обрабатывает ошибки сети и т.д.
apiClient.addErrorInterceptor(async error => {
  // Логирование ошибок
  console.error('[API Error]', error)

  // Можно показать toast уведомление
  // toast.error('Произошла ошибка при запросе к серверу')

  return error
})
