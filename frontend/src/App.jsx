import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import WarningPage from './pages/warningpage';
import Dashboard from './pages/Dashboard';

// A simple wrapper to protect routes (moved outside App to prevent remounting on state changes)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('aura_token');
  // If we want to strictly test UI without backend right now, comment out the next line and just return children.
  // if (!token) return <Navigate to="/" replace />; 
  return children;
};

function App() {
  // Simple dark mode toggle logic
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark Theme (Nocturnal Garden)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // A simple function to toggle theme from anywhere (we'll pass this as a prop)
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      {/* This global wrapper applies the base theme colors.
        Dark: Eerie Black base. Light: Off-white/Dutch white base.
      */}
      <div className={`min-h-screen transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-slate-950 text-slate-200' 
          : 'bg-amber-50/50 text-slate-800' // Amber-50 acts as our soft Dutch White base
      }`}>
        <Routes>
          <Route path="/" element={<Login toggleTheme={toggleTheme} isDarkMode={isDarkMode} />} />
          <Route path="/warning" element={<WarningPage isDarkMode={isDarkMode} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;