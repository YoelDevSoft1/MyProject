// SMD VITAL - Intelligent Redirect Component
// Componente para redirección inteligente basada en detección de tipo de usuario

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Badge,
  Icon,
  useColorModeValue,
  Fade,
  ScaleFade
} from '@chakra-ui/react';
import {
  MdPerson,
  MdLocalHospital,
  MdHealing,
  MdAdminPanelSettings,
  MdEvent,
  MdBuild,
  MdLocalPharmacy,
  MdWarning
} from 'react-icons/md';

const IntelligentRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    userDetection, 
    detectionLoading, 
    getRouteConfig, 
    getWelcomeMessage,
    detectUserType 
  } = useAuth();
  
  const [redirecting, setRedirecting] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);
  
  // Colores del tema - TODOS los hooks deben ir al inicio
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const loadingBgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const cardTextColor = useColorModeValue('gray.700', 'gray.200');

  // Iconos por tipo de usuario
  const userIcons = {
    doctor: MdLocalHospital,
    nurse: MdHealing,
    admin: MdAdminPanelSettings,
    receptionist: MdEvent,
    technician: MdBuild,
    pharmacist: MdLocalPharmacy,
    patient: MdPerson
  };

  useEffect(() => {
    const handleRedirect = async () => {
      // Si no hay detección aún, intentar detectar
      if (!userDetection && !detectionLoading) {
        await detectUserType();
        return;
      }

      // Si aún está cargando, esperar
      if (detectionLoading) {
        return;
      }

      // Si no hay detección después de cargar, mostrar opciones manuales
      if (!userDetection) {
        setShowManualOverride(true);
        return;
      }

      const routeConfig = getRouteConfig();
      if (!routeConfig) {
        setShowManualOverride(true);
        return;
      }

      // Redirigir basándose en la confianza de la detección
      if (routeConfig.shouldRedirect) {
        setRedirecting(true);
        
        // Pequeño delay para mostrar la información de redirección
        setTimeout(() => {
          navigate(routeConfig.primaryRoute, { replace: true });
        }, 2000);
      } else {
        // Si la confianza es baja, mostrar opciones
        setShowManualOverride(true);
      }
    };

    handleRedirect();
  }, [userDetection, detectionLoading, navigate, getRouteConfig, detectUserType]);

  const handleManualRedirect = (route) => {
    setRedirecting(true);
    navigate(route, { replace: true });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.5) return 'yellow';
    return 'red';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'Alta confianza';
    if (confidence >= 0.5) return 'Confianza media';
    return 'Baja confianza';
  };

  if (detectionLoading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={loadingBgColor}
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor} fontSize="lg">
            Detectando tipo de usuario...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (redirecting) {
    const routeConfig = getRouteConfig();
    const welcomeMessage = getWelcomeMessage();
    const UserIcon = userIcons[routeConfig?.detectedType] || MdPerson;

    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={loadingBgColor}
      >
        <ScaleFade in={true} initialScale={0.9}>
          <Box
            maxW="md"
            w="full"
            bg={cardBgColor}
            rounded="lg"
            shadow="xl"
            p={8}
            border="1px"
            borderColor={cardBorderColor}
            textAlign="center"
          >
            <VStack spacing={6}>
              <Icon as={UserIcon} w={16} h={16} color={routeConfig?.primaryColor || 'brand.500'} />
              
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color={cardTextColor}>
                  {welcomeMessage?.title || 'Redirigiendo...'}
                </Text>
                <Text color="gray.500" fontSize="lg">
                  {welcomeMessage?.subtitle || 'Preparando su panel personalizado'}
                </Text>
              </VStack>

              <VStack spacing={3}>
                <Badge
                  colorScheme={getConfidenceColor(routeConfig?.confidence)}
                  fontSize="sm"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  {getConfidenceText(routeConfig?.confidence)}
                </Badge>
                
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {welcomeMessage?.description}
                </Text>
              </VStack>

              <HStack spacing={2}>
                <Spinner size="sm" color="brand.500" />
                <Text fontSize="sm" color="gray.500">
                  Redirigiendo a {routeConfig?.name}...
                </Text>
              </HStack>
            </VStack>
          </Box>
        </ScaleFade>
      </Box>
    );
  }

  if (showManualOverride) {
    const routeConfig = getRouteConfig();
    const welcomeMessage = getWelcomeMessage();

    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={loadingBgColor}
        p={4}
      >
        <Fade in={true}>
          <Box
            maxW="2xl"
            w="full"
            bg={cardBgColor}
            rounded="lg"
            shadow="xl"
            p={8}
            border="1px"
            borderColor={cardBorderColor}
          >
            <VStack spacing={6}>
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color={cardTextColor}>
                  Seleccione su tipo de usuario
                </Text>
                <Text color="gray.500" textAlign="center">
                  El sistema no pudo detectar automáticamente su tipo de usuario. 
                  Por favor, seleccione la interfaz que mejor se adapte a su rol.
                </Text>
              </VStack>

              {routeConfig && (
                <Alert status="info" rounded="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">
                      Detección automática: {routeConfig.name}
                    </AlertTitle>
                    <AlertDescription fontSize="sm">
                      Confianza: {Math.round(routeConfig.confidence * 100)}% - 
                      {routeConfig.reasons?.join(', ')}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <VStack spacing={3} w="full">
                {[
                  { type: 'doctor', name: 'Panel del Doctor', icon: MdLocalHospital, color: '#2D5A87' },
                  { type: 'nurse', name: 'Panel de Enfermería', icon: MdHealing, color: '#4A90E2' },
                  { type: 'admin', name: 'Panel de Administración', icon: MdAdminPanelSettings, color: '#E74C3C' },
                  { type: 'receptionist', name: 'Panel de Recepción', icon: MdEvent, color: '#F39C12' },
                  { type: 'patient', name: 'Mi Panel de Salud', icon: MdPerson, color: '#27AE60' }
                ].map(({ type, name, icon: IconComponent, color }) => (
                  <Button
                    key={type}
                    w="full"
                    variant="outline"
                    leftIcon={<Icon as={IconComponent} />}
                    onClick={() => handleManualRedirect(`/admin/${type}-dashboard`)}
                    colorScheme={routeConfig?.detectedType === type ? 'blue' : 'gray'}
                    bg={routeConfig?.detectedType === type ? 'blue.50' : 'transparent'}
                    borderColor={routeConfig?.detectedType === type ? 'blue.300' : 'gray.300'}
                    _hover={{
                      bg: routeConfig?.detectedType === type ? 'blue.100' : 'gray.50'
                    }}
                  >
                    {name}
                    {routeConfig?.detectedType === type && (
                      <Badge ml={2} colorScheme="blue" variant="subtle">
                        Recomendado
                      </Badge>
                    )}
                  </Button>
                ))}
              </VStack>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Puede cambiar esta configuración más tarde en su perfil de usuario.
              </Text>
            </VStack>
          </Box>
        </Fade>
      </Box>
    );
  }

  return null;
};

export default IntelligentRedirect;
