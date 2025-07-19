import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
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
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Routes WITH DataProvider */}
            <Route path="/" element={
              <DataProvider>
                <Layout>
                  <Dashboard />
                </Layout>
              </DataProvider>
            } />
            <Route path="/locations" element={
              <DataProvider>
                <Layout>
                  <Locations />
                </Layout>
              </DataProvider>
            } />
            <Route path="/martyrs" element={
              <DataProvider>
                <Layout>
                  <Martyrs />
                </Layout>
              </DataProvider>
            } />
            <Route path="/activities" element={
              <DataProvider>
                <Layout>
                  <Activities />
                </Layout>
              </DataProvider>
            } />
            <Route path="/news" element={
              <DataProvider>
                <Layout>
                  <News />
                </Layout>
              </DataProvider>
            } />

            {/* Routes WITHOUT DataProvider - Fast loading */}
            <Route path="/martyrs/:id" element={
              <Layout>
                <MartyrDetail />
              </Layout>
            } />
            <Route path="/locations/:id" element={
              <Layout>
                <LocationDetail />
              </Layout>
            } />
            <Route path="/news/:id" element={
              <Layout>
                <NewsDetail />
              </Layout>
            } />
            <Route path="/activities/:id" element={
              <Layout>
                <ActivityDetail />
              </Layout>
            } />
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
