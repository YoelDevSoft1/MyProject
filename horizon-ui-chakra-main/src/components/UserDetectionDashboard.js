// SMD VITAL - User Detection Dashboard Component
// Componente de dashboard que se adapta según el tipo de usuario detectado

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Divider,
  Tooltip,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import {
  MdPerson,
  MdLocalHospital,
  MdHealing,
  MdAdminPanelSettings,
  MdEvent,
  MdBuild,
  MdLocalPharmacy,
  MdTrendingUp,
  MdTrendingDown,
  MdInfo,
  MdWarning
} from 'react-icons/md';

const UserDetectionDashboard = () => {
  const { 
    userDetection, 
    detectionLoading, 
    getWelcomeMessage, 
    getRouteConfig,
    getRecommendedWidgets,
    getThemeConfig,
    hasPermission
  } = useAuth();
  
  const [widgets, setWidgets] = useState([]);
  
  // Colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

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
    if (userDetection) {
      const recommendedWidgets = getRecommendedWidgets();
      setWidgets(recommendedWidgets);
    }
  }, [userDetection, getRecommendedWidgets]);

  if (detectionLoading) {
    return (
      <Box p={6}>
        <Text>Cargando información personalizada...</Text>
      </Box>
    );
  }

  if (!userDetection) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Información de usuario no disponible</AlertTitle>
          <AlertDescription>
            No se pudo cargar la información de detección del usuario.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  const welcomeMessage = getWelcomeMessage();
  const routeConfig = getRouteConfig();
  const themeConfig = getThemeConfig();
  const UserIcon = userIcons[userDetection.detection.detected_type] || MdPerson;

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

  const renderWidget = (widget) => {
    const widgetComponents = {
      appointments_today: {
        title: 'Citas de Hoy',
        value: '12',
        change: '+2',
        changeType: 'increase',
        icon: MdEvent,
        color: 'blue'
      },
      patient_list: {
        title: 'Pacientes Activos',
        value: '45',
        change: '+5',
        changeType: 'increase',
        icon: MdPerson,
        color: 'green'
      },
      medical_records: {
        title: 'Expedientes',
        value: '128',
        change: '+12',
        changeType: 'increase',
        icon: MdLocalHospital,
        color: 'purple'
      },
      prescriptions: {
        title: 'Recetas',
        value: '23',
        change: '-3',
        changeType: 'decrease',
        icon: MdLocalPharmacy,
        color: 'orange'
      },
      schedule: {
        title: 'Horario',
        value: '8:00 AM',
        change: 'Próxima cita',
        changeType: 'neutral',
        icon: MdEvent,
        color: 'teal'
      },
      notifications: {
        title: 'Notificaciones',
        value: '5',
        change: 'Sin leer',
        changeType: 'neutral',
        icon: MdInfo,
        color: 'red'
      }
    };

    const widgetData = widgetComponents[widget] || {
      title: widget,
      value: 'N/A',
      change: '',
      changeType: 'neutral',
      icon: MdInfo,
      color: 'gray'
    };

    const WidgetIcon = widgetData.icon;

    return (
      <Card key={widget} size="sm" variant="outline">
        <CardBody>
          <Stat>
            <HStack justify="space-between" align="flex-start">
              <VStack align="flex-start" spacing={1}>
                <StatLabel fontSize="sm" color="gray.500">
                  {widgetData.title}
                </StatLabel>
                <StatNumber fontSize="2xl" color={textColor}>
                  {widgetData.value}
                </StatNumber>
                {widgetData.change && (
                  <StatHelpText fontSize="xs">
                    <HStack spacing={1}>
                      {widgetData.changeType === 'increase' && <Icon as={MdTrendingUp} color="green.500" />}
                      {widgetData.changeType === 'decrease' && <Icon as={MdTrendingDown} color="red.500" />}
                      <Text color={widgetData.changeType === 'increase' ? 'green.500' : 
                                   widgetData.changeType === 'decrease' ? 'red.500' : 'gray.500'}>
                        {widgetData.change}
                      </Text>
                    </HStack>
                  </StatHelpText>
                )}
              </VStack>
              <Icon as={WidgetIcon} w={6} h={6} color={`${widgetData.color}.500`} />
            </HStack>
          </Stat>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box p={6} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header con información de detección */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between" align="flex-start">
              <HStack spacing={4}>
                <Icon 
                  as={UserIcon} 
                  w={12} 
                  h={12} 
                  color={themeConfig?.primaryColor || 'brand.500'} 
                />
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                    {welcomeMessage?.title || 'Bienvenido'}
                  </Text>
                  <Text color="gray.500" fontSize="lg">
                    {welcomeMessage?.subtitle || 'Panel personalizado'}
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    {welcomeMessage?.description}
                  </Text>
                </VStack>
              </HStack>
              
              <VStack align="flex-end" spacing={2}>
                <Badge
                  colorScheme={getConfidenceColor(userDetection.detection.confidence)}
                  fontSize="sm"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  {getConfidenceText(userDetection.detection.confidence)}
                </Badge>
                
                {userDetection.specialty && (
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                    {userDetection.specialty}
                  </Badge>
                )}
              </VStack>
            </HStack>
          </CardHeader>
          
          {userDetection.detection.reasons.length > 0 && (
            <CardBody pt={0}>
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Razones de detección:
                </Text>
                <Wrap>
                  {userDetection.detection.reasons.map((reason, index) => (
                    <WrapItem key={index}>
                      <Badge variant="outline" fontSize="xs">
                        {reason}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            </CardBody>
          )}
        </Card>

        {/* Información de confianza */}
        {userDetection.detection.confidence < 0.8 && (
          <Alert status="info" rounded="md">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">
                Detección con confianza {Math.round(userDetection.detection.confidence * 100)}%
              </AlertTitle>
              <AlertDescription fontSize="sm">
                El sistema detectó su tipo de usuario con {getConfidenceText(userDetection.detection.confidence).toLowerCase()}. 
                Puede cambiar la interfaz manualmente si es necesario.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Widgets personalizados */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Panel Personalizado
            </Text>
            <Text color="gray.500" fontSize="sm">
              Widgets recomendados para su tipo de usuario
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {widgets.map(renderWidget)}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Información de permisos */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Permisos Disponibles
            </Text>
          </CardHeader>
          <CardBody>
            <Wrap>
              {userDetection.detection.permissions.map((permission, index) => (
                <WrapItem key={index}>
                  <Badge 
                    colorScheme="green" 
                    variant="subtle" 
                    fontSize="xs"
                    px={2}
                    py={1}
                  >
                    {permission.replace(/_/g, ' ')}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </CardBody>
        </Card>

        {/* Información técnica */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Información de Detección
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Tipo detectado:</Text>
                <Badge colorScheme="blue">{userDetection.detection.detected_type}</Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Categoría:</Text>
                <Badge colorScheme="purple">{userDetection.detection.category}</Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Interfaz sugerida:</Text>
                <Badge colorScheme="teal">{userDetection.detection.suggested_interface}</Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Rol original:</Text>
                <Badge colorScheme="gray">{userDetection.original_role}</Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Confianza:</Text>
                <HStack spacing={2}>
                  <Progress 
                    value={userDetection.detection.confidence * 100} 
                    size="sm" 
                    width="100px"
                    colorScheme={getConfidenceColor(userDetection.detection.confidence)}
                  />
                  <Text fontSize="sm" color="gray.600">
                    {Math.round(userDetection.detection.confidence * 100)}%
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default UserDetectionDashboard;
