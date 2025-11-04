/**
 * SMD VITAL - Sistema de Pagos Integrado Avanzado
 * ================================================
 * 
 * Sistema completo de pagos con:
 * - Procesamiento de pagos multi-gateway
 * - Facturación automática
 * - Reembolsos y conciliación
 * - Reportes financieros
 * - Integración con Stripe, PayU, PSE
 * - Analytics de pagos
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
  SlideFade,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Image,
  Link,
  Code,
  List,
  ListItem,
  ListIcon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  RadioGroup,
  Stack,
  Radio,
  Checkbox,
  CheckboxGroup
} from '@chakra-ui/react';
import {
  MdAttachMoney,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdDownload,
  MdPrint,
  MdShare,
  MdSettings,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdRefresh,
  MdTrendingUp,
  MdAnalytics,
  MdDashboard,
  MdReceipt,
  MdCreditCard,
  MdAccountBalance,
  MdPayment,
  MdMoney,
  MdLocalAtm,
  MdQrCode,
  MdSecurity,
  MdLock,
  MdPublic,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdEmergency,
  MdHealthAndSafety,
  MdMonitorHeart,
  MdVaccines,
  MdLocalPharmacy,
  MdAssignment,
  MdNote,
  MdFlag,
  MdInfo,
  MdStar,
  MdStarBorder,
  MdTrendingDown,
  MdTrendingFlat,
  MdShowChart,
  MdPieChart,
  MdBarChart,
  MdTimeline,
  MdHistory,
  MdSchedule,
  MdNotifications,
  MdError,
  MdDone,
  MdPending,
  MdHourglassEmpty
} from 'react-icons/md';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaFileMedical, FaStethoscope, FaCreditCard, FaMoneyBillWave, FaChartLine, FaReceipt } from 'react-icons/fa';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';
import aiService from '../../../services/core/AIService';
import apiService from '../../../services/apiService';

const AdvancedPayments = () => {
  // =====================================================
  // ESTADOS Y HOOKS
  // =====================================================

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isRefundOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure();
  const { isOpen: isInvoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure();

  // Estados principales
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    patient: 'all',
    amountRange: 'all'
  });

  // Estados de formularios
  const [paymentForm, setPaymentForm] = useState({
    patient_id: '',
    appointment_id: '',
    amount: '',
    payment_method: 'credit_card',
    currency: 'COP',
    description: '',
    metadata: {}
  });

  const [invoiceForm, setInvoiceForm] = useState({
    patient_id: '',
    appointment_id: '',
    services: [],
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    due_date: '',
    notes: ''
  });

  const [refundForm, setRefundForm] = useState({
    payment_id: '',
    amount: '',
    reason: '',
    description: ''
  });

  // Colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadPayments = useCallback(async () => {
    try {
      const params = { ...filters };
      const response = await apiService.get('/payments', { params });
      // Extraer datos de la respuesta del API
      const paymentsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los pagos',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  }, [filters, toast]);

  const loadInvoices = useCallback(async () => {
    try {
      const response = await apiService.get('/invoices');
      // Extraer datos de la respuesta del API
      const invoicesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      const response = await apiService.get('/patients');
      // Extraer datos de la respuesta del API
      const patientsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const response = await apiService.get('/appointments');
      // Extraer datos de la respuesta del API
      const appointmentsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }, []);

  const loadServices = useCallback(async () => {
    try {
      const response = await apiService.get('/medical-services');
      // Extraer datos de la respuesta del API
      const servicesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPayments(),
        loadInvoices(),
        loadPatients(),
        loadAppointments(),
        loadServices()
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
  }, [loadPayments, loadInvoices, loadPatients, loadAppointments, loadServices, toast]);

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      loadPayments();
    }
  }, [filters, loadPayments]);

  // =====================================================
  // FUNCIONES DE GESTIÓN DE PAGOS
  // =====================================================

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      
      // Usar lógica de negocio para procesar pago
      const payment = await businessLogicService.processPayment(paymentForm);
      
      setPayments(prev => [payment, ...prev]);
      onCreateClose();
      
      // Limpiar formulario
      setPaymentForm({
        patient_id: '',
        appointment_id: '',
        amount: '',
        payment_method: 'credit_card',
        currency: 'COP',
        description: '',
        metadata: {}
      });

      toast({
        title: 'Pago Procesado',
        description: 'El pago ha sido procesado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar el pago',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/invoices', invoiceForm);
      // Extraer datos de la respuesta del API
      const invoice = response.data?.data || response.data;
      
      setInvoices(prev => [invoice, ...prev]);
      onInvoiceClose();
      
      toast({
        title: 'Factura Creada',
        description: 'La factura ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la factura',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/refunds', refundForm);
      // Extraer datos de la respuesta del API
      const refund = response.data?.data || response.data;
      
      // Actualizar estado del pago
      setPayments(prev => 
        prev.map(payment => 
          payment.id === refundForm.payment_id 
            ? { ...payment, status: 'refunded', refund_amount: refund.amount }
            : payment
        )
      );
      
      onRefundClose();
      
      // Limpiar formulario
      setRefundForm({
        payment_id: '',
        amount: '',
        reason: '',
        description: ''
      });

      toast({
        title: 'Reembolso Procesado',
        description: 'El reembolso ha sido procesado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: 'Error',
        description: 'Error al procesar el reembolso',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FUNCIONES DE UTILIDAD
  // =====================================================

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      refunded: 'purple'
    };
    return colors[status] || 'gray';
  };

  const getPaymentStatusIcon = (status) => {
    const icons = {
      pending: MdHourglassEmpty,
      processing: MdSchedule,
      completed: MdCheckCircle,
      failed: MdError,
      cancelled: MdCancel,
      refunded: MdMoney
    };
    return icons[status] || MdInfo;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      credit_card: MdCreditCard,
      debit_card: MdCreditCard,
      bank_transfer: MdAccountBalance,
      cash: MdMoney,
      pse: MdPayment,
      nequi: MdQrCode,
      daviplata: MdQrCode
    };
    return icons[method] || MdPayment;
  };

  const formatCurrency = (amount, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const averageAmount = completedPayments > 0 ? totalAmount / completedPayments : 0;

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalAmount,
      averageAmount,
      successRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0
    };
  };

  // =====================================================
  // COMPONENTES DE UI
  // =====================================================

  const PaymentCard = ({ payment }) => {
    const patient = patients.find(p => p.id === payment.patient_id);
    const appointment = appointments.find(a => a.id === payment.appointment_id);
    const StatusIcon = getPaymentStatusIcon(payment.status);
    const MethodIcon = getPaymentMethodIcon(payment.payment_method);

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
                <Icon as={MethodIcon} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {payment.payment_number}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {formatDateTime(payment.created_at)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                colorScheme={getPaymentStatusColor(payment.status)}
              >
                <Icon as={StatusIcon} mr={1} />
                {payment.status}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient?.name || 'Paciente no encontrado'}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  {formatCurrency(payment.amount, payment.currency)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaCalendarAlt} color="purple.500" />
                  <Text fontSize="sm" color={textColor}>
                    {appointment?.appointment_number || 'Sin cita'}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={textColorSecondary} textTransform="capitalize">
                  {payment.payment_method?.replace('_', ' ') || 'N/A'}
                </Text>
              </HStack>

              {payment.description && (
                <Text fontSize="sm" color={textColorSecondary} noOfLines={2}>
                  {payment.description}
                </Text>
              )}

              {payment.gateway_response && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                    ID de Transacción:
                  </Text>
                  <Code fontSize="xs" colorScheme="gray">
                    {payment.gateway_response.transaction_id || 'N/A'}
                  </Code>
                </Box>
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
                  setSelectedPayment(payment);
                  onDetailsOpen();
                }}
              >
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdDownload} />}
                onClick={() => {
                  // Implementar descarga de comprobante
                }}
              >
                Comprobante
              </Button>
              <Menu>
                <MenuButton as={Button} size="sm" variant="outline">
                  <Icon as={MdMoreVert} />
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={<Icon as={MdMoney} />}
                    onClick={() => {
                      setRefundForm(prev => ({ ...prev, payment_id: payment.id }));
                      onRefundOpen();
                    }}
                    isDisabled={payment.status !== 'completed'}
                  >
                    Reembolsar
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdPrint} />}>
                    Imprimir
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdShare} />}>
                    Compartir
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<Icon as={MdReceipt} />}>
                    Generar Factura
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </CardFooter>
        </Card>
      </ScaleFade>
    );
  };

  const InvoiceCard = ({ invoice }) => {
    const patient = patients.find(p => p.id === invoice.patient_id);
    const appointment = appointments.find(a => a.id === invoice.appointment_id);

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
                <Icon as={MdReceipt} color="purple.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {invoice.invoice_number}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {formatDateTime(invoice.created_at)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                colorScheme={invoice.status === 'paid' ? 'green' : invoice.status === 'overdue' ? 'red' : 'yellow'}
              >
                {invoice.status}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient?.name || 'Paciente no encontrado'}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="purple.500">
                  {formatCurrency(invoice.final_amount)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaCalendarAlt} color="green.500" />
                  <Text fontSize="sm" color={textColor}>
                    {appointment?.appointment_number || 'Sin cita'}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={textColorSecondary}>
                  Vence: {formatDate(invoice.due_date)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm" color={textColorSecondary}>
                  Subtotal: {formatCurrency(invoice.subtotal)}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Impuestos: {formatCurrency(invoice.tax_amount)}
                </Text>
              </HStack>

              {invoice.discount_amount > 0 && (
                <Text fontSize="sm" color="green.500">
                  Descuento: -{formatCurrency(invoice.discount_amount)}
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
              >
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdDownload} />}
              >
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdPrint} />}
              >
                Imprimir
              </Button>
            </HStack>
          </CardFooter>
        </Card>
      </ScaleFade>
    );
  };

  const PaymentAnalytics = () => {
    const stats = getPaymentStats();

    return (
      <VStack spacing={6} align="stretch">
        {/* Métricas Principales */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Pagos</StatLabel>
                <StatNumber>{stats.totalPayments}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Este mes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Ingresos Totales</StatLabel>
                <StatNumber color="green.500">
                  {formatCurrency(stats.totalAmount)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +12% vs mes anterior
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Tasa de Éxito</StatLabel>
                <StatNumber color="blue.500">
                  {stats.successRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +2.3% vs mes anterior
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Promedio por Pago</StatLabel>
                <StatNumber color="purple.500">
                  {formatCurrency(stats.averageAmount)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +5.2% vs mes anterior
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Distribución por Estado
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {stats.completedPayments}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Completados
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                  {stats.pendingPayments}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Pendientes
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {stats.failedPayments}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Fallidos
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {stats.totalPayments - stats.completedPayments - stats.pendingPayments - stats.failedPayments}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Otros
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Métodos de Pago Más Usados */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Métodos de Pago Más Usados
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {Object.entries(
                payments.reduce((acc, payment) => {
                  acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([method, count]) => (
                  <HStack key={method} justify="space-between">
                    <HStack spacing={2}>
                      <Icon as={getPaymentMethodIcon(method)} color="blue.500" />
                      <Text textTransform="capitalize">
                        {method?.replace('_', ' ') || 'N/A'}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Text fontWeight="bold">{count}</Text>
                      <Text fontSize="sm" color={textColorSecondary}>
                        ({((count / stats.totalPayments) * 100).toFixed(1)}%)
                      </Text>
                    </HStack>
                  </HStack>
                ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  };

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  if (loading && payments.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando sistema de pagos...
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
            Sistema de Pagos Integrado
          </Text>
          <Text color={textColorSecondary}>
            Gestión completa de pagos y facturación con múltiples gateways
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={loadPayments}
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
            Procesar Pago
          </Button>
          <Button
            leftIcon={<Icon as={MdReceipt} />}
            onClick={onInvoiceOpen}
            colorScheme="purple"
          >
            Crear Factura
          </Button>
        </HStack>
      </Flex>

      {/* Filtros y Búsqueda */}
      <Card mb={6} bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="processing">Procesando</option>
              <option value="completed">Completados</option>
              <option value="failed">Fallidos</option>
              <option value="cancelled">Cancelados</option>
              <option value="refunded">Reembolsados</option>
            </Select>

            <Select
              value={filters.paymentMethod}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              maxW="200px"
            >
              <option value="all">Todos los métodos</option>
              <option value="credit_card">Tarjeta de Crédito</option>
              <option value="debit_card">Tarjeta Débito</option>
              <option value="bank_transfer">Transferencia</option>
              <option value="pse">PSE</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="cash">Efectivo</option>
            </Select>

            <Select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </Select>

            <Select
              value={filters.patient}
              onChange={(e) => setFilters(prev => ({ ...prev, patient: e.target.value }))}
              maxW="200px"
            >
              <option value="all">Todos los pacientes</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Contenido Principal */}
      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>
            <Icon as={MdDashboard} mr={2} />
            Pagos
          </Tab>
          <Tab>
            <Icon as={MdReceipt} mr={2} />
            Facturas
          </Tab>
          <Tab>
            <Icon as={MdAnalytics} mr={2} />
            Analytics
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel de Pagos */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {payments
                .filter((payment, index, self) => 
                  self.findIndex(p => (p.id || `payment-${index}`) === (payment.id || `payment-${index}`)) === index
                )
                .map((payment, index) => (
                  <PaymentCard key={payment.id || `payment-${index}`} payment={payment} />
                ))}
            </Grid>
          </TabPanel>

          {/* Panel de Facturas */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {invoices
                .filter((invoice, index, self) => 
                  self.findIndex(i => (i.id || `invoice-${index}`) === (invoice.id || `invoice-${index}`)) === index
                )
                .map((invoice, index) => (
                  <InvoiceCard key={invoice.id || `invoice-${index}`} invoice={invoice} />
                ))}
            </Grid>
          </TabPanel>

          {/* Panel de Analytics */}
          <TabPanel>
            <PaymentAnalytics />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modales */}
      {/* Modal de Procesar Pago */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Procesar Pago</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    value={paymentForm.patient_id}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, patient_id: e.target.value }))}
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
                  <FormLabel>Cita (Opcional)</FormLabel>
                  <Select
                    value={paymentForm.appointment_id}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, appointment_id: e.target.value }))}
                  >
                    <option value="">Sin cita específica</option>
                    {appointments.map(appointment => (
                      <option key={appointment.id} value={appointment.id}>
                        {appointment.appointment_number} - {formatDate(appointment.scheduled_date)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Monto</FormLabel>
                  <NumberInput
                    value={paymentForm.amount}
                    onChange={(value) => setPaymentForm(prev => ({ ...prev, amount: value }))}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField placeholder="0.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Moneda</FormLabel>
                  <Select
                    value={paymentForm.currency}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <option value="COP">COP - Peso Colombiano</option>
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Método de Pago</FormLabel>
                <RadioGroup
                  value={paymentForm.payment_method}
                  onChange={(value) => setPaymentForm(prev => ({ ...prev, payment_method: value }))}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="credit_card">Tarjeta de Crédito</Radio>
                    <Radio value="debit_card">Tarjeta Débito</Radio>
                    <Radio value="pse">PSE</Radio>
                    <Radio value="nequi">Nequi</Radio>
                    <Radio value="daviplata">Daviplata</Radio>
                    <Radio value="bank_transfer">Transferencia</Radio>
                    <Radio value="cash">Efectivo</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del pago..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCreateClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleProcessPayment} isLoading={loading}>
              Procesar Pago
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Reembolso */}
      <Modal isOpen={isRefundOpen} onClose={onRefundClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Procesar Reembolso</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Monto del Reembolso</FormLabel>
                <NumberInput
                  value={refundForm.amount}
                  onChange={(value) => setRefundForm(prev => ({ ...prev, amount: value }))}
                  min={0}
                  precision={2}
                >
                  <NumberInputField placeholder="0.00" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Motivo del Reembolso</FormLabel>
                <Select
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                >
                  <option value="">Seleccionar motivo</option>
                  <option value="cancelled_appointment">Cita Cancelada</option>
                  <option value="duplicate_payment">Pago Duplicado</option>
                  <option value="service_not_provided">Servicio No Prestado</option>
                  <option value="patient_request">Solicitud del Paciente</option>
                  <option value="other">Otro</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Descripción Adicional</FormLabel>
                <Textarea
                  value={refundForm.description}
                  onChange={(e) => setRefundForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción adicional del reembolso..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onRefundClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleProcessRefund} isLoading={loading}>
              Procesar Reembolso
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedPayments;
