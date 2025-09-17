import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { GlobalLoading } from './components/ui/GlobalLoading';
import { GlobalError } from './components/ui/GlobalError';

// Auth Components
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';

// Layout Components
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Simple Dashboard
import { SimpleDashboard } from './components/dashboard/SimpleDashboard';

// Utility Pages
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoadingPage } from './pages/LoadingPage';

// Hooks
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SimpleDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      {/* Utility Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      
      {/* Default Redirects */}
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <GlobalStateProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
        <NotificationContainer />
        <GlobalLoading />
        <GlobalError />
      </div>
    </GlobalStateProvider>
  );
}

export default App;
