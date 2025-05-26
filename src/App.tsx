import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Crops from './pages/Crops';
import CropDetail from './pages/CropDetail';
import LunarCalendar from './pages/LunarCalendar';
import Weather from './pages/Weather';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cultivos" element={<Crops />} />
        <Route path="cultivos/:cropId" element={<CropDetail />} />
        <Route path="calendario-lunar" element={<LunarCalendar />} />
        <Route path="clima" element={<Weather />} />
      </Route>
    </Routes>
  );
}

export default App;