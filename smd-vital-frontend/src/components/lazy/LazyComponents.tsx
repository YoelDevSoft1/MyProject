import React, { Suspense, lazy } from 'react';
import { LoadingSpinner, SkeletonCard } from '../common/LoadingSpinner';

// Lazy load de páginas principales
export const LazyDashboardPage = lazy(() => 
  import('../../pages/DashboardPage').then(module => ({ default: module.DashboardPage }))
);

export const LazyAppointmentsPage = lazy(() => 
  import('../../pages/AppointmentsPage').then(module => ({ default: module.AppointmentsPage }))
);

export const LazyMedicalRecordsPage = lazy(() => 
  import('../../pages/MedicalRecordsPage').then(module => ({ default: module.MedicalRecordsPage }))
);

export const LazyPaymentsPage = lazy(() => 
  import('../../pages/PaymentsPage').then(module => ({ default: module.PaymentsPage }))
);

export const LazyNotificationsPage = lazy(() => 
  import('../../pages/NotificationsPage').then(module => ({ default: module.NotificationsPage }))
);

export const LazyProfilePage = lazy(() => 
  import('../../pages/ProfilePage').then(module => ({ default: module.ProfilePage }))
);

export const LazyAdminPage = lazy(() => 
  import('../../pages/AdminPage').then(module => ({ default: module.AdminPage }))
);

export const LazyMedicalAdvancedPage = lazy(() => 
  import('../../pages/MedicalAdvancedPage').then(module => ({ default: module.MedicalAdvancedPage }))
);

export const LazyAIPage = lazy(() => 
  import('../../pages/AIPage').then(module => ({ default: module.AIPage }))
);

// Lazy load de componentes pesados
export const LazyCharts = lazy(() => 
  import('../charts/ChartsContainer').then(module => ({ default: module.ChartsContainer }))
);

export const LazyCalendar = lazy(() => 
  import('../calendar/AppointmentCalendar').then(module => ({ default: module.AppointmentCalendar }))
);

// Wrapper con Suspense para lazy components
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner size="lg" text="Cargando componente..." />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Wrapper específico para páginas
export const PageWrapper: React.FC<LazyWrapperProps> = ({ children }) => (
  <LazyWrapper fallback={<SkeletonCard className="min-h-96" />}>
    {children}
  </LazyWrapper>
);

// Wrapper para componentes de gráficos
export const ChartWrapper: React.FC<LazyWrapperProps> = ({ children }) => (
  <LazyWrapper fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
    <LoadingSpinner text="Cargando gráficos..." />
  </div>}>
    {children}
  </LazyWrapper>
);

