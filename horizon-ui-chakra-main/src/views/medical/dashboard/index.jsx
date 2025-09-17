// Chakra imports
import {
  Box,
  Grid,
  useColorModeValue,
  SimpleGrid,
  Text,
  Icon,
  VStack,
  HStack,
  Badge,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
// Custom components
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";
// Assets
import { MdCalendarToday, MdPeople, MdFileCopy, MdAttachMoney, MdPsychology, MdNotifications } from "react-icons/md";
import { FaBuilding } from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";

export default function MedicalDashboard() {
  // Auth context
  const { token, isAuthenticated } = useAuth();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    patients: 0,
    records: 0,
    payments: 0,
    notifications: [],
    loading: true,
    error: null
  });

  // Chakra Color Mode - ALL HOOKS MUST BE AT THE TOP
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const appointmentBgLight = useColorModeValue("appointment.50", "appointment.900");
  const appointmentBgDark = useColorModeValue("gray.50", "gray.700");
  const appointmentBorderLight = useColorModeValue("appointment.200", "appointment.600");
  const appointmentBorderDark = useColorModeValue("gray.200", "gray.600");
  const activityBgLight = useColorModeValue("brand.50", "brand.900");
  const activityBgDark = useColorModeValue("gray.50", "gray.700");
  const activityBorder = useColorModeValue("brand.200", "brand.600");
  const boxBg = useColorModeValue("white", "navy.800");
  const boxShadow = useColorModeValue("14px 17px 40px 4px rgba(112, 144, 176, 0.08)", "14px 17px 40px 4px rgba(112, 144, 176, 0.08)");
  
  // Additional color values for MiniStatistics
  const appointmentColor = useColorModeValue("appointment.500", "appointment.500");
  const patientColor = useColorModeValue("patient.500", "patient.500");
  const recordColor = useColorModeValue("record.500", "record.500");
  const paymentColor = useColorModeValue("payment.500", "payment.500");
  const aiColor = useColorModeValue("ai.500", "ai.500");
  const brandColor = useColorModeValue("brand.500", "brand.500");

  // Load dashboard data function - MUST BE DEFINED BEFORE useEffect
  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Load data in parallel from real API
      const [appointmentsRes, usersRes, recordsRes, paymentsRes, notificationsRes] = await Promise.all([
        apiService.getAppointments(token),
        apiService.getUsers(token),
        apiService.getMedicalRecords(token),
        apiService.getPayments(token),
        apiService.getNotifications(token)
      ]);

      setDashboardData({
        appointments: appointmentsRes.success ? (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []) : [],
        patients: usersRes.success ? (Array.isArray(usersRes.data) ? usersRes.data.length : 0) : 0,
        records: recordsRes.success ? (Array.isArray(recordsRes.data) ? recordsRes.data.length : 0) : 0,
        payments: paymentsRes.success && Array.isArray(paymentsRes.data) ? paymentsRes.data.reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0,
        notifications: notificationsRes.success ? (Array.isArray(notificationsRes.data) ? notificationsRes.data : []) : [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error al cargar los datos del dashboard' 
      }));
    }
  }, [token]);

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated && token) {
      loadDashboardData();
    }
  }, [isAuthenticated, token, loadDashboardData]);

  // Show loading state
  if (dashboardData.loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing="4">
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Cargando datos del dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (dashboardData.error) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error al cargar los datos!</AlertTitle>
            <AlertDescription>{dashboardData.error}</AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Get today's appointments
  const todayAppointments = dashboardData.appointments.filter(apt => {
    const today = new Date().toDateString();
    const appointmentDate = new Date(apt.date).toDateString();
    return appointmentDate === today;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={appointmentColor}
              icon={<Icon w="32px" h="32px" as={MdCalendarToday} color="white" />}
            />
          }
          name="Citas SMD VITAL Hoy"
          value={todayAppointments.length}
          growth="+25%"
          growthIcon={<Icon as={IoMdTrendingUp} color="white" />}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={patientColor}
              icon={<Icon w="32px" h="32px" as={MdPeople} color="white" />}
            />
          }
          name="Pacientes SMD VITAL"
          value={dashboardData.patients.toLocaleString()}
          growth="+12.5%"
          growthIcon={<Icon as={IoMdTrendingUp} color="white" />}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={recordColor}
              icon={<Icon w="32px" h="32px" as={MdFileCopy} color="white" />}
            />
          }
          name="Expedientes SMD VITAL"
          value={dashboardData.records.toLocaleString()}
          growth="+18%"
          growthIcon={<Icon as={IoMdTrendingUp} color="white" />}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={paymentColor}
              icon={<Icon w="32px" h="32px" as={MdAttachMoney} color="white" />}
            />
          }
          name="Ingresos SMD VITAL"
          value={formatCurrency(dashboardData.payments)}
          growth="+28%"
          growthIcon={<Icon as={IoMdTrendingUp} color="white" />}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={aiColor}
              icon={<Icon w="32px" h="32px" as={MdPsychology} color="white" />}
            />
          }
          name="IA SMD VITAL"
          value="Activa"
          growth="+35%"
          growthIcon={<Icon as={IoMdTrendingUp} color="white" />}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={brandColor}
              icon={<Icon w="32px" h="32px" as={MdNotifications} color="white" />}
            />
          }
          name="Alertas SMD VITAL"
          value={dashboardData.notifications.filter(n => !n.read).length}
          growth="+15%"
          growthIcon={<Icon as={IoMdTrendingUp} color="white" />}
        />
      </SimpleGrid>

      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        templateRows={{ base: "repeat(2, 1fr)", lg: "1fr" }}
        gap="20px"
        mb="20px"
      >
        {/* Citas SMD VITAL de Hoy */}
        <Box
          bg={boxBg}
          borderRadius="20px"
          p="20px"
          boxShadow={boxShadow}
        >
          <Text fontSize="lg" fontWeight="700" color={textColor} mb="20px">
            Citas SMD VITAL de Hoy
          </Text>
          <VStack spacing="15px" align="stretch">
            {[
              { time: "08:30", patient: "María González", reason: "Consulta general SMD VITAL", status: "completed", priority: "normal", doctor: "Dr. Carlos López - SMD VITAL" },
              { time: "10:00", patient: "Carlos López", reason: "Seguimiento diabetes SMD VITAL", status: "in_progress", priority: "high", doctor: "Dra. Ana Martínez - SMD VITAL" },
              { time: "11:30", patient: "Ana Martínez", reason: "Primera consulta SMD VITAL", status: "pending", priority: "normal", doctor: "Dr. Carlos López - SMD VITAL" },
              { time: "14:00", patient: "Pedro Sánchez", reason: "Control presión SMD VITAL", status: "pending", priority: "urgent", doctor: "Dra. Ana Martínez - SMD VITAL" },
            ].map((appointment, index) => (
              <Box
                key={index}
                p="15px"
                bg={appointment.status === "in_progress" ? appointmentBgLight : appointmentBgDark}
                borderRadius="12px"
                border={appointment.status === "in_progress" ? "2px solid" : "1px solid"}
                borderColor={appointment.status === "in_progress" ? appointmentBorderLight : appointmentBorderDark}
              >
                <HStack justify="space-between" mb="10px">
                  <Text fontWeight="600" color={textColor}>
                    {appointment.time} - {appointment.patient}
                  </Text>
                  <Badge
                    colorScheme={
                      appointment.priority === "urgent" ? "red" :
                      appointment.priority === "high" ? "orange" : "green"
                    }
                    variant="subtle"
                  >
                    {appointment.priority === "urgent" ? "Urgente" :
                     appointment.priority === "high" ? "Alta" : "Normal"}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color={textColorSecondary}>
                  {appointment.reason}
                </Text>
                <HStack mt="10px">
                  <Badge
                    colorScheme={
                      appointment.status === "completed" ? "green" :
                      appointment.status === "in_progress" ? "blue" : "yellow"
                    }
                    variant="solid"
                  >
                    {appointment.status === "completed" ? "Completada" :
                     appointment.status === "in_progress" ? "En Progreso" : "Pendiente"}
                  </Badge>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Actividades SMD VITAL Recientes */}
        <Box
          bg={boxBg}
          borderRadius="20px"
          p="20px"
          boxShadow={boxShadow}
        >
          <Text fontSize="lg" fontWeight="700" color={textColor} mb="20px">
            Actividades SMD VITAL Recientes
          </Text>
          <VStack spacing="15px" align="stretch">
            {[
              { type: "appointment", title: "Nueva cita SMD VITAL programada", description: "María González - 16:00 - Sede SMD VITAL Bogotá", time: "Hace 5 min", unread: true },
              { type: "record", title: "Expediente SMD VITAL actualizado", description: "Carlos López - Diabetes tipo 2 - Dr. Ana Martínez SMD VITAL", time: "Hace 1 hora", unread: true },
              { type: "payment", title: "Pago SMD VITAL recibido", description: "$180.000 COP - Consulta Dr. Ana Martínez SMD VITAL", time: "Hace 2 horas", unread: false },
              { type: "notification", title: "Recordatorio SMD VITAL", description: "Ana Martínez - Mañana 14:00 - Sede SMD VITAL", time: "Hace 3 horas", unread: false },
            ].map((activity, index) => (
              <Box
                key={index}
                p="15px"
                bg={activity.unread ? activityBgLight : activityBgDark}
                borderRadius="12px"
                border={activity.unread ? "1px solid" : "none"}
                borderColor={activityBorder}
              >
                <HStack justify="space-between" mb="10px">
                  <Text fontWeight={activity.unread ? "700" : "600"} color={textColor}>
                    {activity.title}
                  </Text>
                  {activity.unread && (
                    <Box w="8px" h="8px" bg="brand.500" borderRadius="50%" />
                  )}
                </HStack>
                <Text fontSize="sm" color={textColorSecondary} mb="5px">
                  {activity.description}
                </Text>
                <Text fontSize="xs" color={textColorSecondary}>
                  {activity.time}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Grid>

      {/* Acciones Rápidas SMD VITAL */}
      <Box
        bg={boxBg}
        borderRadius="20px"
        p="20px"
        boxShadow={boxShadow}
      >
        <Text fontSize="lg" fontWeight="700" color={textColor} mb="20px">
          Acciones Rápidas SMD VITAL
        </Text>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing="15px">
          <Button
            leftIcon={<Icon as={MdCalendarToday} />}
            colorScheme="appointment"
            variant="outline"
            size="lg"
            h="60px"
          >
            Nueva Cita SMD VITAL
          </Button>
          <Button
            leftIcon={<Icon as={MdFileCopy} />}
            colorScheme="record"
            variant="outline"
            size="lg"
            h="60px"
          >
            Nuevo Expediente SMD VITAL
          </Button>
          <Button
            leftIcon={<Icon as={MdPsychology} />}
            colorScheme="ai"
            variant="outline"
            size="lg"
            h="60px"
          >
            IA SMD VITAL
          </Button>
          <Button
            leftIcon={<Icon as={FaBuilding} />}
            colorScheme="medical"
            variant="outline"
            size="lg"
            h="60px"
          >
            Administración SMD VITAL
          </Button>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
