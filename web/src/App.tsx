import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './features/Header'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import DesignDemo from './design-demo/DesignDemo'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/design-demo" element={<DesignDemo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
