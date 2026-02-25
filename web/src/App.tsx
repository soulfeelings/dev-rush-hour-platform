import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FiltersProvider } from './contexts'
import { SettingsProvider } from './features/Settings/Settings'
import Header from './features/Header'
import Catalog from './pages/Catalog/Catalog'
import Apartments from './pages/Apartments'
import Home from './pages/Home/Home'
import ProjectDetail from './pages/ProjectDetail'
import LotDetail from './pages/LotDetail'
import ProjectArea from './pages/ProjectArea'
import DistrictDetail from './pages/DistrictDetail'
import DeveloperDetail from './pages/DeveloperDetail'
import DesignDemo from './design-demo/DesignDemo'
import { ROUTES } from './constants/routes'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { FullPageSpinner } from './ui'
import AmplitudePageTracker from './lib/AmplitudePageTracker'
import './App.css'

const AdminApp = lazy(() => import('./pages/Admin/AdminApp'))

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AmplitudePageTracker />
        <SettingsProvider>
          <Header />
          <div style={{ flex: 1, overflow: 'auto' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path={ROUTES.CATALOG} element={<Navigate to={ROUTES.PROJECTS} replace />} />
                <Route path={ROUTES.PROJECTS} element={<FiltersProvider><Catalog /></FiltersProvider>} />
                <Route path={ROUTES.APARTMENTS} element={<Apartments />} />
                <Route path={ROUTES.PROJECT_DETAIL} element={<ProjectDetail />} />
                <Route path={ROUTES.LOT_DETAIL} element={<LotDetail />} />
                <Route path={ROUTES.AREAS} element={<ProjectArea />} />
                <Route path={ROUTES.AREA_DETAIL} element={<DistrictDetail />} />
                <Route path={ROUTES.DEVELOPER_DETAIL} element={<DeveloperDetail />} />
                <Route path={ROUTES.DESIGN_DEMO} element={<DesignDemo />} />
                <Route
                  path="/admin/*"
                  element={
                    <Suspense fallback={<FullPageSpinner />}>
                      <AdminApp />
                    </Suspense>
                  }
                />
              </Routes>
          </div>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
