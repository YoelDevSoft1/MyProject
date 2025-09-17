import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  EditIcon, 
  EmailIcon, 
  PhoneIcon, 
  CalendarIcon,
  StarIcon,
  CheckIcon
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const UserProfileCard = ({ onEdit, showActions = true }) => {
  const { user, token } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chakra Color Mode
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.700", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUserProfile(token);
      
      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Error al cargar el perfil');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el perfil');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      admin: 'purple',
      doctor: 'blue',
      nurse: 'green',
      patient: 'orange',
      user: 'gray'
    };
    return roleColors[role] || 'gray';
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'Administrador',
      doctor: 'Médico',
      nurse: 'Enfermero/a',
      patient: 'Paciente',
      user: 'Usuario'
    };
    return roleLabels[role] || 'Usuario';
  };

  if (loading) {
    return (
      <Box bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" p={6}>
        <HStack justify="center" py={8}>
          <Spinner size="lg" color="brand.500" />
          <Text>Cargando perfil...</Text>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" p={6}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error al cargar el perfil</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Box>
    );
  }

  const displayProfile = profile || user;

  if (!displayProfile) {
    return (
      <Box bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg" p={6}>
        <Text textAlign="center" color={textColorSecondary}>
          No se encontró información del perfil
        </Text>
      </Box>
    );
  }

  return (
    <Box bg={cardBg} border="1px" borderColor={borderColor} boxShadow="lg" borderRadius="lg" p={6}>
      <Box pb={2}>
        <HStack justify="space-between" align="start">
          <HStack spacing={4}>
            <Avatar
              size="xl"
              name={displayProfile.name}
              src={displayProfile.avatar || displayProfile.profile_picture}
              bg="brand.500"
            />
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                {displayProfile.name || 'Usuario'}
              </Text>
              <Badge 
                colorScheme={getRoleColor(displayProfile.role)} 
                variant="subtle"
                fontSize="sm"
              >
                {getRoleLabel(displayProfile.role)}
              </Badge>
              {displayProfile.specialty && (
                <Text fontSize="sm" color={textColorSecondary}>
                  {displayProfile.specialty}
                </Text>
              )}
            </VStack>
          </HStack>
          
          {showActions && onEdit && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<EditIcon />}
              onClick={onEdit}
            >
              Editar
            </Button>
          )}
        </HStack>
      </Box>

      <Box pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Información de contacto */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
              Información de Contacto
            </Text>
            <VStack spacing={2} align="stretch">
              {displayProfile.email && (
                <HStack spacing={3}>
                  <Icon as={EmailIcon} color={textColorSecondary} />
                  <Text fontSize="sm" color={textColor}>
                    {displayProfile.email}
                  </Text>
                  {displayProfile.email_verified && (
                    <Icon as={CheckIcon} color="green.500" boxSize={3} />
                  )}
                </HStack>
              )}
              
              {displayProfile.phone && (
                <HStack spacing={3}>
                  <Icon as={PhoneIcon} color={textColorSecondary} />
                  <Text fontSize="sm" color={textColor}>
                    {displayProfile.phone}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>

          <Divider />

          {/* Información adicional */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
              Información Adicional
            </Text>
            <VStack spacing={2} align="stretch">
              {displayProfile.created_at && (
                <HStack spacing={3}>
                  <Icon as={CalendarIcon} color={textColorSecondary} />
                  <Text fontSize="sm" color={textColor}>
                    Miembro desde: {new Date(displayProfile.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </HStack>
              )}
              
              {displayProfile.last_login && (
                <HStack spacing={3}>
                  <Icon as={StarIcon} color={textColorSecondary} />
                  <Text fontSize="sm" color={textColor}>
                    Último acceso: {new Date(displayProfile.last_login).toLocaleDateString('es-ES')}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Estado del perfil */}
          <Box>
            <HStack spacing={4} wrap="wrap">
              <Badge 
                colorScheme={displayProfile.is_active ? 'green' : 'red'} 
                variant="subtle"
              >
                {displayProfile.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
              
              {displayProfile.profile_complete && (
                <Badge colorScheme="blue" variant="subtle">
                  Perfil Completo
                </Badge>
              )}
              
              {displayProfile.email_verified && (
                <Badge colorScheme="green" variant="subtle">
                  Email Verificado
                </Badge>
              )}
            </HStack>
          </Box>

          {/* Biografía */}
          {displayProfile.bio && (
            <>
              <Divider />
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                  Biografía
                </Text>
                <Text fontSize="sm" color={textColor} lineHeight="1.5">
                  {displayProfile.bio}
                </Text>
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default UserProfileCard;
