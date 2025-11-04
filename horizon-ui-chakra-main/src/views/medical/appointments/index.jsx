import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Divider,
  Progress,
  Switch,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  Collapse,
  ScaleFade,
  Fade,
  Checkbox,
  ButtonGroup,
  Spacer,
} from "@chakra-ui/react";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdRefresh,
  MdDownload,
  MdPrint,
  MdSearch,
  MdFilterList,
  MdClear,
  MdCalendarToday,
  MdPerson,
  MdLocalHospital,
  MdSchedule,
  MdCheckCircle,
  MdWarning,
  MdCancel,
  MdMoreVert,
  MdSort,
  MdViewList,
  MdGridView,
  MdSettings,
  MdSave,
  MdClose,
  MdTrendingUp,
  MdTrendingDown,
  MdNotifications,
  MdAccessTime,
  MdAttachMoney,
  MdPhone,
  MdVideoCall,
  MdHealthAndSafety,
  MdSpeed,
  MdAnalytics,
  MdAutoGraph,
  MdMonitorHeart,
  MdDragIndicator,
  MdEvent,
  MdEventAvailable,
  MdEventBusy,
  MdEventNote,
  MdEventRepeat,
  MdEventSeat,
  MdToday,
  MdDateRange,
  MdTimeline,
  MdViewWeek,
  MdCalendarViewMonth,
  MdViewDay,
  MdSwapVert,
  MdSwapHoriz,
  MdContentCopy,
  MdContentCut,
  MdContentPaste,
  MdUndo,
  MdRedo,
  MdZoomIn,
  MdZoomOut,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";
import IntelligentAppointmentBooking from "components/IntelligentAppointmentBooking";
import UserDetectionInfo from "components/UserDetectionInfo";
import MedicalConsultationModal from "components/MedicalConsultationModal";
import PrescriptionViewer from "components/PrescriptionViewer";
import RatingSystem from "components/RatingSystem";

