// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Inventory from './components/Inventory';
import AdminDashboard from './components/AdminDashboard';
import SalesHistory from './components/SalesHistory';
import Login from './components/Login';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check for authentication on component mount
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  // Theme configuration
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#303030' : '#f5f5f5',
        paper: darkMode ? '#424242' : '#ffffff',
      },
    },
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('token', 'some-token'); // You should use a real token
    localStorage.setItem('role', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Protected Route component
  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    return element;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <>
          {isAuthenticated && (
            <Navbar
              darkMode={darkMode}
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
              userRole={userRole}
            />
          )}
          <div style={{ padding: isAuthenticated ? '20px' : 0 }}>
            <Routes>
              {isAuthenticated ? (
                <>
                  <Route
                    path="/"
                    element={<Navigate to="/inventory" replace />}
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute
                        element={<Inventory />}
                        allowedRoles={['admin', 'employee']}
                      />
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute
                        element={<AdminDashboard />}
                        allowedRoles={['admin']}
                      />
                    }
                  />
                  <Route
                    path="/sales-history"
                    element={
                      <ProtectedRoute
                        element={<SalesHistory />}
                        allowedRoles={['admin', 'employee']}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route
                    path="/login"
                    element={<Login onLogin={handleLogin} />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                  />
                </>
              )}
            </Routes>
          </div>
        </>
      </Router>
    </ThemeProvider>
  );
}

export default App;



