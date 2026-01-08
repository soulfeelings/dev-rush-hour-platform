import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './features/Header'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import ProjectArea from './pages/ProjectArea'
import DistrictDetail from './pages/DistrictDetail'
import DesignDemo from './design-demo/DesignDemo'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />
          <Route path="/areas" element={<ProjectArea />} />
          <Route path="/area/:id" element={<DistrictDetail />} />
          <Route path="/design-demo" element={<DesignDemo />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
