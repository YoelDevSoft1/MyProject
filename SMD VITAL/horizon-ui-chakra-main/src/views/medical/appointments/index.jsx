import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Text,
  useColorModeValue,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdCalendarToday,
  MdPerson,
  MdLocalHospital,
  MdAccessTime,
  MdAttachMoney,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdRefresh,
  MdDownload,
  MdPrint,
} from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";
import AppointmentForm from "./AppointmentForm";
import AppointmentCalendar from "./AppointmentCalendar";

export default function AppointmentsManagement() {
  // Auth context
  const { token, isAuthenticated } = useAuth();
  
  // State
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    appointment_type: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    has_next: false,
    has_prev: false,
  });
  const [stats, setStats] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Modals
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Toast
  const toast = useToast();
  
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("white", "navy.800");
  const boxShadow = useColorModeValue("14px 17px 40px 4px rgba(112, 144, 176, 0.08)", "14px 17px 40px 4px rgba(112, 144, 176, 0.08)");
  const brandColor = useColorModeValue("brand.500", "brand.500");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  // Load appointments
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAppointments(token, {
        skip: (pagination.page - 1) * pagination.size,
        limit: pagination.size,
        ...filters,
      });
      
      if (response.success) {
        setAppointments(response.data.appointments);
        setPagination({
          page: response.data.page,
          size: response.data.size,
          total: response.data.total,
          has_next: response.data.has_next,
          has_prev: response.data.has_prev,
        });
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.size, filters]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await apiService.getAppointmentStats(token);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [token]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAppointments();
      loadStats();
    }
  }, [isAuthenticated, token, loadAppointments, loadStats]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle appointment actions
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    onDetailsOpen();
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    onEditOpen();
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    onCreateOpen();
  };

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    onDeleteOpen();
  };

  const handleFormSuccess = () => {
    loadAppointments();
    loadStats();
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

  // Get status text in Spanish
  const getStatusText = (status) => {
    const texts = {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmada",
      IN_PROGRESS: "En Progreso",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
      NO_SHOW: "No Asistió",
      RESCHEDULED: "Reprogramada",
    };
    return texts[status] || status;
  };

  // Get appointment type text in Spanish
  const getAppointmentTypeText = (type) => {
    const texts = {
      CONSULTATION: "Consulta",
      FOLLOW_UP: "Seguimiento",
      EMERGENCY: "Emergencia",
      PROCEDURE: "Procedimiento",
      PREVENTIVE: "Preventivo",
      SPECIALIST: "Especialista",
      TELEMEDICINE: "Telemedicina",
    };
    return texts[type] || type;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  if (loading && appointments.length === 0) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color={brandColor} />
          <Text color={textColorSecondary}>Cargando citas médicas...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Header */}
      <Flex direction="column" gap={6}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text color={textColor} fontSize="2xl" fontWeight="bold">
              Gestión de Citas Médicas
            </Text>
            <Text color={textColorSecondary} fontSize="md">
              Administra las citas médicas del sistema SMD VITAL
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="brand"
            size="lg"
            onClick={handleCreateAppointment}
          >
            Nueva Cita
          </Button>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Citas</StatLabel>
                <StatNumber color={brandColor}>{stats.total_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Sistema completo
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Confirmadas</StatLabel>
                <StatNumber color="blue.500">{stats.confirmed_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Listas para atención
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completadas</StatLabel>
                <StatNumber color="green.500">{stats.completed_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Atendidas hoy
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Telemedicina</StatLabel>
                <StatNumber color="purple.500">{stats.telemedicine_appointments || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Consultas virtuales
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por número de cita, paciente..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
              
              <Select
                placeholder="Filtrar por estado"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                maxW="200px"
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="COMPLETED">Completada</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="NO_SHOW">No Asistió</option>
                <option value="RESCHEDULED">Reprogramada</option>
              </Select>
              
              <Select
                placeholder="Filtrar por tipo"
                value={filters.appointment_type}
                onChange={(e) => handleFilterChange('appointment_type', e.target.value)}
                maxW="200px"
              >
                <option value="CONSULTATION">Consulta</option>
                <option value="FOLLOW_UP">Seguimiento</option>
                <option value="EMERGENCY">Emergencia</option>
                <option value="PROCEDURE">Procedimiento</option>
                <option value="PREVENTIVE">Preventivo</option>
                <option value="SPECIALIST">Especialista</option>
                <option value="TELEMEDICINE">Telemedicina</option>
              </Select>
              
              <Button
                leftIcon={<Icon as={MdRefresh} />}
                variant="outline"
                onClick={loadAppointments}
                isLoading={loading}
              >
                Actualizar
              </Button>
            </HStack>
          </CardBody>
        </Card>

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

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Lista de Citas</Tab>
            <Tab>Calendario</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              {/* Appointments Table */}
              <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Lista de Citas</Heading>
              <HStack>
                <Tooltip label="Exportar">
                  <IconButton
                    icon={<Icon as={MdDownload} />}
                    variant="outline"
                    size="sm"
                  />
                </Tooltip>
                <Tooltip label="Imprimir">
                  <IconButton
                    icon={<Icon as={MdPrint} />}
                    variant="outline"
                    size="sm"
                  />
                </Tooltip>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Número</Th>
                    <Th>Paciente</Th>
                    <Th>Tipo</Th>
                    <Th>Fecha</Th>
                    <Th>Estado</Th>
                    <Th>Costo</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {appointments.map((appointment) => (
                    <Tr key={appointment.id} _hover={{ bg: hoverBg }}>
                      <Td>
                        <Text fontWeight="bold" color={brandColor}>
                          {appointment.appointment_number}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            {appointment.patient_id}
                          </Text>
                          <Text fontSize="sm" color={textColorSecondary}>
                            ID: {appointment.patient_id.slice(0, 8)}...
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {getAppointmentTypeText(appointment.appointment_type)}
                        </Badge>
                        {appointment.is_telemedicine && (
                          <Badge colorScheme="purple" variant="subtle" ml={2}>
                            Virtual
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text>{formatDate(appointment.scheduled_date)}</Text>
                          <Text fontSize="sm" color={textColorSecondary}>
                            {appointment.estimated_duration_minutes} min
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusBadgeColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="medium">
                          {appointment.estimated_cost ? formatCurrency(appointment.estimated_cost) : 'N/A'}
                        </Text>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<Icon as={MdMoreVert} />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<Icon as={MdVisibility} />}
                              onClick={() => handleViewAppointment(appointment)}
                            >
                              Ver Detalles
                            </MenuItem>
                            <MenuItem
                              icon={<Icon as={MdEdit} />}
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              Editar
                            </MenuItem>
                            <MenuItem
                              icon={<Icon as={MdDelete} />}
                              onClick={() => handleDeleteAppointment(appointment)}
                              color="red.500"
                            >
                              Eliminar
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Flex justify="space-between" align="center" mt={4}>
              <Text color={textColorSecondary} fontSize="sm">
                Mostrando {appointments.length} de {pagination.total} citas
              </Text>
              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={!pagination.has_prev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <Text fontSize="sm">
                  Página {pagination.page}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={!pagination.has_next}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Siguiente
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
            </TabPanel>
            
            <TabPanel px={0}>
              <AppointmentCalendar />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>

      {/* Appointment Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles de la Cita</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppointment && (
              <VStack align="stretch" spacing={4}>
                <Text><strong>Número:</strong> {selectedAppointment.appointment_number}</Text>
                <Text><strong>Estado:</strong> {getStatusText(selectedAppointment.status)}</Text>
                <Text><strong>Tipo:</strong> {getAppointmentTypeText(selectedAppointment.appointment_type)}</Text>
                <Text><strong>Fecha:</strong> {formatDate(selectedAppointment.scheduled_date)}</Text>
                <Text><strong>Duración:</strong> {selectedAppointment.estimated_duration_minutes} minutos</Text>
                <Text><strong>Costo:</strong> {selectedAppointment.estimated_cost ? formatCurrency(selectedAppointment.estimated_cost) : 'N/A'}</Text>
                {selectedAppointment.chief_complaint && (
                  <Text><strong>Motivo:</strong> {selectedAppointment.chief_complaint}</Text>
                )}
                {selectedAppointment.symptoms && (
                  <Text><strong>Síntomas:</strong> {selectedAppointment.symptoms}</Text>
                )}
                {selectedAppointment.notes && (
                  <Text><strong>Notas:</strong> {selectedAppointment.notes}</Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Cerrar
            </Button>
            <Button colorScheme="blue" onClick={() => {
              onDetailsClose();
              handleEditAppointment(selectedAppointment);
            }}>
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create/Edit Appointment Modal */}
      <AppointmentForm
        isOpen={isCreateOpen || isEditOpen}
        onClose={isCreateOpen ? onCreateClose : onEditClose}
        appointment={selectedAppointment}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              ¿Estás seguro de que quieres eliminar la cita{' '}
              <strong>{selectedAppointment?.appointment_number}</strong>?
              Esta acción no se puede deshacer.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={() => {
              // TODO: Implement delete appointment
              onDeleteClose();
            }}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
