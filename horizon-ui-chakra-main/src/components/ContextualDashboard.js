// SMD VITAL - Dashboard Contextual Profesional
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Wrap,
  Tooltip,
  useToast,
  Progress,
  Flex
} from '@chakra-ui/react';
import {
  MdPeople,
  MdEvent,
  MdFileCopy,
  MdLocalPharmacy,
  MdBarChart,
  MdRefresh,
  MdAttachMoney,
  MdCalendarToday,
  MdNotifications,
  MdTrendingUp,
  MdCheckCircle,
  MdPending,
  MdWarning
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import robustApiService from '../services/robustApiService';

const ContextualDashboard = () => {
  const { 
    userDetection, 
    detectionLoading, 
    getWelcomeMessage, 
    user,
    token
  } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const toast = useToast();
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const mutedText = useColorModeValue('gray.600', 'gray.400');
  const itemBg = useColorModeValue('gray.50', 'gray.700');
  const emptyStateBg = useColorModeValue('blue.50', 'blue.900');
  const activityBg = useColorModeValue('gray.50', 'gray.700');
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [appointmentsRes, patientsRes, paymentsRes, notificationsRes] = await Promise.all([
        robustApiService.getAppointments(token),
        robustApiService.getUsers(token),
        robustApiService.getPayments(token).catch(() => ({ success: false, data: [] })),
        robustApiService.getNotifications(token).catch(() => ({ success: false, data: [] }))
      ]);

      const appointments = appointmentsRes.success ? (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []) : [];
      const patients = patientsRes.success ? (Array.isArray(patientsRes.data) ? patientsRes.data : []) : [];
      const payments = paymentsRes.success ? (Array.isArray(paymentsRes.data) ? paymentsRes.data : []) : [];
      const notifications = notificationsRes.success ? (Array.isArray(notificationsRes.data) ? notificationsRes.data : []) : [];

      // Calculate statistics
      const today = new Date().toDateString();
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 14);
      
      const todayAppointments = appointments.filter(apt => 
        new Date(apt.date).toDateString() === today
      );

      const thisWeekAppointments = appointments.filter(apt => 
        new Date(apt.date) >= thisWeek
      );

      const lastWeekAppointments = appointments.filter(apt => {
        const date = new Date(apt.date);
        return date >= lastWeek && date < thisWeek;
      });

      const urgentAppointments = appointments.filter(apt => 
        apt.priority === 'urgent' || apt.priority === 'high'
      );

      const completedAppointments = appointments.filter(apt => apt.status === 'completed');
      const pendingAppointments = appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed');
      
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const completedPayments = payments.filter(payment => payment.status === 'completed');
      const completedRevenue = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const pendingPayments = payments.filter(payment => payment.status === 'pending');
      const pendingRevenue = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      const newPatients = patients.filter(patient => {
        const patientDate = new Date(patient.createdAt || patient.created_at);
        return patientDate >= thisWeek;
      });

      // Calculate trends
      const appointmentTrend = lastWeekAppointments.length > 0 
        ? ((thisWeekAppointments.length - lastWeekAppointments.length) / lastWeekAppointments.length * 100).toFixed(1)
        : 0;

      // Recent activities
      const recentActivities = [
        ...appointments.slice(0, 3).map(apt => ({
          type: 'appointment',
          title: apt.status === 'completed' ? 'Cita completada' : 'Cita programada',
          description: `${apt.patientName || apt.patient} - ${apt.doctorName || apt.doctor}`,
          time: new Date(apt.date),
          status: apt.status,
          priority: apt.priority
        })),
        ...payments.slice(0, 2).map(payment => ({
          type: 'payment',
          title: payment.status === 'completed' ? 'Pago recibido' : 'Pago pendiente',
          description: `${formatCurrency(payment.amount)} - ${payment.patientName || payment.patient || 'Paciente'}`,
          time: new Date(payment.createdAt || payment.created_at),
          status: payment.status
        }))
      ].sort((a, b) => b.time - a.time).slice(0, 5);

      setDashboardData({
        stats: {
          totalAppointments: appointments.length,
          todayAppointments: todayAppointments.length,
          pendingAppointments: pendingAppointments.length,
          completedAppointments: completedAppointments.length,
          urgentAppointments: urgentAppointments.length,
          totalPatients: patients.length,
          newPatients: newPatients.length,
          totalRevenue: totalRevenue,
          completedRevenue: completedRevenue,
          pendingRevenue: pendingRevenue,
          appointmentTrend: appointmentTrend,
          completionRate: appointments.length > 0 
            ? ((completedAppointments.length / appointments.length) * 100).toFixed(1)
            : 0
        },
        todayAppointments: todayAppointments.slice(0, 5),
        urgentAppointments: urgentAppointments.slice(0, 3),
        recentActivities: recentActivities,
        unreadNotifications: notifications.filter(n => !n.read).length
      });
      
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (user && !detectionLoading) {
      loadDashboardData();
    }
  }, [user, detectionLoading, loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: "Dashboard actualizado",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleQuickAction = (route) => {
    window.location.href = route;
  };

  if (detectionLoading || loading) {
    return (
      <Flex minH="60vh" align="center" justify="center" bg={pageBg}>
        <VStack spacing={4}>
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text color={mutedText} fontSize="lg">Cargando dashboard...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="lg" variant="left-accent">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error al cargar el dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <Button onClick={handleRefresh} isLoading={refreshing} colorScheme="red" size="sm">
            Reintentar
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={6}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <AlertTitle>No hay datos disponibles</AlertTitle>
        </Alert>
      </Box>
    );
  }

  const welcomeMessage = getWelcomeMessage() || {
    title: `Bienvenido, ${user?.name || 'Usuario'}`,
    subtitle: 'Dashboard SMD VITAL'
  };

  const { stats } = dashboardData;

  return (
    <Box 
      pt={{ base: "140px", md: "120px", xl: "120px" }}
      px={{ base: "20px", md: "30px", xl: "40px" }}
      pb="40px"
      minH="100vh"
      bg={pageBg}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} borderColor={borderColor} shadow="sm" borderRadius="xl">
          <CardBody p={6}>
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
              <VStack align="flex-start" spacing={1}>
                <Heading size="lg" color={textColor} fontWeight="700">
                  {welcomeMessage.title}
                </Heading>
                <Text color={mutedText} fontSize="md">
                  {welcomeMessage.subtitle}
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                {dashboardData.unreadNotifications > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    leftIcon={<Icon as={MdNotifications} />}
                    onClick={() => handleQuickAction('/admin/notifications')}
                  >
                    <Badge colorScheme="red" ml={2}>{dashboardData.unreadNotifications}</Badge>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefresh}
                  isLoading={refreshing}
                  leftIcon={<Icon as={MdRefresh} />}
                >
                  Actualizar
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Main Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {/* Citas de Hoy */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <Stat>
                <HStack justify="space-between" mb={3}>
                  <Box bg="blue.50" p={3} borderRadius="lg">
                    <Icon as={MdCalendarToday} w={6} h={6} color="blue.500" />
                  </Box>
                  <Badge colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="md">
                    Hoy
                  </Badge>
                </HStack>
                <StatLabel fontSize="sm" color={mutedText} fontWeight="500">
                  Citas de Hoy
                </StatLabel>
                <StatNumber fontSize="3xl" fontWeight="700" color={textColor} my={2}>
                  {stats.todayAppointments}
                </StatNumber>
                <StatHelpText fontSize="xs" color={mutedText} mb={0}>
                  {stats.urgentAppointments > 0 && (
                    <HStack spacing={1}>
                      <Icon as={MdWarning} color="orange.500" />
                      <Text>{stats.urgentAppointments} urgentes</Text>
                    </HStack>
                  )}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Total Pacientes */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <Stat>
                <HStack justify="space-between" mb={3}>
                  <Box bg="green.50" p={3} borderRadius="lg">
                    <Icon as={MdPeople} w={6} h={6} color="green.500" />
                  </Box>
                  {stats.newPatients > 0 && (
                    <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="md">
                      +{stats.newPatients} nuevos
                    </Badge>
                  )}
                </HStack>
                <StatLabel fontSize="sm" color={mutedText} fontWeight="500">
                  Total Pacientes
                </StatLabel>
                <StatNumber fontSize="3xl" fontWeight="700" color={textColor} my={2}>
                  {stats.totalPatients}
                </StatNumber>
                <StatHelpText fontSize="xs" color={mutedText} mb={0}>
                  Registrados en el sistema
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Ingresos */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <Stat>
                <HStack justify="space-between" mb={3}>
                  <Box bg="purple.50" p={3} borderRadius="lg">
                    <Icon as={MdAttachMoney} w={6} h={6} color="purple.500" />
                  </Box>
                  <Icon as={MdTrendingUp} color="purple.500" />
                </HStack>
                <StatLabel fontSize="sm" color={mutedText} fontWeight="500">
                  Ingresos Totales
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="700" color={textColor} my={2}>
                  {formatCurrency(stats.completedRevenue)}
                </StatNumber>
                <StatHelpText fontSize="xs" color={mutedText} mb={0}>
                  {formatCurrency(stats.pendingRevenue)} pendientes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Tasa de Completitud */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <Stat>
                <HStack justify="space-between" mb={3}>
                  <Box bg="orange.50" p={3} borderRadius="lg">
                    <Icon as={MdBarChart} w={6} h={6} color="orange.500" />
                  </Box>
                  <StatArrow type={stats.appointmentTrend >= 0 ? 'increase' : 'decrease'} />
                </HStack>
                <StatLabel fontSize="sm" color={mutedText} fontWeight="500">
                  Tasa de Completitud
                </StatLabel>
                <StatNumber fontSize="3xl" fontWeight="700" color={textColor} my={2}>
                  {stats.completionRate}%
                </StatNumber>
                <StatHelpText fontSize="xs" color={mutedText} mb={0}>
                  {stats.completedAppointments} de {stats.totalAppointments} citas
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Secondary Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Citas de Hoy - Detalle */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardHeader pb={3}>
              <HStack justify="space-between">
                <Heading size="md" fontWeight="600">Citas de Hoy</Heading>
                <Badge colorScheme="blue" borderRadius="full" px={3}>
                  {dashboardData.todayAppointments.length}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={3}>
                {dashboardData.todayAppointments.length > 0 ? (
                  dashboardData.todayAppointments.map((apt, idx) => (
                    <Box
                      key={apt.id || idx}
                      p={4}
                      bg={itemBg}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      transition="all 0.2s"
                      _hover={{ shadow: 'md', borderColor: accentColor }}
                    >
                      <HStack justify="space-between" mb={2}>
                        <VStack align="flex-start" spacing={1}>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {apt.patientName || apt.patient}
                          </Text>
                          <Text fontSize="xs" color={mutedText}>
                            {new Date(apt.date).toLocaleTimeString('es-CO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </VStack>
                        <Badge 
                          colorScheme={
                            apt.priority === 'urgent' ? 'red' :
                            apt.priority === 'high' ? 'orange' : 'green'
                          }
                          borderRadius="full"
                        >
                          {apt.priority === 'urgent' ? 'Urgente' :
                           apt.priority === 'high' ? 'Alta' : 'Normal'}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color={mutedText} mb={2}>
                        Dr. {apt.doctorName || apt.doctor}
                      </Text>
                      <Progress 
                        value={apt.status === 'completed' ? 100 : apt.status === 'in_progress' ? 50 : 0} 
                        size="xs" 
                        colorScheme={apt.status === 'completed' ? 'green' : 'blue'}
                        borderRadius="full"
                      />
                    </Box>
                  ))
                ) : (
                  <Box 
                    p={8} 
                    textAlign="center" 
                    bg={emptyStateBg} 
                    borderRadius="lg"
                  >
                    <Icon as={MdCheckCircle} w={10} h={10} color="blue.400" mb={3} />
                    <Text fontSize="sm" color={mutedText} fontWeight="600">
                      No hay citas programadas para hoy
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Actividades Recientes */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
            <CardHeader pb={3}>
              <HStack justify="space-between">
                <Heading size="md" fontWeight="600">Actividad Reciente</Heading>
                <Badge colorScheme="purple" borderRadius="full" px={3}>
                  {dashboardData.recentActivities.length}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack align="stretch" spacing={3}>
                {dashboardData.recentActivities.map((activity, idx) => (
                  <HStack
                    key={idx}
                    p={4}
                    bg={activityBg}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    spacing={3}
                  >
                    <Box
                      p={2}
                      bg={
                        activity.type === 'appointment' ? 'blue.50' :
                        activity.type === 'payment' ? 'green.50' : 'purple.50'
                      }
                      borderRadius="md"
                    >
                      <Icon
                        as={
                          activity.type === 'appointment' ? MdCalendarToday :
                          activity.type === 'payment' ? MdAttachMoney : MdFileCopy
                        }
                        color={
                          activity.type === 'appointment' ? 'blue.500' :
                          activity.type === 'payment' ? 'green.500' : 'purple.500'
                        }
                        w={4}
                        h={4}
                      />
                    </Box>
                    <VStack align="flex-start" spacing={0} flex="1">
                      <Text fontSize="sm" fontWeight="600" color={textColor}>
                        {activity.title}
                      </Text>
                      <Text fontSize="xs" color={mutedText} noOfLines={1}>
                        {activity.description}
                      </Text>
                      <Text fontSize="xs" color={mutedText}>
                        {activity.time.toLocaleDateString('es-CO')}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={
                        activity.status === 'completed' ? 'green' :
                        activity.status === 'pending' ? 'yellow' : 'blue'
                      }
                      borderRadius="full"
                      fontSize="xs"
                    >
                      {activity.status}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Acciones Rápidas */}
        <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" fontWeight="600">Acciones Rápidas</Heading>
          </CardHeader>
          <CardBody>
            <Wrap spacing={3}>
              <Button
                leftIcon={<Icon as={MdEvent} />}
                colorScheme="blue"
                size="lg"
                borderRadius="xl"
                onClick={() => handleQuickAction('/admin/appointments')}
                shadow="sm"
              >
                Nueva Cita
              </Button>
              <Button
                leftIcon={<Icon as={MdPeople} />}
                colorScheme="green"
                variant="outline"
                size="lg"
                borderRadius="xl"
                onClick={() => handleQuickAction('/admin/patients')}
              >
                Gestionar Pacientes
              </Button>
              <Button
                leftIcon={<Icon as={MdFileCopy} />}
                colorScheme="purple"
                variant="outline"
                size="lg"
                borderRadius="xl"
                onClick={() => handleQuickAction('/admin/medical-records')}
              >
                Expedientes
              </Button>
              <Button
                leftIcon={<Icon as={MdAttachMoney} />}
                colorScheme="orange"
                variant="outline"
                size="lg"
                borderRadius="xl"
                onClick={() => handleQuickAction('/admin/payments')}
              >
                Pagos
              </Button>
              <Button
                leftIcon={<Icon as={MdBarChart} />}
                colorScheme="pink"
                variant="outline"
                size="lg"
                borderRadius="xl"
                onClick={() => handleQuickAction('/admin/reports')}
              >
                Reportes
              </Button>
            </Wrap>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default ContextualDashboard;