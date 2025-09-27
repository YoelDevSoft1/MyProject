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
  MdRefresh,
  MdAttachMoney,
  MdCalendarToday,
  MdNotifications
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/dashboardService';
import appointmentBookingService from '../services/appointmentBookingService';
import robustApiService from '../services/robustApiService';

const ContextualDashboard = () => {
  const { 
    userDetection, 
    detectionLoading, 
    getWelcomeMessage, 
    getRouteConfig,
    hasPermission,
    detectUserType,
    user,
    token
  } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const toast = useToast();
  
  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // TODOS los hooks deben ir al inicio - colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  
  // Colors for empty state messages
  const emptyStateBg = useColorModeValue("blue.50", "blue.900");
  const emptyStateBorder = useColorModeValue("blue.200", "blue.600");
  const emptyStateText = useColorModeValue("blue.700", "blue.200");
  const emptyStateSubtext = useColorModeValue("blue.600", "blue.300");

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!userDetection && !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos reales de la API
      const [appointmentsRes, patientsRes, recordsRes, paymentsRes, notificationsRes] = await Promise.all([
        robustApiService.getAppointments(token),
        robustApiService.getUsers(token),
        robustApiService.getMedicalRecords(token).catch(() => ({ success: false, data: [], error: 'Endpoint not available' })),
        robustApiService.getPayments(token).catch(() => ({ success: false, data: [], error: 'Endpoint not available' })),
        robustApiService.getNotifications(token).catch(() => ({ success: false, data: [], error: 'Endpoint not available' }))
      ]);

      const appointments = appointmentsRes.success ? (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []) : [];
      const patients = patientsRes.success ? (Array.isArray(patientsRes.data) ? patientsRes.data : []) : [];
      const records = recordsRes.success ? (Array.isArray(recordsRes.data) ? recordsRes.data : []) : [];
      const payments = paymentsRes.success ? (Array.isArray(paymentsRes.data) ? paymentsRes.data : []) : [];
      const notifications = notificationsRes.success ? (Array.isArray(notificationsRes.data) ? notificationsRes.data : []) : [];

      // Calcular estadísticas mejoradas
      const today = new Date().toDateString();
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      const todayAppointments = appointments.filter(apt => {
        const appointmentDate = new Date(apt.date).toDateString();
        return appointmentDate === today;
      });

      const urgentAppointments = appointments.filter(apt => 
        apt.priority === 'urgent' || apt.priority === 'high'
      );

      const activeAppointments = appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed');
      const completedAppointments = appointments.filter(apt => apt.status === 'completed');
      
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const pendingPayments = payments.filter(payment => payment.status === 'pending');
      const pendingPaymentsAmount = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      const newPatients = patients.filter(patient => {
        const patientDate = new Date(patient.createdAt || patient.created_at);
        return patientDate >= thisWeek;
      });
      
      const completedRecords = records.filter(record => record.status === 'completed' || record.status === 'active');

      // Crear datos del dashboard contextual mejorado
      const contextualData = {
        user_type: userDetection?.user_type || 'medical_staff',
        detection_confidence: userDetection?.confidence || 0.95,
        show_detection_warning: (userDetection?.confidence || 0.95) < 0.8,
        appointments: appointments,
        patients: patients,
        records: records,
        payments: payments,
        notifications: notifications,
        stats: {
          total_appointments: appointments.length,
          active_appointments: activeAppointments.length,
          completed_appointments: completedAppointments.length,
          today_appointments: todayAppointments.length,
          urgent_appointments: urgentAppointments.length,
          total_patients: patients.length,
          new_patients: newPatients.length,
          total_revenue: totalRevenue,
          pending_payments: pendingPaymentsAmount,
          completed_records: completedRecords.length
        },
        widgets: [
          {
            id: 'today_appointments',
            type: 'appointments_list',
            title: 'Citas de Hoy',
            priority: 1,
            data: todayAppointments
          },
          {
            id: 'urgent_appointments',
            type: 'appointments_list',
            title: 'Citas Urgentes',
            priority: 2,
            data: urgentAppointments
          },
          {
            id: 'stats_overview',
            type: 'stats_cards',
            title: 'Resumen General',
            priority: 3,
            data: {
              total_appointments: appointments.length,
              active_appointments: activeAppointments.length,
              completed_appointments: completedAppointments.length,
              today_appointments: todayAppointments.length,
              total_patients: patients.length,
              new_patients: newPatients.length,
              total_revenue: totalRevenue,
              pending_payments: pendingPaymentsAmount,
              completed_records: completedRecords.length
            }
          },
          {
            id: 'recent_activities',
            type: 'activities_timeline',
            title: 'Actividades Recientes',
            priority: 4,
            data: [
              ...appointments.slice(0, 3).map(apt => ({
                type: 'appointment',
                title: `Cita ${apt.status === 'completed' ? 'completada' : 'programada'}`,
                description: `${apt.patientName || apt.patient} - ${apt.doctorName || apt.doctor}`,
                time: new Date(apt.date).toLocaleDateString('es-CO'),
                unread: apt.status === 'pending',
                status: apt.status
              })),
              ...payments.slice(0, 2).map(payment => ({
                type: 'payment',
                title: `Pago ${payment.status === 'completed' ? 'recibido' : 'pendiente'}`,
                description: `${formatCurrency(payment.amount)} - ${payment.patientName || payment.patient}`,
                time: new Date(payment.createdAt || payment.created_at).toLocaleDateString('es-CO'),
                unread: payment.status === 'pending',
                status: payment.status
              }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)
          },
          {
            id: 'quick_actions',
            type: 'action_card',
            title: 'Acciones Rápidas',
            priority: 5,
            data: {}
          }
        ],
        quick_actions: [
          {
            id: 'book_appointment',
            label: 'Nueva Cita',
            icon: 'MdEvent',
            color: 'blue'
          },
          {
            id: 'view_medical_records',
            label: 'Expedientes',
            icon: 'MdFileCopy',
            color: 'green'
          },
          {
            id: 'manage_patients',
            label: 'Pacientes',
            icon: 'MdPeople',
            color: 'purple'
          },
          {
            id: 'view_payments',
            label: 'Pagos',
            icon: 'MdAttachMoney',
            color: 'orange'
          },
          {
            id: 'ai_medical',
            label: 'IA Médica',
            icon: 'MdPsychology',
            color: 'pink'
          },
          {
            id: 'notifications',
            label: 'Notificaciones',
            icon: 'MdNotifications',
            color: 'teal'
          }
        ]
      };

      setDashboardData(contextualData);
      
    } catch (err) {
      console.error('Error loading contextual dashboard:', err);
      setError('Error al cargar los datos del dashboard contextual');
    } finally {
      setLoading(false);
    }
  }, [userDetection, user, token]);

  // Efecto para cargar datos
  useEffect(() => {
    if ((userDetection || user) && !detectionLoading) {
      loadDashboardData();
    }
  }, [userDetection, user, detectionLoading, loadDashboardData]);

  // Efecto para detectar tipo de usuario si no está disponible
  useEffect(() => {
    if (!userDetection && !detectionLoading && user) {
      detectUserType();
    }
  }, [userDetection, detectionLoading, detectUserType, user]);

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
      appointments_list: () => <AppointmentsListWidget 
        widget={widget} 
        emptyStateBg={emptyStateBg}
        emptyStateBorder={emptyStateBorder}
        emptyStateText={emptyStateText}
        emptyStateSubtext={emptyStateSubtext}
      />,
      action_card: () => <ActionCardWidget widget={widget} />,
      activities_timeline: () => <ActivitiesTimelineWidget widget={widget} />,
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
        window.location.href = '/admin/appointments';
        break;
      case 'view_medical_records':
        window.location.href = '/admin/medical-records';
        break;
      case 'manage_patients':
        window.location.href = '/admin/patients';
        break;
      case 'view_payments':
        window.location.href = '/admin/payments';
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

  const welcomeMessage = getWelcomeMessage() || {
    title: `Bienvenido, ${user?.name || 'Usuario'}`,
    subtitle: 'Dashboard Contextual SMD VITAL',
    description: 'Panel personalizado con información relevante para tu rol'
  };
  const routeConfig = getRouteConfig();

  return (
    <Box 
      pt={{ base: "140px", md: "120px", xl: "120px" }}
      px={{ base: "20px", md: "30px", xl: "40px" }}
      pb="40px"
      minH="100vh"
      bg={pageBg}
      position="relative"
    >
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
                Información del Sistema (Desarrollo)
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
                  <Text fontSize="sm" color="gray.600">Citas totales:</Text>
                  <Badge colorScheme="purple">{dashboardData.appointments.length}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Citas de hoy:</Text>
                  <Badge colorScheme="orange">{dashboardData.widgets.find(w => w.id === 'today_appointments')?.data?.length || 0}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Citas urgentes:</Text>
                  <Badge colorScheme="red">{dashboardData.widgets.find(w => w.id === 'urgent_appointments')?.data?.length || 0}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Confianza detección:</Text>
                  <Badge colorScheme={dashboardData.detection_confidence > 0.8 ? "green" : "yellow"}>
                    {Math.round(dashboardData.detection_confidence * 100)}%
                  </Badge>
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
const AppointmentsListWidget = ({ widget, emptyStateBg, emptyStateBorder, emptyStateText, emptyStateSubtext }) => (
  <Card>
    <CardHeader>
      <HStack justify="space-between">
        <Heading size="md">{widget.title}</Heading>
        <Badge colorScheme="blue" variant="subtle">
          {widget.data?.length || 0}
        </Badge>
      </HStack>
    </CardHeader>
    <CardBody>
      <VStack align="stretch" spacing={2}>
        {widget.data && widget.data.length > 0 ? (
          widget.data.slice(0, 5).map((appointment, index) => (
            <Box
              key={appointment.id || index}
              p={3}
              bg="gray.50"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <HStack justify="space-between" mb={2}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {appointment.patientName || appointment.patient}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {new Date(appointment.date).toLocaleTimeString('es-CO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </VStack>
                <Badge 
                  colorScheme={
                    appointment.priority === 'urgent' ? 'red' :
                    appointment.priority === 'high' ? 'orange' : 'green'
                  } 
                  size="sm"
                >
                  {appointment.priority === 'urgent' ? 'Urgente' :
                   appointment.priority === 'high' ? 'Alta' : 'Normal'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.600" mb={2}>
                {appointment.reason || appointment.description || 'Consulta médica'}
              </Text>
              <HStack justify="space-between">
                <Badge 
                  colorScheme={
                    appointment.status === 'completed' ? 'green' :
                    appointment.status === 'in_progress' ? 'blue' : 'yellow'
                  }
                  variant="solid"
                  size="sm"
                >
                  {appointment.status === 'completed' ? 'Completada' :
                   appointment.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  Dr. {appointment.doctorName || appointment.doctor}
                </Text>
              </HStack>
            </Box>
          ))
        ) : (
          <Box 
            p={4} 
            textAlign="center" 
            bg={emptyStateBg} 
            borderRadius="md"
            border="1px solid"
            borderColor={emptyStateBorder}
          >
            <Text 
              fontSize="sm" 
              color={emptyStateText}
              fontWeight="600"
            >
              {widget.title === 'Citas de Hoy' ? 'No hay citas programadas para hoy' : 'No hay citas urgentes'}
            </Text>
            <Text 
              fontSize="xs" 
              color={emptyStateSubtext}
              mt={1}
            >
              {widget.title === 'Citas de Hoy' ? '¡Excelente día para planificar!' : 'Todo está bajo control'}
            </Text>
          </Box>
        )}
      </VStack>
    </CardBody>
  </Card>
);

const ActionCardWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{widget.title}</Heading>
    </CardHeader>
    <CardBody>
      <VStack spacing={4}>
        <SimpleGrid columns={2} spacing={3}>
          <Button
            leftIcon={<Icon as={MdEvent} />}
            colorScheme="blue"
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/appointments'}
          >
            Nueva Cita
          </Button>
          <Button
            leftIcon={<Icon as={MdFileCopy} />}
            colorScheme="green"
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/medical-records'}
          >
            Expedientes
          </Button>
          <Button
            leftIcon={<Icon as={MdPeople} />}
            colorScheme="purple"
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/patients'}
          >
            Pacientes
          </Button>
          <Button
            leftIcon={<Icon as={MdAttachMoney} />}
            colorScheme="orange"
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/payments'}
          >
            Pagos
          </Button>
        </SimpleGrid>
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
          <StatLabel fontSize="sm">Citas Totales</StatLabel>
          <StatNumber fontSize="lg">{widget.data.total_appointments || 0}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            {widget.data.confirmed_appointments || 0} confirmadas
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="sm">Citas Hoy</StatLabel>
          <StatNumber fontSize="lg">{widget.data.today_appointments || 0}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            {widget.data.pending_appointments || 0} pendientes
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="sm">Pacientes</StatLabel>
          <StatNumber fontSize="lg">{widget.data.total_patients || 0}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            Registrados
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel fontSize="sm">Ingresos</StatLabel>
          <StatNumber fontSize="lg">
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(widget.data.total_revenue || 0)}
          </StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            {widget.data.pending_payments || 0} pendientes
          </StatHelpText>
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

const ActivitiesTimelineWidget = ({ widget }) => (
  <Card>
    <CardHeader>
      <HStack justify="space-between">
        <Heading size="md">{widget.title}</Heading>
        <Badge colorScheme="blue" variant="subtle">
          {widget.data?.length || 0}
        </Badge>
      </HStack>
    </CardHeader>
    <CardBody>
      <VStack align="stretch" spacing={3}>
        {widget.data && widget.data.length > 0 ? (
          widget.data.map((activity, index) => (
            <Box
              key={index}
              p={3}
              bg={activity.unread ? "blue.50" : "gray.50"}
              borderRadius="md"
              border={activity.unread ? "1px solid" : "none"}
              borderColor="blue.200"
            >
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Icon 
                    as={
                      activity.type === 'appointment' ? MdCalendarToday :
                      activity.type === 'payment' ? MdAttachMoney :
                      activity.type === 'record' ? MdFileCopy : MdNotifications
                    }
                    color={activity.unread ? "blue.500" : "gray.500"}
                    mr={2}
                  />
                  <Text fontWeight={activity.unread ? "700" : "600"} fontSize="sm">
                    {activity.title}
                  </Text>
                </HStack>
                {activity.unread && (
                  <Box w="8px" h="8px" bg="blue.500" borderRadius="50%" />
                )}
              </HStack>
              <Text fontSize="xs" color="gray.600" mb={2}>
                {activity.description}
              </Text>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">
                  {activity.time}
                </Text>
                {activity.status && (
                  <Badge
                    colorScheme={
                      activity.status === "completed" ? "green" :
                      activity.status === "pending" ? "yellow" : "blue"
                    }
                    variant="subtle"
                    size="sm"
                  >
                    {activity.status}
                  </Badge>
                )}
              </HStack>
            </Box>
          ))
        ) : (
          <Box 
            p={4} 
            textAlign="center" 
            bg="gray.50" 
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" color="gray.600" fontWeight="600">
              No hay actividades recientes
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Las actividades aparecerán aquí
            </Text>
          </Box>
        )}
      </VStack>
    </CardBody>
  </Card>
);

export default ContextualDashboard;