// Calendar View Component
const CalendarView = ({ events, view, selectedDate, onDateChange, onEventClick, onEventDrag, onEventDrop, zoom, isFullscreen }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return (
      <Box>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={4}>
          {weekDays.map(day => (
            <Box key={`weekday-${day}`} p={2} textAlign="center" fontWeight="bold" bg="gray.100">
              {day}
            </Box>
          ))}
        </Grid>
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            return (
              <Box
                key={day ? `day-${day.toDateString()}` : `empty-${index}`}
                minH="120px"
                p={2}
                border="1px solid"
                borderColor="gray.200"
                bg={day ? "white" : "gray.50"}
                position="relative"
                onDrop={(e) => {
                  e.preventDefault();
                  if (day) {
                    onEventDrop(day, new Date());
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {day && (
                  <>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      {day.getDate()}
                    </Text>
                    {dayEvents.map(event => (
                      <Box
                        key={`event-${event.id}-${day?.toDateString()}`}
                        p={1}
                        mb={1}
                        bg={event.color}
                        color="white"
                        borderRadius="md"
                        fontSize="xs"
                        cursor="pointer"
                        draggable
                        onDragStart={() => onEventDrag(event)}
                        onClick={() => onEventClick(event)}
                        _hover={{ opacity: 0.8 }}
                      >
                        <Text isTruncated>{event.title}</Text>
                      </Box>
                    ))}
                  </>
                )}
              </Box>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <Box>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={4}>
          {weekDays.map(day => (
            <Box key={`weekday-detail-${day.toDateString()}`} p={2} textAlign="center" fontWeight="bold" bg="gray.100">
              {day.toLocaleDateString('es-CO', { weekday: 'short' })}
            </Box>
          ))}
        </Grid>
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day);
            return (
              <Box
                key={`day-detail-${day.toDateString()}`}
                minH="200px"
                p={2}
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                position="relative"
                onDrop={(e) => {
                  e.preventDefault();
                  onEventDrop(day, new Date());
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  {day.getDate()}
                </Text>
                {dayEvents.map(event => (
                  <Box
                    key={`event-detail-${event.id}-${day.toDateString()}`}
                    p={1}
                    mb={1}
                    bg={event.color}
                    color="white"
                    borderRadius="md"
                    fontSize="xs"
                    cursor="pointer"
                    draggable
                    onDragStart={() => onEventDrag(event)}
                    onClick={() => onEventClick(event)}
                    _hover={{ opacity: 0.8 }}
                  >
                    <Text isTruncated>{event.title}</Text>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          {currentDate.toLocaleDateString('es-CO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        <Grid templateColumns="60px 1fr" gap={1}>
          {hours.map(hour => (
            <React.Fragment key={`hour-${hour}`}>
              <Box p={2} textAlign="center" fontSize="sm" color="gray.600">
                {hour.toString().padStart(2, '0')}:00
              </Box>
              <Box
                minH="60px"
                p={2}
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                position="relative"
                onDrop={(e) => {
                  e.preventDefault();
                  const newTime = new Date(currentDate);
                  newTime.setHours(hour, 0, 0, 0);
                  onEventDrop(currentDate, newTime);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {dayEvents
                  .filter(event => new Date(event.start).getHours() === hour)
                  .map(event => (
                    <Box
                      key={`event-hour-${event.id}-${hour}`}
                      p={1}
                      mb={1}
                      bg={event.color}
                      color="white"
                      borderRadius="md"
                      fontSize="xs"
                      cursor="pointer"
                      draggable
                      onDragStart={() => onEventDrag(event)}
                      onClick={() => onEventClick(event)}
                      _hover={{ opacity: 0.8 }}
                    >
                      <Text isTruncated>{event.title}</Text>
                    </Box>
                  ))}
              </Box>
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box transform={`scale(${zoom})`} transformOrigin="top left" width={`${100/zoom}%`}>
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={4}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newDate = new Date(currentDate);
              if (view === 'month') {
                newDate.setMonth(newDate.getMonth() - 1);
              } else if (view === 'week') {
                newDate.setDate(newDate.getDate() - 7);
              } else {
                newDate.setDate(newDate.getDate() - 1);
              }
              setCurrentDate(newDate);
              onDateChange(newDate);
            }}
          >
            ← Anterior
          </Button>
          <Text fontSize="lg" fontWeight="bold">
            {currentDate.toLocaleDateString('es-CO', { 
              year: 'numeric', 
              month: 'long',
              ...(view === 'day' && { day: 'numeric' })
            })}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newDate = new Date(currentDate);
              if (view === 'month') {
                newDate.setMonth(newDate.getMonth() + 1);
              } else if (view === 'week') {
                newDate.setDate(newDate.getDate() + 7);
              } else {
                newDate.setDate(newDate.getDate() + 1);
              }
              setCurrentDate(newDate);
              onDateChange(newDate);
            }}
          >
            Siguiente →
          </Button>
        </HStack>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const today = new Date();
            setCurrentDate(today);
            onDateChange(today);
          }}
        >
          Hoy
        </Button>
      </Flex>
      
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </Box>
  );
};

// Appointment Card Component
const AppointmentCard = ({ appointment, onEdit, onDelete, onView, isSelected, onSelect, onDragStart, isDragging }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'PENDING': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Card
      size="sm"
      cursor="pointer"
      draggable
      onDragStart={onDragStart}
      opacity={isDragging ? 0.5 : 1}
      border={isSelected ? "2px solid" : "1px solid"}
      borderColor={isSelected ? "blue.500" : "gray.200"}
      bg={isSelected ? "blue.50" : "white"}
      _hover={{ shadow: "md" }}
    >
      <CardBody>
        <Flex justify="space-between" align="start" mb={2}>
          <Checkbox
            isChecked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <Menu>
            <MenuButton as={Button} size="xs" variant="ghost">
              <Icon as={MdMoreVert} />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={onView} leftIcon={<Icon as={MdVisibility} />}>
                Ver
              </MenuItem>
              <MenuItem onClick={onEdit} leftIcon={<Icon as={MdEdit} />}>
                Editar
              </MenuItem>
              <MenuItem onClick={onDelete} leftIcon={<Icon as={MdDelete} />} color="red.500">
                Eliminar
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm" fontWeight="bold" isTruncated>
            {appointment.patient_id}
          </Text>
          
          <Text fontSize="xs" color="gray.600" isTruncated>
            {appointment.professional_id}
          </Text>
          
          <Text fontSize="xs" color="gray.600">
            {new Date(appointment.scheduled_date).toLocaleDateString('es-CO')}
          </Text>
          
          <HStack spacing={1}>
            <Badge colorScheme={getStatusColor(appointment.status)} size="sm">
              {appointment.status}
            </Badge>
            {appointment.priority && (
              <Badge colorScheme={getPriorityColor(appointment.priority)} size="sm">
                {appointment.priority}
              </Badge>
            )}
            {appointment.is_telemedicine && (
              <Badge colorScheme="purple" size="sm">
                Virtual
              </Badge>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
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
  
  // Smart Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    doctor: '',
    patient: '',
    dateFrom: '',
    dateTo: '',
    priority: '',
    appointmentType: '',
    isTelemedicine: null,
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, calendar, grid
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Real-time Dashboard State
  const [realtimeStats, setRealtimeStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    urgentAppointments: 0,
    completedToday: 0,
    pendingAppointments: 0,
    telemedicineCount: 0,
    averageWaitTime: 0,
    revenue: 0,
    lastUpdated: null,
    trends: {
      appointments: { value: 0, change: 0, direction: 'up' },
      revenue: { value: 0, change: 0, direction: 'up' },
      efficiency: { value: 0, change: 0, direction: 'up' },
      satisfaction: { value: 0, change: 0, direction: 'up' }
    }
  });
  const [alerts, setAlerts] = useState([]);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // Advanced Management State
  const [calendarView, setCalendarView] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [draggedAppointment, setDraggedAppointment] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [bulkActions, setBulkActions] = useState([]);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [calendarZoom, setCalendarZoom] = useState(1);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
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

  // Smart Filters Functions
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update active filters
    if (value && value !== '') {
      setActiveFilters(prev => {
        const existing = prev.find(f => f.key === key);
        if (existing) {
          return prev.map(f => f.key === key ? { ...f, value } : f);
        }
        return [...prev, { key, value, label: getFilterLabel(key, value) }];
      });
    } else {
      setActiveFilters(prev => prev.filter(f => f.key !== key));
    }
  }, []);

  const getFilterLabel = (key, value) => {
    const labels = {
      status: `Estado: ${value}`,
      doctor: `Doctor: ${value}`,
      patient: `Paciente: ${value}`,
      priority: `Prioridad: ${value}`,
      appointmentType: `Tipo: ${value}`,
      isTelemedicine: value ? 'Telemedicina' : 'Presencial',
    };
    return labels[key] || `${key}: ${value}`;
  };

  const clearFilter = useCallback((key) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
    setActiveFilters(prev => prev.filter(f => f.key !== key));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      doctor: '',
      patient: '',
      dateFrom: '',
      dateTo: '',
      priority: '',
      appointmentType: '',
      isTelemedicine: null,
    });
    setActiveFilters([]);
  }, []);

  const saveFilter = useCallback((name) => {
    const newFilter = {
      id: Date.now(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };
    setSavedFilters(prev => [...prev, newFilter]);
    toast({
      title: "Filtro guardado",
      description: `El filtro "${name}" ha sido guardado`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [filters, toast]);

  const loadSavedFilter = useCallback((savedFilter) => {
    setFilters(savedFilter.filters);
    setActiveFilters(
      Object.entries(savedFilter.filters)
        .filter(([key, value]) => value && value !== '')
        .map(([key, value]) => ({ key, value, label: getFilterLabel(key, value) }))
    );
  }, []);

  // Load appointments data with filters
  const loadAppointments = useCallback(async (page = 1, size = 10) => {
    if (!isAuthenticated || !token) {
      setAppointmentsData(prev => ({ ...prev, loading: false, error: "No autenticado" }));
      return;
    }
    setAppointmentsData(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Build query parameters with filters
      const queryParams = {
        skip: (page - 1) * size,
        limit: size,
        ...filters,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const response = await apiService.getAppointments(token, queryParams);
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
  }, [isAuthenticated, token, toast, filters, sortBy, sortOrder]);

  // Real-time Dashboard Functions
  const loadRealtimeStats = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      // Load multiple data sources in parallel
      const [appointmentsRes, statsRes, paymentsRes, notificationsRes] = await Promise.all([
        apiService.getAppointments(token, { limit: 1000 }),
        apiService.getAppointmentStats(token),
        apiService.getPayments(token),
        apiService.getNotifications(token)
      ]);

      const appointments = appointmentsRes.success ? appointmentsRes.data.appointments || [] : [];
      const payments = paymentsRes.success ? paymentsRes.data || [] : [];
      const notifications = notificationsRes.success ? notificationsRes.data || [] : [];

      // Calculate real-time metrics
      const today = new Date().toDateString();
      const todayAppointments = appointments.filter(apt => 
        new Date(apt.scheduled_date).toDateString() === today
      );
      
      const urgentAppointments = appointments.filter(apt => 
        apt.priority === 'URGENT' || apt.priority === 'HIGH'
      );
      
      const completedToday = appointments.filter(apt => 
        apt.status === 'COMPLETED' && new Date(apt.scheduled_date).toDateString() === today
      );
      
      const telemedicineCount = appointments.filter(apt => 
        apt.is_telemedicine === true
      ).length;
      
      const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      // Calculate trends (mock data for now)
      const trends = {
        appointments: { 
          value: appointments.length, 
          change: Math.floor(Math.random() * 20) - 10, 
          direction: Math.random() > 0.5 ? 'up' : 'down' 
        },
        revenue: { 
          value: totalRevenue, 
          change: Math.floor(Math.random() * 15) - 5, 
          direction: Math.random() > 0.5 ? 'up' : 'down' 
        },
        efficiency: { 
          value: Math.floor(Math.random() * 40) + 60, 
          change: Math.floor(Math.random() * 10) - 5, 
          direction: Math.random() > 0.5 ? 'up' : 'down' 
        },
        satisfaction: { 
          value: Math.floor(Math.random() * 20) + 80, 
          change: Math.floor(Math.random() * 8) - 4, 
          direction: Math.random() > 0.5 ? 'up' : 'down' 
        }
      };

      // Generate alerts
      const newAlerts = [];
      if (urgentAppointments.length > 0) {
        newAlerts.push({
          id: 'urgent',
          type: 'warning',
          title: 'Citas Urgentes',
          message: `${urgentAppointments.length} citas urgentes pendientes`,
          icon: MdWarning,
          timestamp: new Date()
        });
      }
      
      if (todayAppointments.length > 10) {
        newAlerts.push({
          id: 'busy',
          type: 'info',
          title: 'Día Ocupado',
          message: `${todayAppointments.length} citas programadas para hoy`,
          icon: MdSchedule,
          timestamp: new Date()
        });
      }

      setRealtimeStats({
        totalAppointments: appointments.length,
        todayAppointments: todayAppointments.length,
        urgentAppointments: urgentAppointments.length,
        completedToday: completedToday.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'PENDING').length,
        telemedicineCount,
        averageWaitTime: Math.floor(Math.random() * 30) + 15, // Mock data
        revenue: totalRevenue,
        lastUpdated: new Date(),
        trends
      });

      setAlerts(newAlerts);

    } catch (error) {
      console.error('Error loading real-time stats:', error);
    }
  }, [isAuthenticated, token]);

  // Auto-refresh for real-time updates
  useEffect(() => {
    if (!isRealtimeEnabled) return;

    const interval = setInterval(() => {
      loadRealtimeStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isRealtimeEnabled, refreshInterval, loadRealtimeStats]);

  // Advanced Management Functions
  const convertAppointmentsToEvents = useCallback((appointments) => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.patientName || appointment.patient} - ${appointment.doctorName || appointment.doctor}`,
      start: new Date(appointment.scheduled_date),
      end: new Date(new Date(appointment.scheduled_date).getTime() + (appointment.duration || 30) * 60000),
      color: getAppointmentColor(appointment.status, appointment.priority),
      status: appointment.status,
      priority: appointment.priority,
      isTelemedicine: appointment.is_telemedicine,
      patient: appointment.patientName || appointment.patient,
      doctor: appointment.doctorName || appointment.doctor,
      notes: appointment.notes,
      originalData: appointment
    }));
  }, []);

  const getAppointmentColor = (status, priority) => {
    if (priority === 'URGENT') return '#E53E3E';
    if (priority === 'HIGH') return '#DD6B20';
    if (status === 'COMPLETED') return '#38A169';
    if (status === 'CONFIRMED') return '#3182CE';
    if (status === 'PENDING') return '#D69E2E';
    if (status === 'CANCELLED') return '#718096';
    return '#4A5568';
  };

  const handleDragStart = (appointment) => {
    setDraggedAppointment(appointment);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setIsDragging(false);
  };

  const handleDrop = async (newDate, newTime) => {
    if (!draggedAppointment) return;

    try {
      const updatedAppointment = {
        ...draggedAppointment.originalData,
        scheduled_date: newDate.toISOString(),
        scheduled_time: newTime
      };

      // Save to undo stack
      setUndoStack(prev => [...prev, {
        action: 'move',
        appointment: draggedAppointment.originalData,
        newData: updatedAppointment,
        timestamp: new Date()
      }]);

      // Update appointment
      const response = await apiService.updateAppointment(draggedAppointment.id, updatedAppointment, token);
      
      if (response.success) {
        toast({
          title: "Cita movida",
          description: "La cita ha sido reubicada exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        loadAppointments();
      } else {
        throw new Error(response.error || 'Error al mover la cita');
      }
    } catch (error) {
      console.error('Error moving appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo mover la cita",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      handleDragEnd();
    }
  };

  const handleBulkAction = async (action, appointmentIds) => {
    try {
      const actions = {
        'confirm': () => Promise.all(appointmentIds.map(id => 
          apiService.updateAppointment(id, { status: 'CONFIRMED' }, token)
        )),
        'cancel': () => Promise.all(appointmentIds.map(id => 
          apiService.updateAppointment(id, { status: 'CANCELLED' }, token)
        )),
        'complete': () => Promise.all(appointmentIds.map(id => 
          apiService.updateAppointment(id, { status: 'COMPLETED' }, token)
        )),
        'delete': () => Promise.all(appointmentIds.map(id => 
          apiService.deleteAppointment(id, token)
        ))
      };

      const results = await actions[action]();
      const successCount = results.filter(r => r.success).length;

      toast({
        title: "Acción masiva completada",
        description: `${successCount} de ${appointmentIds.length} citas procesadas`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setSelectedAppointments([]);
      setShowBulkActions(false);
      loadAppointments();
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast({
        title: "Error",
        description: "No se pudieron procesar todas las citas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));

    // Revert the action
    if (lastAction.action === 'move') {
      // Move back to original position
      apiService.updateAppointment(lastAction.appointment.id, lastAction.appointment, token)
        .then(() => loadAppointments());
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const action = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, action]);
    setRedoStack(prev => prev.slice(0, -1));

    // Apply the action again
    if (action.action === 'move') {
      apiService.updateAppointment(action.newData.id, action.newData, token)
        .then(() => loadAppointments());
    }
  };

  const handleAppointmentSelect = (appointmentId, isSelected) => {
    if (isSelected) {
      setSelectedAppointments(prev => [...prev, appointmentId]);
    } else {
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
    }
  };

  const handleSelectAll = () => {
    if (selectedAppointments.length === appointmentsData.appointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(appointmentsData.appointments.map(apt => apt.id));
    }
  };

  // Load appointments stats (legacy)
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
    loadRealtimeStats(); // Load real-time stats
    
    // Detectar tipo de usuario si no está disponible
    if (!userDetection) {
      detectUserType();
    }
  }, [loadAppointments, loadStats, loadRealtimeStats, userDetection, detectUserType]);

  // Update calendar events when appointments change
  useEffect(() => {
    if (appointmentsData.appointments) {
      const events = convertAppointmentsToEvents(appointmentsData.appointments);
      setCalendarEvents(events);
    }
  }, [appointmentsData.appointments, convertAppointmentsToEvents]);

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

        {/* Smart Filters Section */}
        <Card mb={4}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Heading size="md">Filtros Inteligentes</Heading>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdFilterList} />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
                {activeFilters.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Icon as={MdClear} />}
                    onClick={clearAllFilters}
                    colorScheme="red"
                  >
                    Limpiar Todo ({activeFilters.length})
                  </Button>
                )}
              </HStack>
              <HStack spacing={2}>
                <Menu>
                  <MenuButton as={Button} size="sm" variant="outline" leftIcon={<Icon as={MdSort} />}>
                    Ordenar
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => { setSortBy('date'); setSortOrder('asc'); }}>
                      Fecha (Ascendente)
                    </MenuItem>
                    <MenuItem onClick={() => { setSortBy('date'); setSortOrder('desc'); }}>
                      Fecha (Descendente)
                    </MenuItem>
                    <MenuItem onClick={() => { setSortBy('status'); setSortOrder('asc'); }}>
                      Estado (A-Z)
                    </MenuItem>
                    <MenuItem onClick={() => { setSortBy('priority'); setSortOrder('desc'); }}>
                      Prioridad (Alta-Baja)
                    </MenuItem>
                  </MenuList>
                </Menu>
                <Menu>
                  <MenuButton as={Button} size="sm" variant="outline" leftIcon={<Icon as={MdViewList} />}>
                    Vista
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setViewMode('table')} leftIcon={<Icon as={MdViewList} />}>
                      Tabla
                    </MenuItem>
                    <MenuItem onClick={() => setViewMode('calendar')} leftIcon={<Icon as={MdCalendarToday} />}>
                      Calendario
                    </MenuItem>
                    <MenuItem onClick={() => setViewMode('grid')} leftIcon={<Icon as={MdGridView} />}>
                      Cuadrícula
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </CardHeader>
          
          {/* Active Filters Tags */}
          {activeFilters.length > 0 && (
            <CardBody pt={0}>
              <Wrap spacing={2}>
                {activeFilters.map((filter, index) => (
                  <WrapItem key={`active-filter-${filter.key}-${index}`}>
                    <Tag colorScheme="blue" size="md">
                      <TagLabel>{filter.label}</TagLabel>
                      <TagCloseButton onClick={() => clearFilter(filter.key)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </CardBody>
          )}

          {/* Collapsible Filters */}
          <Collapse in={showFilters}>
            <CardBody pt={0}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                {/* Search Input */}
                <FormControl>
                  <FormLabel fontSize="sm">Búsqueda</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={MdSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Buscar por paciente, doctor, número..."
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                {/* Status Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Estado</FormLabel>
                  <Select
                    placeholder="Todos los estados"
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                    <option value="NO_SHOW">No Asistió</option>
                  </Select>
                </FormControl>

                {/* Priority Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Prioridad</FormLabel>
                  <Select
                    placeholder="Todas las prioridades"
                    value={filters.priority}
                    onChange={(e) => updateFilter('priority', e.target.value)}
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </Select>
                </FormControl>

                {/* Date From */}
                <FormControl>
                  <FormLabel fontSize="sm">Fecha Desde</FormLabel>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  />
                </FormControl>

                {/* Date To */}
                <FormControl>
                  <FormLabel fontSize="sm">Fecha Hasta</FormLabel>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                  />
                </FormControl>

                {/* Appointment Type */}
                <FormControl>
                  <FormLabel fontSize="sm">Tipo de Cita</FormLabel>
                  <Select
                    placeholder="Todos los tipos"
                    value={filters.appointmentType}
                    onChange={(e) => updateFilter('appointmentType', e.target.value)}
                  >
                    <option value="consultation">Consulta</option>
                    <option value="follow_up">Seguimiento</option>
                    <option value="emergency">Emergencia</option>
                    <option value="checkup">Chequeo</option>
                  </Select>
                </FormControl>

                {/* Telemedicine Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Modalidad</FormLabel>
                  <Select
                    placeholder="Todas las modalidades"
                    value={filters.isTelemedicine === null ? '' : filters.isTelemedicine.toString()}
                    onChange={(e) => updateFilter('isTelemedicine', e.target.value === '' ? null : e.target.value === 'true')}
                  >
                    <option value="true">Telemedicina</option>
                    <option value="false">Presencial</option>
                  </Select>
                </FormControl>
              </Grid>

              {/* Filter Actions */}
              <Flex justify="space-between" align="center" mt={4}>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<Icon as={MdSave} />}
                    onClick={() => {
                      const name = prompt('Nombre del filtro:');
                      if (name) saveFilter(name);
                    }}
                  >
                    Guardar Filtro
                  </Button>
                  {savedFilters.length > 0 && (
                    <Menu>
                      <MenuButton as={Button} size="sm" variant="outline" leftIcon={<Icon as={MdSettings} />}>
                        Filtros Guardados
                      </MenuButton>
                      <MenuList>
                        {savedFilters.map((filter) => (
                          <MenuItem key={`saved-filter-${filter.id}`} onClick={() => loadSavedFilter(filter)}>
                            {filter.name}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => loadAppointments()}
                  leftIcon={<Icon as={MdRefresh} />}
                >
                  Aplicar Filtros
                </Button>
              </Flex>
            </CardBody>
          </Collapse>
        </Card>

        {/* Advanced Management Controls */}
        <Card mb={4}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Gestión Avanzada</Heading>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdUndo} />}
                  onClick={handleUndo}
                  isDisabled={undoStack.length === 0}
                >
                  Deshacer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdRedo} />}
                  onClick={handleRedo}
                  isDisabled={redoStack.length === 0}
                >
                  Rehacer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={showFullscreen ? MdFullscreenExit : MdFullscreen} />}
                  onClick={() => setShowFullscreen(!showFullscreen)}
                >
                  {showFullscreen ? 'Salir' : 'Pantalla Completa'}
                </Button>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody>
            {/* View Controls */}
            <HStack spacing={4} mb={4}>
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="medium">Vista:</Text>
                <ButtonGroup size="sm" isAttached>
                  <Button
                    leftIcon={<Icon as={MdViewList} />}
                    variant={viewMode === 'table' ? 'solid' : 'outline'}
                    onClick={() => setViewMode('table')}
                  >
                    Tabla
                  </Button>
                  <Button
                    leftIcon={<Icon as={MdCalendarToday} />}
                    variant={viewMode === 'calendar' ? 'solid' : 'outline'}
                    onClick={() => setViewMode('calendar')}
                  >
                    Calendario
                  </Button>
                  <Button
                    leftIcon={<Icon as={MdGridView} />}
                    variant={viewMode === 'grid' ? 'solid' : 'outline'}
                    onClick={() => setViewMode('grid')}
                  >
                    Cuadrícula
                  </Button>
                </ButtonGroup>
              </HStack>

              {viewMode === 'calendar' && (
                <HStack spacing={2}>
                  <Text fontSize="sm" fontWeight="medium">Calendario:</Text>
                  <ButtonGroup size="sm" isAttached>
                    <Button
                      leftIcon={<Icon as={MdViewDay} />}
                      variant={calendarView === 'day' ? 'solid' : 'outline'}
                      onClick={() => setCalendarView('day')}
                    >
                      Día
                    </Button>
                    <Button
                      leftIcon={<Icon as={MdViewWeek} />}
                      variant={calendarView === 'week' ? 'solid' : 'outline'}
                      onClick={() => setCalendarView('week')}
                    >
                      Semana
                    </Button>
                    <Button
                      leftIcon={<Icon as={MdCalendarViewMonth} />}
                      variant={calendarView === 'month' ? 'solid' : 'outline'}
                      onClick={() => setCalendarView('month')}
                    >
                      Mes
                    </Button>
                  </ButtonGroup>
                </HStack>
              )}

              <Spacer />

              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdZoomOut} />}
                  onClick={() => setCalendarZoom(Math.max(0.5, calendarZoom - 0.1))}
                >
                  -
                </Button>
                <Text fontSize="sm" minW="50px" textAlign="center">
                  {Math.round(calendarZoom * 100)}%
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdZoomIn} />}
                  onClick={() => setCalendarZoom(Math.min(2, calendarZoom + 0.1))}
                >
                  +
                </Button>
              </HStack>
            </HStack>

            {/* Bulk Actions */}
            {selectedAppointments.length > 0 && (
              <ScaleFade in={true}>
                <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <Flex justify="space-between" align="center">
                    <HStack spacing={4}>
                      <Text fontSize="sm" fontWeight="medium" color="blue.700">
                        {selectedAppointments.length} citas seleccionadas
                      </Text>
                      <ButtonGroup size="sm">
                        <Button
                          leftIcon={<Icon as={MdCheckCircle} />}
                          colorScheme="green"
                          onClick={() => handleBulkAction('confirm', selectedAppointments)}
                        >
                          Confirmar
                        </Button>
                        <Button
                          leftIcon={<Icon as={MdCancel} />}
                          colorScheme="red"
                          onClick={() => handleBulkAction('cancel', selectedAppointments)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          leftIcon={<Icon as={MdCheckCircle} />}
                          colorScheme="blue"
                          onClick={() => handleBulkAction('complete', selectedAppointments)}
                        >
                          Completar
                        </Button>
                        <Button
                          leftIcon={<Icon as={MdDelete} />}
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleBulkAction('delete', selectedAppointments)}
                        >
                          Eliminar
                        </Button>
                      </ButtonGroup>
                    </HStack>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Icon as={MdClose} />}
                      onClick={() => setSelectedAppointments([])}
                    >
                      Cancelar
                    </Button>
                  </Flex>
                </Box>
              </ScaleFade>
            )}

            {/* Action Buttons */}
            <Flex justify="space-between" align="center" mt={4}>
              <HStack spacing={4}>
                <Button
                  leftIcon={<Icon as={MdAdd} />}
                  colorScheme="blue"
                  onClick={onBookingOpen}
                  size="sm"
                >
                  Nueva Cita
                </Button>
                <Button
                  leftIcon={<Icon as={MdRefresh} />}
                  onClick={() => loadAppointments()}
                  isLoading={appointmentsData.loading}
                  size="sm"
                >
                  Actualizar
                </Button>
                <Button
                  leftIcon={<Icon as={MdDownload} />}
                  variant="outline"
                  size="sm"
                >
                  Exportar
                </Button>
                <Button
                  leftIcon={<Icon as={MdContentCopy} />}
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedAppointments.length === appointmentsData.appointments.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </Button>
              </HStack>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdPrint} />}
                >
                  Imprimir
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Real-time Dashboard */}
        <Card mb={4}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <Heading size="md">Dashboard en Tiempo Real</Heading>
                <HStack spacing={2}>
                  <Switch
                    isChecked={isRealtimeEnabled}
                    onChange={(e) => setIsRealtimeEnabled(e.target.checked)}
                    size="sm"
                  />
                  <Text fontSize="sm" color={textColorSecondary}>
                    Tiempo Real
                  </Text>
                </HStack>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="xs" color={textColorSecondary}>
                  Última actualización: {realtimeStats.lastUpdated ? 
                    realtimeStats.lastUpdated.toLocaleTimeString() : 'N/A'}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Icon as={MdRefresh} />}
                  onClick={loadRealtimeStats}
                  isLoading={appointmentsData.loading}
                >
                  Actualizar
                </Button>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody>
            {/* Main Stats Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
              <Card bg="blue.50" borderColor="blue.200">
            <CardBody>
              <Stat>
                    <StatLabel fontSize="sm" color="blue.600">Total Citas</StatLabel>
                    <StatNumber fontSize="2xl" color="blue.700">
                      {realtimeStats.totalAppointments}
                    </StatNumber>
                <StatHelpText>
                      <StatArrow 
                        type={realtimeStats.trends.appointments.direction === 'up' ? 'increase' : 'decrease'} 
                        color={realtimeStats.trends.appointments.direction === 'up' ? 'green.500' : 'red.500'}
                      />
                      {Math.abs(realtimeStats.trends.appointments.change)}% vs ayer
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

              <Card bg="green.50" borderColor="green.200">
            <CardBody>
              <Stat>
                    <StatLabel fontSize="sm" color="green.600">Citas Hoy</StatLabel>
                    <StatNumber fontSize="2xl" color="green.700">
                      {realtimeStats.todayAppointments}
                    </StatNumber>
                <StatHelpText>
                      <StatArrow type="increase" color="green.500" />
                      {realtimeStats.completedToday} completadas
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

              <Card bg="red.50" borderColor="red.200">
            <CardBody>
              <Stat>
                    <StatLabel fontSize="sm" color="red.600">Urgentes</StatLabel>
                    <StatNumber fontSize="2xl" color="red.700">
                      {realtimeStats.urgentAppointments}
                    </StatNumber>
                <StatHelpText>
                      <StatArrow type="decrease" color="red.500" />
                      Requieren atención
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

              <Card bg="purple.50" borderColor="purple.200">
            <CardBody>
              <Stat>
                    <StatLabel fontSize="sm" color="purple.600">Telemedicina</StatLabel>
                    <StatNumber fontSize="2xl" color="purple.700">
                      {realtimeStats.telemedicineCount}
                    </StatNumber>
                <StatHelpText>
                      <StatArrow type="increase" color="purple.500" />
                      Consultas virtuales
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

            {/* Performance Metrics */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={MdAttachMoney} color="green.500" boxSize={6} />
                    <Text fontSize="sm" color={textColorSecondary}>Ingresos</Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    ${realtimeStats.revenue.toLocaleString()}
                  </Text>
                  <HStack>
                    <Icon 
                      as={realtimeStats.trends.revenue.direction === 'up' ? MdTrendingUp : MdTrendingDown} 
                      color={realtimeStats.trends.revenue.direction === 'up' ? 'green.500' : 'red.500'}
                      boxSize={4}
                    />
                    <Text fontSize="sm" color={textColorSecondary}>
                      {Math.abs(realtimeStats.trends.revenue.change)}% vs ayer
                    </Text>
                  </HStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={MdSpeed} color="blue.500" boxSize={6} />
                    <Text fontSize="sm" color={textColorSecondary}>Eficiencia</Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    {realtimeStats.trends.efficiency.value}%
                  </Text>
                  <HStack>
                    <Icon 
                      as={realtimeStats.trends.efficiency.direction === 'up' ? MdTrendingUp : MdTrendingDown} 
                      color={realtimeStats.trends.efficiency.direction === 'up' ? 'green.500' : 'red.500'}
                      boxSize={4}
                    />
                    <Text fontSize="sm" color={textColorSecondary}>
                      {Math.abs(realtimeStats.trends.efficiency.change)}% vs ayer
                    </Text>
                  </HStack>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={MdAccessTime} color="orange.500" boxSize={6} />
                    <Text fontSize="sm" color={textColorSecondary}>Tiempo Promedio</Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    {realtimeStats.averageWaitTime} min
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    Tiempo de espera
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={2}>
                    <Icon as={MdMonitorHeart} color="pink.500" boxSize={6} />
                    <Text fontSize="sm" color={textColorSecondary}>Satisfacción</Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    {realtimeStats.trends.satisfaction.value}%
                  </Text>
                  <HStack>
                    <Icon 
                      as={realtimeStats.trends.satisfaction.direction === 'up' ? MdTrendingUp : MdTrendingDown} 
                      color={realtimeStats.trends.satisfaction.direction === 'up' ? 'green.500' : 'red.500'}
                      boxSize={4}
                    />
                    <Text fontSize="sm" color={textColorSecondary}>
                      {Math.abs(realtimeStats.trends.satisfaction.change)}% vs ayer
                    </Text>
                  </HStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <Box>
                <Heading size="sm" mb={4} color={textColor}>
                  Alertas del Sistema
                </Heading>
                <VStack spacing={3} align="stretch">
                  {alerts.map((alert, index) => (
                    <ScaleFade key={`alert-${alert.id}-${index}`} in={true} initialScale={0.9}>
                      <Alert 
                        status={alert.type} 
                        borderRadius="md"
                        variant="left-accent"
                      >
                        <Icon as={alert.icon} boxSize={5} />
                        <Box ml={3}>
                          <AlertTitle fontSize="sm">{alert.title}</AlertTitle>
                          <AlertDescription fontSize="sm">
                            {alert.message}
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </ScaleFade>
                  ))}
                </VStack>
              </Box>
            )}
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
            ) : viewMode === 'calendar' ? (
              /* Calendar View */
              <Box>
                <CalendarView 
                  events={calendarEvents}
                  view={calendarView}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onEventClick={onDetailsOpen}
                  onEventDrag={handleDragStart}
                  onEventDrop={handleDrop}
                  zoom={calendarZoom}
                  isFullscreen={showFullscreen}
                />
              </Box>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={onDetailsOpen}
                    onDelete={onDeleteOpen}
                    onView={onDetailsOpen}
                    isSelected={selectedAppointments.includes(appointment.id)}
                    onSelect={(isSelected) => handleAppointmentSelect(appointment.id, isSelected)}
                    onDragStart={() => handleDragStart(convertAppointmentsToEvents([appointment])[0])}
                    isDragging={isDragging}
                  />
                ))}
              </SimpleGrid>
            ) : (
              /* Table View */
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
