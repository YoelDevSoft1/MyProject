// SMD VITAL - Contextual Dashboard Component
// Dashboard que se adapta según el tipo de usuario detectado

import React, { useState, useEffect, useCallback } from 'react';
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
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  Icon,
  Badge,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Wrap,
  WrapItem,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import {
  MdAdd,
  MdPeople,
  MdEvent,
  MdLocalHospital,
  MdFileCopy,
  MdLocalPharmacy,
  MdSettings,
  MdBarChart,
  MdWarning,
  MdInfo,
  MdPlayArrow,
  MdSupport,
  MdFavorite,
  MdEdit,
  MdRefresh
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/dashboardService';
import appointmentBookingService from '../services/appointmentBookingService';

const ContextualDashboard = () => {
  const { 
    userDetection, 
    detectionLoading, 
    getWelcomeMessage, 
    getRouteConfig,
    hasPermission,
    detectUserType 
  } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const toast = useToast();
  
  // TODOS los hooks deben ir al inicio - colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!userDetection) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getContextualDashboard(
        localStorage.getItem('smd_vital_token'),
        userDetection,
        { force_refresh: forceRefresh }
      );
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userDetection]);

  // Efecto para cargar datos
  useEffect(() => {
    if (userDetection && !detectionLoading) {
      loadDashboardData();
    }
  }, [userDetection, detectionLoading, loadDashboardData]);

  // Efecto para detectar tipo de usuario si no está disponible
  useEffect(() => {
    if (!userDetection && !detectionLoading) {
      detectUserType();
    }
  }, [userDetection, detectionLoading, detectUserType]);

  // Manejar refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
    toast({
      title: "Dashboard actualizado",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Renderizar widget según tipo
  const renderWidget = (widget) => {
    const widgetComponents = {
      appointments_list: () => <AppointmentsListWidget widget={widget} />,
      action_card: () => <ActionCardWidget widget={widget} />,
      appointments_timeline: () => <AppointmentsTimelineWidget widget={widget} />,
      patient_queue: () => <PatientQueueWidget widget={widget} />,
      stats_cards: () => <StatsCardsWidget widget={widget} />,
      system_stats: () => <SystemStatsWidget widget={widget} />,
      approval_queue: () => <ApprovalQueueWidget widget={widget} />,
      appointments_table: () => <AppointmentsTableWidget widget={widget} />
    };

    const Component = widgetComponents[widget.type] || widgetComponents.action_card;
    return <Component key={widget.id} />;
  };

  // Renderizar acción rápida
  const renderQuickAction = (action) => {
    const actionIcons = {
      MdAdd: MdAdd,
      MdPeople: MdPeople,
      MdEvent: MdEvent,
      MdFileCopy: MdFileCopy,
      MdLocalPharmacy: MdLocalPharmacy,
      MdSettings: MdSettings,
      MdBarChart: MdBarChart,
      MdPlayArrow: MdPlayArrow,
      MdSupport: MdSupport,
      MdFavorite: MdFavorite,
      MdEdit: MdEdit
    };

    const ActionIcon = actionIcons[action.icon] || MdAdd;

    return (
      <Button
        key={action.id}
        leftIcon={<Icon as={ActionIcon} />}
        colorScheme={action.color}
        variant="outline"
        size="sm"
        onClick={() => handleQuickAction(action.id)}
      >
        {action.label}
      </Button>
    );
  };

  // Manejar acciones rápidas
  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'book_appointment':
        // Navegar a agendamiento
        window.location.href = '/admin/appointments/book';
        break;
      case 'view_medical_records':
        window.location.href = '/admin/medical-records';
        break;
      case 'start_appointment':
        toast({
          title: "Iniciar cita",
          description: "Funcionalidad en desarrollo",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        break;
      default:
        toast({
          title: "Acción no implementada",
          description: `La acción ${actionId} está en desarrollo`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
    }
  };

  if (detectionLoading || loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color="brand.500" />
        <Text mt={4} color={textColor}>
          Cargando dashboard personalizado...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error al cargar el dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
        <Button mt={4} onClick={handleRefresh} isLoading={refreshing}>
          Reintentar
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={6}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle>No se pudo cargar el dashboard</AlertTitle>
          <AlertDescription>
            No se pudieron obtener los datos del dashboard. Intenta recargar la página.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  const welcomeMessage = getWelcomeMessage();
  const routeConfig = getRouteConfig();

  return (
    <Box p={6} bg={pageBg} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header del Dashboard */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between" align="flex-start">
              <VStack align="flex-start" spacing={2}>
                <Heading size="lg" color={textColor}>
                  {welcomeMessage?.title || 'Dashboard'}
                </Heading>
                <Text color="gray.500" fontSize="lg">
                  {welcomeMessage?.subtitle || 'Panel personalizado'}
                </Text>
                {welcomeMessage?.description && (
                  <Text color="gray.600" fontSize="sm">
                    {welcomeMessage.description}
                  </Text>
                )}
              </VStack>
              
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  isLoading={refreshing}
                  leftIcon={<Icon as={MdRefresh} />}
                >
                  Actualizar
                </Button>
                
                {dashboardData.show_detection_warning && (
                  <Tooltip label={`Confianza de detección: ${Math.round(dashboardData.detection_confidence * 100)}%`}>
                    <Badge colorScheme="yellow" variant="subtle">
                      <Icon as={MdWarning} mr={1} />
                      Detección baja
                    </Badge>
                  </Tooltip>
                )}
              </HStack>
            </HStack>
          </CardHeader>
        </Card>

        {/* Acciones Rápidas */}
        {dashboardData.quick_actions && dashboardData.quick_actions.length > 0 && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color={textColor}>
                  Acciones Rápidas
                </Heading>
                <Wrap>
                  {dashboardData.quick_actions.map(renderQuickAction)}
                </Wrap>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Widgets del Dashboard */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {dashboardData.widgets
            .sort((a, b) => a.priority - b.priority)
            .map(renderWidget)}
        </SimpleGrid>

        {/* Información de Detección (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <Card bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="sm" color={textColor}>
                Información de Detección (Desarrollo)
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Tipo detectado:</Text>
                  <Badge colorScheme="blue">{dashboardData.user_type}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Widgets cargados:</Text>
                  <Badge colorScheme="green">{dashboardData.widgets.length}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Citas encontradas:</Text>
                  <Badge colorScheme="purple">{dashboardData.appointments.length}</Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

// Componentes de Widget específicos
const AppointmentsListWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <VStack align="stretch" spacing={2}>
        {widget.data && widget.data.length > 0 ? (
          widget.data.slice(0, 5).map((appointment, index) => (
            <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {new Date(appointment.scheduled_date).toLocaleDateString()}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {appointment.appointment_type}
                </Text>
              </VStack>
              <Badge colorScheme="blue" size="sm">
                {appointment.status}
              </Badge>
            </HStack>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            No hay citas próximas
          </Text>
        )}
      </VStack>
    </CardBody>
  </Card>
);

const ActionCardWidget = ({ widget }) => (
  <Card>
    <CardBody textAlign="center">
      <VStack spacing={4}>
        <Icon as={MdAdd} w={12} h={12} color="brand.500" />
        <Heading size="md">{widget.title}</Heading>
        <Text color="gray.600" fontSize="sm">
          Accede rápidamente a esta funcionalidad
        </Text>
        <Button colorScheme="brand" size="lg">
          {widget.title}
        </Button>
      </VStack>
    </CardBody>
  </Card>
);

const StatsCardsWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <SimpleGrid columns={2} spacing={4}>
        <Stat>
          <StatLabel fontSize="sm">Total</StatLabel>
          <StatNumber fontSize="lg">{widget.data.total_appointments || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel fontSize="sm">Confirmadas</StatLabel>
          <StatNumber fontSize="lg">{widget.data.confirmed_appointments || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel fontSize="sm">Pendientes</StatLabel>
          <StatNumber fontSize="lg">{widget.data.pending_appointments || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel fontSize="sm">Hoy</StatLabel>
          <StatNumber fontSize="lg">{widget.data.today_appointments || 0}</StatNumber>
        </Stat>
      </SimpleGrid>
    </CardBody>
  </Card>
);

// Widgets adicionales (implementaciones básicas)
const AppointmentsTimelineWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <Text fontSize="sm" color="gray.500">
        Timeline de citas en desarrollo
      </Text>
    </CardBody>
  </Card>
);

const PatientQueueWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <Text fontSize="sm" color="gray.500">
        Cola de pacientes en desarrollo
      </Text>
    </CardBody>
  </Card>
);

const SystemStatsWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <Text fontSize="sm" color="gray.500">
        Estadísticas del sistema en desarrollo
      </Text>
    </CardBody>
  </Card>
);

const ApprovalQueueWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <Text fontSize="sm" color="gray.500">
        Cola de aprobaciones en desarrollo
      </Text>
    </CardBody>
  </Card>
);

const AppointmentsTableWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <Text fontSize="sm" color="gray.500">
        Tabla de citas en desarrollo
      </Text>
    </CardBody>
  </Card>
);

export default ContextualDashboard;
