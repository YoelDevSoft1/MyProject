import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { MUIProvider } from './theme/MUIProvider';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { GlobalLoading } from './components/ui/GlobalLoading';
import { GlobalError } from './components/ui/GlobalError';
import { PerfectLayout } from './components/layout/PerfectLayout';
import { PerfectDashboard } from './components/dashboard/PerfectDashboard';
import { PerfectRegisterForm } from './components/forms/PerfectForms';
import { HorizonSidebar } from './components/horizon/HorizonSidebar';
import { HorizonDashboard } from './components/horizon/HorizonDashboard';
import { HorizonLayout } from './components/horizon/HorizonLayout';

// Auth Components
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';

// Layout Components
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages - Importing directly to avoid lazy loading issues
import { DashboardPage } from './pages/DashboardPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AIPage } from './pages/AIPage';
import { MedicalAdvancedPage } from './pages/MedicalAdvancedPage';

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
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <PerfectRegisterForm />
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <HorizonLayout>
              <HorizonDashboard />
            </HorizonLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute>
            <HorizonLayout>
              <AppointmentsPage />
            </HorizonLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/medical-records" 
        element={
          <ProtectedRoute>
            <HorizonLayout>
              <MedicalRecordsPage />
            </HorizonLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ai" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AIPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/medical-advanced" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MedicalAdvancedPage />
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
    <MUIProvider>
      <GlobalStateProvider>
        <div className="min-h-screen" style={{ backgroundColor: 'rgb(249 250 251)' }}>
          <AppRoutes />
          <NotificationContainer />
          <GlobalLoading />
          <GlobalError />
        </div>
      </GlobalStateProvider>
    </MUIProvider>
  );
}

export default App;