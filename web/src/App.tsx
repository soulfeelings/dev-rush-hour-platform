import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Catalog from './pages/Catalog';
import DesignDemo from './design-demo/DesignDemo';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/design-demo" replace />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/design-demo" element={<DesignDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
