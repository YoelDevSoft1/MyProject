import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import IntelligentRedirect from './components/IntelligentRedirect';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import initialTheme from './theme/medicalTheme'; //  { themeGreen }
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import SimpleFloatingButton from './components/ai/SimpleFloatingButton';
// Chakra imports

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  return (
    <ChakraProvider theme={currentTheme}>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas - solo accesibles si NO estás autenticado */}
          <Route 
            path="auth/*" 
            element={
              <PublicRoute>
                <AuthLayout />
              </PublicRoute>
            } 
          />
          
          {/* Rutas protegidas - solo accesibles si estás autenticado */}
          <Route
            path="admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="rtl/*"
            element={
              <ProtectedRoute>
                <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
              </ProtectedRoute>
            }
          />
          
          {/* Ruta de redirección inteligente - accesible solo si estás autenticado */}
          <Route 
            path="/intelligent-redirect" 
            element={
              <ProtectedRoute>
                <IntelligentRedirect />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirecciones para compatibilidad */}
          <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
          <Route path="/admin/main" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/contextual-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Ruta raíz - redirige según el estado de autenticación */}
          <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
        
        {/* Botón flotante de IA */}
        <SimpleFloatingButton />
      </AuthProvider>
    </ChakraProvider>
  );
}
