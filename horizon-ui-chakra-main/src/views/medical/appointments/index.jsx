import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  TableContainer,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useToast,
  IconButton,
  Tooltip,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdRefresh,
  MdDownload,
  MdPrint,
} from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";
import IntelligentAppointmentBooking from "components/IntelligentAppointmentBooking";
import UserDetectionInfo from "components/UserDetectionInfo";
import MedicalConsultationModal from "components/MedicalConsultationModal";
import PrescriptionViewer from "components/PrescriptionViewer";
import RatingSystem from "components/RatingSystem";

export default function Appointments() {
  // Auth context
  const { token, isAuthenticated, userDetection, detectUserType } = useAuth();
  
  // State for appointments data
  const [appointmentsData, setAppointmentsData] = useState({
    appointments: [], // Always initialize as empty array
    loading: true,
    error: null,
    pagination: {
      page: 1,
      size: 10,
      total: 0,
      has_next: false,
      has_prev: false,
    },
  });
  const [stats, setStats] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Modals
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure();
  const { isOpen: isConsultationOpen, onOpen: onConsultationOpen, onClose: onConsultationClose } = useDisclosure();
  const { isOpen: isPrescriptionOpen, onOpen: onPrescriptionOpen, onClose: onPrescriptionClose } = useDisclosure();
  
  // Estados adicionales para consulta médica
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Toast
  const toast = useToast();
  
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");

  // Load appointments data
  const loadAppointments = useCallback(async (page = 1, size = 10) => {
    if (!isAuthenticated || !token) {
      setAppointmentsData(prev => ({ ...prev, loading: false, error: "No autenticado" }));
      return;
    }
    setAppointmentsData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiService.getAppointments(token, { skip: (page - 1) * size, limit: size });
      if (response.success) {
        setAppointmentsData({
          appointments: Array.isArray(response.data.appointments) ? response.data.appointments : [],
          loading: false,
          error: null,
          pagination: {
            page: response.data.page || 1,
            size: response.data.size || 10,
            total: response.data.total || 0,
            has_next: response.data.has_next || false,
            has_prev: response.data.has_prev || false,
          },
        });
      } else {
        setAppointmentsData(prev => ({ 
          ...prev, 
          appointments: [], // Ensure appointments is always an array
          loading: false, 
          error: response.error 
        }));
        toast({
          title: "Error al cargar citas",
          description: response.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      setAppointmentsData(prev => ({ 
        ...prev, 
        appointments: [], // Ensure appointments is always an array
        loading: false, 
        error: error.message 
      }));
      toast({
        title: "Error al cargar citas",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isAuthenticated, token, toast]);

  // Load appointments stats
  const loadStats = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return;
    }
    try {
      const response = await apiService.getAppointmentStats(token);
      if (response.success) {
        setStats(response.data);
      } else {
        // Si no hay estadísticas disponibles, usar valores por defecto
        console.warn('Estadísticas no disponibles, usando valores por defecto:', response.error);
        setStats({
          total_appointments: 0,
          confirmed_appointments: 0,
          pending_appointments: 0,
          completed_appointments: 0,
          upcoming_appointments: 0,
          today_appointments: 0,
          overdue_appointments: 0,
          telemedicine_appointments: 0
        });
      }
    } catch (error) {
      console.warn('Error al cargar estadísticas, usando valores por defecto:', error.message);
      // En caso de error, usar valores por defecto en lugar de mostrar toast
      setStats({
        total_appointments: 0,
        confirmed_appointments: 0,
        pending_appointments: 0,
        completed_appointments: 0,
        upcoming_appointments: 0,
        today_appointments: 0,
        overdue_appointments: 0,
        telemedicine_appointments: 0
      });
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    loadAppointments();
    loadStats();
    
    // Detectar tipo de usuario si no está disponible
    if (!userDetection) {
      detectUserType();
    }
  }, [loadAppointments, loadStats, userDetection, detectUserType]);

  const handlePageChange = (newPage) => {
    loadAppointments(newPage, appointmentsData.pagination.size);
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    onDetailsOpen();
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    onBookingOpen();
  };

  const handleBookingSuccess = (appointmentData) => {
    // Recargar datos después de crear cita
    loadAppointments();
    loadStats();
    onBookingClose();
  };

  // Funciones para consulta médica
  const handleStartConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedPatient(appointment.patient);
    onConsultationOpen();
  };

  const handleConsultationSuccess = (medicalRecord) => {
    toast({
      title: "Consulta registrada",
      description: "La consulta médica se ha registrado exitosamente",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    loadAppointments();
    onConsultationClose();
  };

  const handleViewPrescriptions = (appointment) => {
    setSelectedPatient(appointment.patient);
    onPrescriptionOpen();
  };

  const handleRatingSubmitted = (rating) => {
    toast({
      title: "Calificación enviada",
      description: "Gracias por tu calificación",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    onDeleteOpen();
  };

  const handleFormSuccess = () => {
    loadAppointments();
    loadStats();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppointment || !token) return;
    try {
      const response = await apiService.deleteAppointments(selectedAppointment.id, token);
      if (response.success) {
        toast({
          title: "Cita eliminada",
          description: `La cita ${selectedAppointment.appointment_number} ha sido eliminada.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        handleFormSuccess();
        onDeleteClose();
      } else {
        toast({
          title: "Error al eliminar cita",
          description: response.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error al eliminar cita",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: "yellow",
      CONFIRMED: "blue",
      IN_PROGRESS: "purple",
      COMPLETED: "green",
      CANCELLED: "red",
      NO_SHOW: "gray",
      RESCHEDULED: "orange",
    };
    return colors[status] || "gray";
  };

  const { appointments, loading, error, pagination } = appointmentsData;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex direction="column" gap={4}>
        {/* Header */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }} 
          mb={4}
          gap={4}
        >
          <VStack align={{ base: "center", md: "start" }} spacing={2}>
            <HStack spacing={3}>
              <Text 
                fontSize={{ base: "2xl", md: "3xl" }} 
                fontWeight="bold" 
                color={textColor}
                textAlign={{ base: "center", md: "left" }}
              >
                Gestión de Citas Médicas
              </Text>
              {userDetection && (
                <Badge 
                  colorScheme={userDetection.detection?.confidence > 0.7 ? "green" : "yellow"} 
                  variant="subtle"
                  fontSize="xs"
                >
                  {userDetection.detection?.detected_type || 'usuario'}
                </Badge>
              )}
            </HStack>
            <Text 
              color={textColorSecondary} 
              fontSize={{ base: "sm", md: "md" }}
              textAlign={{ base: "center", md: "left" }}
            >
              {userDetection?.detection?.detected_type === 'patient' 
                ? "Gestiona tus citas médicas y agenda nuevas consultas"
                : userDetection?.detection?.detected_type === 'doctor'
                ? "Administra tu agenda médica y atiende a tus pacientes"
                : userDetection?.detection?.detected_type === 'nurse'
                ? "Gestiona las citas asignadas y asiste a los doctores"
                : "Administra las citas médicas del sistema SMD VITAL"
              }
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="brand"
            size={{ base: "md", md: "lg" }}
            onClick={handleCreateAppointment}
            width={{ base: "full", md: "auto" }}
          >
            Nueva Cita
          </Button>
        </Flex>

        {/* User Detection Info */}
        {userDetection && (
          <Box mb={4}>
            <UserDetectionInfo userDetection={userDetection} />
          </Box>
        )}

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Citas</StatLabel>
                <StatNumber>{stats.total_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.upcoming_appointments || 0} Próximas
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Citas Confirmadas</StatLabel>
                <StatNumber>{stats.confirmed_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.today_appointments || 0} Hoy
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Citas Pendientes</StatLabel>
                <StatNumber>{stats.pending_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {stats.overdue_appointments || 0} Atrasadas
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Citas Completadas</StatLabel>
                <StatNumber>{stats.completed_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.telemedicine_appointments || 0} Telemedicina
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Error al cargar las citas</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <Flex 
              direction={{ base: "column", sm: "row" }} 
              justify="space-between" 
              align={{ base: "stretch", sm: "center" }}
              gap={4}
            >
              <Heading size={{ base: "sm", md: "md" }}>Lista de Citas</Heading>
              <HStack 
                spacing={2}
                justify={{ base: "center", sm: "flex-end" }}
                wrap="wrap"
              >
                <Tooltip label="Exportar">
                  <IconButton
                    aria-label="Exportar"
                    icon={<MdDownload />}
                    size={{ base: "sm", md: "md" }}
                    onClick={() => alert("Exportar")}
                  />
                </Tooltip>
                <Tooltip label="Imprimir">
                  <IconButton
                    aria-label="Imprimir"
                    icon={<MdPrint />}
                    size={{ base: "sm", md: "md" }}
                    onClick={() => alert("Imprimir")}
                  />
                </Tooltip>
                <Tooltip label="Refrescar">
                  <IconButton
                    aria-label="Refrescar"
                    icon={<MdRefresh />}
                    size={{ base: "sm", md: "md" }}
                    onClick={() => { loadAppointments(); loadStats(); }}
                  />
                </Tooltip>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Flex justify="center" align="center" minH="200px">
                <Spinner size="xl" color="brand.500" />
              </Flex>
            ) : !appointments || appointments.length === 0 ? (
              <Text textAlign="center" py={10} color={textColorSecondary}>
                No hay citas para mostrar.
              </Text>
            ) : (
              <TableContainer 
                maxW={{ base: "100%", lg: "100%" }}
                overflowX="auto"
                whiteSpace="nowrap"
              >
                <Table 
                  variant="simple" 
                  size={{ base: "sm", md: "md" }}
                  minW="800px"
                >
                  <Thead>
                    <Tr>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Número</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Paciente</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Profesional</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Servicio</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Fecha</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Estado</Th>
                      <Th fontSize={{ base: "xs", md: "sm" }}>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {appointments && appointments.map((appointment) => (
                      <Tr key={appointment.id}>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          <Text fontWeight="bold" color={textColor}>
                            {appointment.appointment_number}
                          </Text>
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          <Text isTruncated maxW="120px">
                            {appointment.patient_id}
                          </Text>
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                          <Text isTruncated maxW="120px">
                            {appointment.professional_id}
                          </Text>
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                          <Text isTruncated maxW="120px">
                            {appointment.medical_service_id}
                          </Text>
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          <Text isTruncated maxW="100px">
                            {new Date(appointment.scheduled_date).toLocaleDateString()}
                          </Text>
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          <Badge 
                            colorScheme={getStatusBadgeColor(appointment.status)}
                            size={{ base: "sm", md: "md" }}
                          >
                            {appointment.status}
                          </Badge>
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          <HStack spacing={1} justify="center">
                            <Tooltip label="Ver Detalles">
                              <IconButton
                                aria-label="Ver Detalles"
                                icon={<MdVisibility />}
                                size={{ base: "xs", md: "sm" }}
                                onClick={() => handleViewAppointment(appointment)}
                              />
                            </Tooltip>
                            <Tooltip label="Editar Cita">
                              <IconButton
                                aria-label="Editar Cita"
                                icon={<MdEdit />}
                                size={{ base: "xs", md: "sm" }}
                                onClick={() => alert("Función de edición en desarrollo")}
                              />
                            </Tooltip>
                            <Tooltip label="Eliminar Cita">
                              <IconButton
                                aria-label="Eliminar Cita"
                                icon={<MdDelete />}
                                size={{ base: "xs", md: "sm" }}
                                colorScheme="red"
                                onClick={() => handleDeleteAppointment(appointment)}
                              />
                            </Tooltip>
                            {appointment.status === 'confirmed' && userDetection?.detection?.detected_type === 'doctor' && (
                              <Tooltip label="Iniciar Consulta">
                                <IconButton
                                  aria-label="Iniciar Consulta"
                                  icon={<MdAdd />}
                                  size={{ base: "xs", md: "sm" }}
                                  colorScheme="green"
                                  onClick={() => handleStartConsultation(appointment)}
                                />
                              </Tooltip>
                            )}
                            {appointment.status === 'completed' && (
                              <>
                                <Tooltip label="Ver Recetas">
                                  <IconButton
                                    aria-label="Ver Recetas"
                                    icon={<MdDownload />}
                                    size={{ base: "xs", md: "sm" }}
                                    colorScheme="blue"
                                    onClick={() => handleViewPrescriptions(appointment)}
                                  />
                                </Tooltip>
                                {userDetection?.detection?.detected_type === 'patient' && (
                                  <Tooltip label="Calificar Doctor">
                                    <IconButton
                                      aria-label="Calificar Doctor"
                                      icon={<MdVisibility />}
                                      size={{ base: "xs", md: "sm" }}
                                      colorScheme="yellow"
                                      onClick={() => {/* Implementar calificación */}}
                                    />
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
            <Flex 
              direction={{ base: "column", sm: "row" }}
              justify="space-between" 
              align="center" 
              mt={4}
              gap={4}
            >
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                isDisabled={!pagination.has_prev || loading}
                size={{ base: "sm", md: "md" }}
                width={{ base: "full", sm: "auto" }}
              >
                Anterior
              </Button>
              <Text 
                fontSize={{ base: "sm", md: "md" }}
                textAlign="center"
                color={textColorSecondary}
              >
                Página {pagination.page} de {Math.ceil(pagination.total / pagination.size)}
              </Text>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                isDisabled={!pagination.has_next || loading}
                size={{ base: "sm", md: "md" }}
                width={{ base: "full", sm: "auto" }}
              >
                Siguiente
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </Flex>

      {/* Appointment Details Modal */}
      <Modal 
        isOpen={isDetailsOpen} 
        onClose={onDetailsClose} 
        size={{ base: "full", md: "xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader fontSize={{ base: "lg", md: "xl" }}>
            Detalles de la Cita
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppointment ? (
              <VStack align="start" spacing={3}>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Número de Cita:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.appointment_number}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Paciente ID:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.patient_id}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Profesional ID:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.professional_id}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Servicio Médico ID:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.medical_service_id}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Tipo de Cita:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.appointment_type}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Prioridad:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.priority}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Fecha Programada:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {new Date(selectedAppointment.scheduled_date).toLocaleString()}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Duración Estimada:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.estimated_duration_minutes} minutos
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Estado:
                  </Text>
                  <Badge colorScheme={getStatusBadgeColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Costo Estimado:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    ${selectedAppointment.estimated_cost}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Telemedicina:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.is_telemedicine ? "Sí" : "No"}
                  </Text>
                </Box>
                <Box w="full">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color={textColor}>
                    Notas:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color={textColorSecondary}>
                    {selectedAppointment.notes || "N/A"}
                  </Text>
                </Box>
              </VStack>
            ) : (
              <Text>Cargando detalles...</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              onClick={onDetailsClose}
              size={{ base: "sm", md: "md" }}
            >
              Cerrar
            </Button>
            <Button 
              colorScheme="blue" 
              ml={3} 
              onClick={() => {
                alert("Función de edición en desarrollo");
                onDetailsClose();
              }}
              size={{ base: "sm", md: "md" }}
            >
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={onDeleteClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader fontSize={{ base: "lg", md: "xl" }}>
            Confirmar Eliminación
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize={{ base: "sm", md: "md" }}>
              ¿Estás seguro de que quieres eliminar la cita{' '}
              <strong>{selectedAppointment?.appointment_number}</strong>?
              Esta acción no se puede deshacer.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onDeleteClose}
              size={{ base: "sm", md: "md" }}
            >
              Cancelar
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteConfirm}
              size={{ base: "sm", md: "md" }}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Intelligent Appointment Booking Modal */}
      <IntelligentAppointmentBooking
        isOpen={isBookingOpen}
        onClose={onBookingClose}
        onSuccess={handleBookingSuccess}
      />

      {/* Modal de Consulta Médica */}
      <MedicalConsultationModal
        isOpen={isConsultationOpen}
        onClose={onConsultationClose}
        appointment={selectedAppointment}
        onSuccess={handleConsultationSuccess}
      />

      {/* Modal de Visualización de Recetas */}
      <Modal isOpen={isPrescriptionOpen} onClose={onPrescriptionClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Recetas Médicas</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPatient && (
              <PrescriptionViewer
                patientId={selectedPatient.id}
                showAll={true}
                limit={20}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Sistema de Calificaciones */}
      {selectedAppointment && userDetection?.detection?.detected_type === 'patient' && (
        <RatingSystem
          doctorId={selectedAppointment.doctor_id}
          appointmentId={selectedAppointment.id}
          onRatingSubmitted={handleRatingSubmitted}
          showStats={true}
        />
      )}
    </Box>
  );
}