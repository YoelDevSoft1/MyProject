// SMD VITAL - Public Route Component
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

/**
 * Componente para rutas públicas (login, registro, etc.)
 * Redirige automáticamente al dashboard si el usuario ya está autenticado
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

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

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Si no está autenticado, mostrar el contenido público
  return children;
};

export default PublicRoute;
