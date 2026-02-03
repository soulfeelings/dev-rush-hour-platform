import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FiltersProvider } from './contexts'
import Header from './features/Header'
import Catalog from './pages/Catalog/Catalog'
import Apartments from './pages/Apartments'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import LotDetail from './pages/LotDetail'
import ProjectArea from './pages/ProjectArea'
import DistrictDetail from './pages/DistrictDetail'
import DeveloperDetail from './pages/DeveloperDetail'
import DesignDemo from './design-demo/DesignDemo'
import Admin from './pages/Admin'
import { ADMIN_ROUTES } from './pages/Admin/constants'
import { ROUTES } from './constants/routes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <FiltersProvider>
        <Header />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path={ROUTES.CATALOG} element={<Navigate to={ROUTES.PROJECTS} replace />} />
            <Route path={ROUTES.PROJECTS} element={<Catalog />} />
            <Route path={ROUTES.APARTMENTS} element={<Apartments />} />
            <Route path={ROUTES.PROJECT_DETAIL} element={<ProjectDetail />} />
            <Route path={ROUTES.LOT_DETAIL} element={<LotDetail />} />
            <Route path={ROUTES.AREAS} element={<ProjectArea />} />
            <Route path={ROUTES.AREA_DETAIL} element={<DistrictDetail />} />
            <Route path={ROUTES.DEVELOPER_DETAIL} element={<DeveloperDetail />} />
            <Route path={ROUTES.DESIGN_DEMO} element={<DesignDemo />} />
            <Route
              path={ADMIN_ROUTES.BASE}
              element={<Navigate to={ADMIN_ROUTES.PROJECTS} replace />}
            />
            <Route path={`${ADMIN_ROUTES.BASE}/*`} element={<Admin />} />
          </Routes>
        </div>
      </FiltersProvider>
    </BrowserRouter>
  )
}

export default App
