import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminMsalProvider } from './AdminMsalProvider'
import { AdminAuthPage } from './components/AdminAuthPage'
import Admin from './Admin'

export default function AdminApp() {
  return (
    <AdminMsalProvider>
      <Routes>
        <Route index element={<Navigate to="projects" replace />} />
        <Route path="auth" element={<AdminAuthPage />} />
        <Route path="*" element={<Admin />} />
      </Routes>
    </AdminMsalProvider>
  )
}
