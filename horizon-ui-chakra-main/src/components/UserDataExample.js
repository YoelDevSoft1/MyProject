import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Divider,
  Badge,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import UserProfileCard from './UserProfileCard';
import UserNotifications from './UserNotifications';

/**
 * Componente de ejemplo que demuestra cómo usar los nuevos servicios de usuario
 * Este componente muestra cómo consumir datos del backend en cualquier vista
 */
const UserDataExample = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    profile, 
    notifications, 
    unreadCount, 
    loading, 
    error,
    loadProfile,
    updateProfile 
  } = useUserProfile();

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");

  const handleUpdateProfile = async () => {
    const updatedData = {
      name: 'Dr. Juan Pérez Actualizado',
      phone: '+57 300 123 4567',
      bio: 'Médico especialista en medicina interna con más de 10 años de experiencia.'
    };

    const result = await updateProfile(updatedData);
    if (result.success) {
      console.log('Perfil actualizado correctamente');
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert status="warning" borderRadius="lg">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">No autenticado</Text>
          <Text fontSize="sm">Debes iniciar sesión para ver los datos del usuario</Text>
        </Box>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch" p={6}>
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={4}>
          Ejemplo de Integración con Backend
        </Text>
        <Text color={textColorSecondary} mb={6}>
          Este componente demuestra cómo consumir datos del usuario desde el backend
        </Text>
      </Box>

      {/* Estado de autenticación */}
      <Box bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={2}>
          Estado de Autenticación
        </Text>
        <HStack spacing={4}>
          <Badge colorScheme="green" variant="subtle">
            Autenticado
          </Badge>
          <Text fontSize="sm" color={textColorSecondary}>
            Usuario: {user?.email || 'No disponible'}
          </Text>
        </HStack>
      </Box>

      {/* Datos del perfil desde el contexto */}
      <Box bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={2}>
          Datos del Usuario (AuthContext)
        </Text>
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Email:</strong> {user?.email || 'No disponible'}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Nombre Completo:</strong> {user?.name || 'No disponible'}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Primer Nombre:</strong> {user?.first_name || 'No disponible'}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Apellido:</strong> {user?.last_name || 'No disponible'}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Username:</strong> {user?.username || 'No disponible'}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Rol:</strong> {user?.role || 'No disponible'}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Google ID:</strong> {user?.google_id ? 'Sí' : 'No'}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            <strong>Email Verificado:</strong> {user?.email_verified ? 'Sí' : 'No'}
          </Text>
        </VStack>
      </Box>

      {/* Perfil completo desde el backend */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={4}>
          Perfil Completo (Backend)
        </Text>
        {loading && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Text>Cargando perfil del usuario...</Text>
          </Alert>
        )}
        
        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Text>Error al cargar el perfil: {error}</Text>
          </Alert>
        )}

        {profile && (
          <UserProfileCard 
            onEdit={() => console.log('Editar perfil')}
            showActions={true}
          />
        )}
      </Box>

      {/* Notificaciones */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={4}>
          Notificaciones del Usuario
        </Text>
        <HStack spacing={4}>
          <UserNotifications maxHeight="300px" />
          <Text fontSize="sm" color={textColorSecondary}>
            {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'No hay notificaciones nuevas'}
          </Text>
        </HStack>
      </Box>

      {/* Acciones de ejemplo */}
      <Box bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={4}>
          Acciones de Ejemplo
        </Text>
        <HStack spacing={4}>
          <Button 
            colorScheme="blue" 
            size="sm"
            onClick={loadProfile}
            isLoading={loading}
          >
            Recargar Perfil
          </Button>
          <Button 
            colorScheme="green" 
            size="sm"
            onClick={handleUpdateProfile}
            isLoading={loading}
          >
            Actualizar Perfil
          </Button>
          <Button 
            colorScheme="red" 
            size="sm"
            onClick={logout}
          >
            Cerrar Sesión
          </Button>
        </HStack>
      </Box>

      <Divider />

      {/* Información técnica */}
      <Box bg="gray.50" p={4} borderRadius="lg">
        <Text fontSize="md" fontWeight="semibold" color={textColor} mb={2}>
          Información Técnica
        </Text>
        <VStack align="start" spacing={1} fontSize="sm" color={textColorSecondary}>
          <Text>• Los datos se cargan automáticamente desde el backend</Text>
          <Text>• El perfil se actualiza en tiempo real</Text>
          <Text>• Las notificaciones se sincronizan con el servidor</Text>
          <Text>• El estado se mantiene consistente en toda la aplicación</Text>
        </VStack>
      </Box>
    </VStack>
  );
};

export default UserDataExample;
