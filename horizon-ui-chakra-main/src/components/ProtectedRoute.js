// SMD VITAL - Protected Route Component
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige automáticamente a login si el usuario no está autenticado
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box
        w="100%"
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <VStack spacing="4">
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color="gray.600" fontSize="lg">
            Verificando autenticación...
          </Text>
        </VStack>
      </Box>
    );
  }

  // Si no está autenticado, redirigir a login con la ruta actual guardada
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/auth/sign-in" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;
