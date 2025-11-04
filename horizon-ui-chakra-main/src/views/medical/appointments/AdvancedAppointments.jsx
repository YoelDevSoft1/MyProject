/**
 * SMD VITAL - Módulo de Citas Médicas Avanzado
 * =============================================
 * 
 * Módulo completo para gestión de citas médicas con:
 * - Calendario inteligente
 * - Disponibilidad en tiempo real
 * - Gestión de profesionales
 * - Notificaciones automáticas
 * - Integración con IA
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Spacer,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Switch,
  Divider,
  Wrap,
  WrapItem,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  ScaleFade,
  Fade,
  SlideFade
} from '@chakra-ui/react';
import {
  MdCalendarToday,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdNotifications,
  MdSchedule,
  MdPerson,
  MdLocalHospital,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdRefresh,
  MdDownload,
  MdPrint,
  MdShare,
  MdSettings,
  MdAccessTime,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdInfo,
  MdTrendingUp,
  MdAnalytics,
  MdDashboard
} from 'react-icons/md';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaBell } from 'react-icons/fa';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';
import aiService from '../../../services/core/AIService';
import apiService from '../../../services/apiService';

const AdvancedAppointments = () => {
  // =====================================================
  // ESTADOS Y HOOKS
  // =====================================================

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Estados principales
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list, grid
  const [filters, setFilters] = useState({
    status: 'all',
    professional: 'all',
    patient: 'all',
    dateRange: 'today'
  });

  // Estados de formularios
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    professional_id: '',
    appointment_type: 'consultation',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    reason_for_visit: '',
    symptoms: '',
    notes: '',
    follow_up_required: false,
    follow_up_date: ''
  });

  // Colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [filters, selectedDate]);

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfessionals(),
        loadPatients(),
        loadAppointments()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos iniciales',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const params = {
        date: selectedDate.toISOString().split('T')[0],
        ...filters
      };

      const response = await apiService.get('/appointments', { params });
      // Extraer datos de la respuesta del API
      const appointmentsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las citas',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await apiService.get('/professionals');
      // Extraer datos de la respuesta del API
      const professionalsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProfessionals(professionalsData);
    } catch (error) {
      console.error('Error loading professionals:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await apiService.get('/patients');
      // Extraer datos de la respuesta del API
      const patientsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  // =====================================================
  // FUNCIONES DE GESTIÓN DE CITAS
  // =====================================================

  const handleCreateAppointment = async () => {
    try {
      setLoading(true);
      
      // Usar lógica de negocio para crear cita
      const appointment = await businessLogicService.createAppointment(appointmentForm);
      
      setAppointments(prev => [appointment, ...prev]);
      onCreateClose();
      
      // Limpiar formulario
      setAppointmentForm({
        patient_id: '',
        professional_id: '',
        appointment_type: 'consultation',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 30,
        reason_for_visit: '',
        symptoms: '',
        notes: '',
        follow_up_required: false,
        follow_up_date: ''
      });

      toast({
        title: 'Cita Creada',
        description: 'La cita ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear la cita',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (appointmentId, updates) => {
    try {
      setLoading(true);
      
      const response = await apiService.put(`/appointments/${appointmentId}`, updates);
      const updatedAppointment = response.data;
      
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? updatedAppointment : apt)
      );
      
      onEditClose();
      
      toast({
        title: 'Cita Actualizada',
        description: 'La cita ha sido actualizada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la cita',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      
      await handleUpdateAppointment(appointmentId, { status: 'cancelled' });
      
      toast({
        title: 'Cita Cancelada',
        description: 'La cita ha sido cancelada exitosamente',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      
      await handleUpdateAppointment(appointmentId, { status: 'completed' });
      
      toast({
        title: 'Cita Completada',
        description: 'La cita ha sido marcada como completada',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error completing appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FUNCIONES DE UTILIDAD
  // =====================================================

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      confirmed: 'green',
      in_progress: 'orange',
      completed: 'purple',
      cancelled: 'red',
      rescheduled: 'yellow'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: MdSchedule,
      confirmed: MdCheckCircle,
      in_progress: MdAccessTime,
      completed: MdCheckCircle,
      cancelled: MdCancel,
      rescheduled: MdRefresh
    };
    return icons[status] || MdInfo;
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // =====================================================
  // COMPONENTES DE UI
  // =====================================================

  const AppointmentCard = ({ appointment }) => {
    const professional = professionals.find(p => p.id === appointment.professional_id);
    const patient = patients.find(p => p.id === appointment.patient_id);
    const StatusIcon = getStatusIcon(appointment.status);

    return (
      <ScaleFade in={true} initialScale={0.95}>
        <Card
          bg={cardBg}
          borderColor={borderColor}
          _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <CardHeader pb={2}>
            <Flex align="center" justify="space-between">
              <HStack spacing={3}>
                <Icon as={MdCalendarToday} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {appointment.appointment_number}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {formatDate(appointment.scheduled_date)} - {formatTime(appointment.scheduled_time)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                colorScheme={getStatusColor(appointment.status)}
                leftIcon={<Icon as={StatusIcon} />}
              >
                {appointment.status}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUserMd} color="green.500" />
                  <Text fontSize="sm" color={textColor}>
                    {professional?.name || 'Profesional no encontrado'}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={textColorSecondary}>
                  {appointment.duration_minutes} min
                </Text>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient?.name || 'Paciente no encontrado'}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={textColorSecondary}>
                  {appointment.appointment_type}
                </Text>
              </HStack>

              {appointment.reason_for_visit && (
                <Text fontSize="sm" color={textColorSecondary} noOfLines={2}>
                  {appointment.reason_for_visit}
                </Text>
              )}
            </VStack>
          </CardBody>

          <CardFooter pt={0}>
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdVisibility} />}
                onClick={() => {
                  setSelectedAppointment(appointment);
                  onDetailsOpen();
                }}
              >
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdEdit} />}
                onClick={() => {
                  setSelectedAppointment(appointment);
                  onEditOpen();
                }}
              >
                Editar
              </Button>
              <Menu>
                <MenuButton as={Button} size="sm" variant="outline">
                  <Icon as={MdMoreVert} />
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={<Icon as={MdCheckCircle} />}
                    onClick={() => handleCompleteAppointment(appointment.id)}
                    isDisabled={appointment.status === 'completed'}
                  >
                    Completar
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={MdCancel} />}
                    onClick={() => handleCancelAppointment(appointment.id)}
                    isDisabled={appointment.status === 'cancelled'}
                  >
                    Cancelar
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<Icon as={MdNotifications} />}>
                    Enviar Recordatorio
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdPrint} />}>
                    Imprimir
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </CardFooter>
        </Card>
      </ScaleFade>
    );
  };

  const CalendarView = () => {
    const days = useMemo(() => {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - startOfMonth.getDay());
      
      const daysArray = [];
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        daysArray.push(date);
      }
      return daysArray;
    }, [selectedDate]);

    const getAppointmentsForDate = (date) => {
      return appointments.filter(apt => 
        new Date(apt.scheduled_date).toDateString() === date.toDateString()
      );
    };

    return (
      <Box>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={4}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <GridItem key={day} p={2} textAlign="center" fontWeight="bold" bg={headerBg}>
              {day}
            </GridItem>
          ))}
        </Grid>
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <GridItem
                key={index}
                minH="120px"
                p={2}
                border="1px solid"
                borderColor={borderColor}
                bg={isCurrentMonth ? bgColor : 'gray.50'}
                opacity={isCurrentMonth ? 1 : 0.5}
                position="relative"
                _hover={{ bg: isCurrentMonth ? 'gray.50' : 'gray.100' }}
                cursor="pointer"
                onClick={() => setSelectedDate(day)}
              >
                <Text
                  fontSize="sm"
                  fontWeight={isToday ? 'bold' : 'normal'}
                  color={isToday ? 'blue.500' : textColor}
                  mb={2}
                >
                  {day.getDate()}
                </Text>
                <VStack spacing={1} align="stretch">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <Box
                      key={appointment.id}
                      p={1}
                      bg={`${getStatusColor(appointment.status)}.100`}
                      color={`${getStatusColor(appointment.status)}.700`}
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="medium"
                      _hover={{ bg: `${getStatusColor(appointment.status)}.200` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppointment(appointment);
                        onDetailsOpen();
                      }}
                    >
                      <Text noOfLines={1}>
                        {formatTime(appointment.scheduled_time)} - {appointment.appointment_number}
                      </Text>
                    </Box>
                  ))}
                  {dayAppointments.length > 3 && (
                    <Text fontSize="xs" color={textColorSecondary}>
                      +{dayAppointments.length - 3} más
                    </Text>
                  )}
                </VStack>
              </GridItem>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const ListView = () => (
    <VStack spacing={4} align="stretch">
      {appointments.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </VStack>
  );

  const GridView = () => (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
      {appointments.map(appointment => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </Grid>
  );

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  if (loading && appointments.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando citas médicas...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            Citas Médicas Avanzadas
          </Text>
          <Text color={textColorSecondary}>
            Gestión completa de citas médicas con IA
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={loadAppointments}
            isLoading={loading}
            variant="outline"
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            onClick={onCreateOpen}
            colorScheme="blue"
          >
            Nueva Cita
          </Button>
        </HStack>
      </Flex>

      {/* Filtros y Controles */}
      <Card mb={6} bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              maxW="200px"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programadas</option>
              <option value="confirmed">Confirmadas</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </Select>
            
            <Select
              value={filters.professional}
              onChange={(e) => setFilters(prev => ({ ...prev, professional: e.target.value }))}
              maxW="200px"
            >
              <option value="all">Todos los profesionales</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </Select>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant={viewMode === 'calendar' ? 'solid' : 'outline'}
                onClick={() => setViewMode('calendar')}
                leftIcon={<Icon as={MdCalendarToday} />}
              >
                Calendario
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                onClick={() => setViewMode('list')}
                leftIcon={<Icon as={MdDashboard} />}
              >
                Lista
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'solid' : 'outline'}
                onClick={() => setViewMode('grid')}
                leftIcon={<Icon as={MdAnalytics} />}
              >
                Cuadrícula
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Contenido Principal */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          {viewMode === 'calendar' && <CalendarView />}
          {viewMode === 'list' && <ListView />}
          {viewMode === 'grid' && <GridView />}
        </CardBody>
      </Card>

      {/* Modales */}
      {/* Modal de Crear Cita */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Cita Médica</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Paciente</FormLabel>
                <Select
                  value={appointmentForm.patient_id}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, patient_id: e.target.value }))}
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Profesional</FormLabel>
                <Select
                  value={appointmentForm.professional_id}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, professional_id: e.target.value }))}
                >
                  <option value="">Seleccionar profesional</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name} - {prof.specialty}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Fecha</FormLabel>
                  <Input
                    type="date"
                    value={appointmentForm.scheduled_date}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Hora</FormLabel>
                  <Input
                    type="time"
                    value={appointmentForm.scheduled_time}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Motivo de la consulta</FormLabel>
                <Textarea
                  value={appointmentForm.reason_for_visit}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, reason_for_visit: e.target.value }))}
                  placeholder="Describa el motivo de la consulta..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCreateClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleCreateAppointment} isLoading={loading}>
              Crear Cita
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Detalles */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Detalles de la Cita
            {selectedAppointment && (
              <Badge
                colorScheme={getStatusColor(selectedAppointment.status)}
                ml={3}
              >
                {selectedAppointment.status}
              </Badge>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppointment && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Número de Cita:</Text>
                  <Text>{selectedAppointment.appointment_number}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Fecha y Hora:</Text>
                  <Text>
                    {formatDate(selectedAppointment.scheduled_date)} - {formatTime(selectedAppointment.scheduled_time)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Duración:</Text>
                  <Text>{selectedAppointment.duration_minutes} minutos</Text>
                </HStack>
                {selectedAppointment.reason_for_visit && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Motivo de la consulta:</Text>
                    <Text>{selectedAppointment.reason_for_visit}</Text>
                  </Box>
                )}
                {selectedAppointment.notes && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Notas:</Text>
                    <Text>{selectedAppointment.notes}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDetailsClose}>
              Cerrar
            </Button>
            <Button colorScheme="blue" onClick={() => {
              onDetailsClose();
              onEditOpen();
            }}>
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedAppointments;
