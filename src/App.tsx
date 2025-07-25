import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import FaviconManager from './components/FaviconManager';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import LocationDetail from './pages/LocationDetail';
import Martyrs from './pages/Martyrs';
import MartyrDetail from './pages/MartyrDetail';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FaviconManager />
        <DataProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="locations" element={<Locations />} />
                <Route path="locations/:id" element={<LocationDetail />} />
                <Route path="martyrs" element={<Martyrs />} />
                <Route path="martyrs/:id" element={<MartyrDetail />} />
                <Route path="activities" element={<Activities />} />
                <Route path="activities/:id" element={<ActivityDetail />} />
                <Route path="news" element={<News />} />
                <Route path="news/:id" element={<NewsDetail />} />
              </Route>
            </Routes>
          </Router>
        </DataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
