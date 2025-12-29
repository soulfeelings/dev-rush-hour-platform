import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './features/Header'
import Catalog from './pages/Catalog'
import ProjectDetail from './pages/ProjectDetail'
import DesignDemo from './design-demo/DesignDemo'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/design-demo" replace />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/design-demo" element={<DesignDemo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
