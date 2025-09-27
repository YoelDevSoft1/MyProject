// Chakra imports
import {
  Box,
  Flex,
  Grid,
  useColorModeValue,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
// Assets
import { MdSearch, MdAdd, MdEdit, MdVisibility, MdReceipt, MdPayment, MdRefresh, MdDownload, MdFilterList } from "react-icons/md";
import { FaCreditCard, FaMoneyBillWave, FaUniversity, FaStripe } from "react-icons/fa";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";
import StripePaymentModal from "../../../components/payments/StripePaymentModal";

export default function Payments() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose } = useDisclosure();
  const { isOpen: isRefundModalOpen, onOpen: onRefundModalOpen, onClose: onRefundModalClose } = useDisclosure();
  const { isOpen: isStripeModalOpen, onOpen: onStripeModalOpen, onClose: onStripeModalClose } = useDisclosure();
  
  // State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    completedPayments: 0,
    totalPayments: 0,
    averagePayment: 0
  });
  
  // New Payment State
  const [newPayment, setNewPayment] = useState({
    patientId: "",
    amount: "",
    currency: "COP",
    method: "credit_card",
    description: "",
    appointmentId: ""
  });
  
  // Refund State
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  
  // Stripe Payment State
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const toast = useToast();
  const { user, token } = useAuth();

  // Load payments on component mount
  useEffect(() => {
    loadPayments();
  }, [currentPage, statusFilter, methodFilter, searchTerm]);

  // Load payments from API
  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        method: methodFilter,
        search: searchTerm
      };
      
      const response = await apiService.getPayments(token, params);
      const paymentsData = response.data || response || [];
      
      // Ensure payments is always an array
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setTotalPages(response.totalPages || 1);
      calculateStats(Array.isArray(paymentsData) ? paymentsData : []);
      
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Error cargando pagos: " + (err.message || "Error desconocido"));
      // Set empty array as fallback
      setPayments([]);
      setTotalPages(1);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate payment statistics
  const calculateStats = (paymentsData) => {
    // Ensure paymentsData is an array
    const safePaymentsData = Array.isArray(paymentsData) ? paymentsData : [];
    
    const completedPayments = safePaymentsData.filter(p => p.status === "completed");
    const pendingPayments = safePaymentsData.filter(p => p.status === "pending");
    
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const averagePayment = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;
    
    setStats({
      totalRevenue,
      pendingAmount,
      completedPayments: completedPayments.length,
      totalPayments: safePaymentsData.length,
      averagePayment
    });
  };

  // Create new payment
  const handleCreatePayment = async () => {
    try {
      setIsLoading(true);
      
      const paymentData = {
        ...newPayment,
        amount: parseFloat(newPayment.amount) * 100, // Convert to cents
        userId: user.id
      };
      
      const response = await apiService.createPayment(paymentData, token);
      
      toast({
        title: "Pago Creado",
        description: "El pago ha sido creado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setNewPayment({
        patientId: "",
        amount: "",
        currency: "COP",
        method: "credit_card",
        description: "",
        appointmentId: ""
      });
      
      onPaymentModalClose();
      loadPayments();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error creando pago: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment with Stripe
  const handleProcessPayment = async (paymentId) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.processPayment(paymentId, token);
      
      toast({
        title: "Pago Procesado",
        description: "El pago está siendo procesado",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      
      loadPayments();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error procesando pago: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process refund
  const handleRefund = async () => {
    try {
      setIsLoading(true);
      
      const refundData = {
        paymentId: selectedPayment.id,
        amount: parseFloat(refundAmount) * 100, // Convert to cents
        reason: refundReason
      };
      
      const response = await apiService.processRefund(refundData, token);
      
      toast({
        title: "Reembolso Procesado",
        description: "El reembolso ha sido procesado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      setRefundAmount("");
      setRefundReason("");
      onRefundModalClose();
      loadPayments();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error procesando reembolso: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export payments
  const handleExportPayments = async () => {
    try {
      const response = await apiService.exportPayments(token, {
        status: statusFilter,
        method: methodFilter,
        search: searchTerm,
        dateRange: dateRange
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pagos_smd_vital_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Exportación Exitosa",
        description: "Los pagos han sido exportados correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error exportando pagos: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "green";
      case "pending": return "yellow";
      case "failed": return "red";
      case "refunded": return "purple";
      default: return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Completado";
      case "pending": return "Pendiente";
      case "failed": return "Fallido";
      case "refunded": return "Reembolsado";
      default: return status;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "credit_card": return FaCreditCard;
      case "cash": return FaMoneyBillWave;
      case "bank_transfer": return FaUniversity;
      default: return MdPayment;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case "credit_card": return "Tarjeta de Crédito";
      case "cash": return "Efectivo";
      case "bank_transfer": return "Transferencia Bancaria";
      default: return method;
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    onOpen();
  };

  const handleRefundPayment = (payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount ? (payment.amount / 100).toString() : "0");
    onRefundModalOpen();
  };

  const handleStripePayment = (appointment) => {
    setSelectedAppointment(appointment);
    onStripeModalOpen();
  };

  const handleStripePaymentSuccess = (paymentData) => {
    toast({
      title: "Pago Exitoso",
      description: "El pago con Stripe ha sido procesado correctamente",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    loadPayments();
    onStripeModalClose();
  };

  // Filter payments based on search and filters
  const filteredPayments = Array.isArray(payments) ? payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    const matchesMethod = !methodFilter || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  }) : [];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Header */}
      <Flex 
        direction={{ base: "column", lg: "row" }} 
        justify="space-between" 
        align={{ base: "stretch", lg: "center" }} 
        mb="20px"
        gap={4}
      >
        <Box textAlign={{ base: "center", lg: "left" }}>
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            fontWeight="700" 
            color={textColor}
          >
            Pagos SMD VITAL
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color={textColorSecondary}
          >
            Gestiona los pagos y facturación SMD VITAL de tus pacientes
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button
            leftIcon={<Icon as={MdDownload} />}
            colorScheme="gray"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            onClick={handleExportPayments}
          >
            Exportar
          </Button>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            colorScheme="gray"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            onClick={loadPayments}
            isLoading={isLoading}
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="payment"
            size={{ base: "md", md: "lg" }}
            onClick={onPaymentModalOpen}
            width={{ base: "full", lg: "auto" }}
          >
            Nuevo Pago SMD VITAL
          </Button>
        </HStack>
      </Flex>

      {/* Estadísticas de Pagos */}
      <Grid 
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} 
        gap={{ base: "15px", md: "20px" }} 
        mb="20px"
      >
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Ingresos Totales
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {formatCurrency(stats.totalRevenue, "COP")}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              23.36%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Pagos Pendientes
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {formatCurrency(stats.pendingAmount, "COP")}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="decrease" />
              9.05%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Pagos Completados
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.completedPayments}/{stats.totalPayments}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <Progress 
                value={stats.totalPayments > 0 ? (stats.completedPayments/stats.totalPayments)*100 : 0} 
                colorScheme="green" 
                size={{ base: "xs", md: "sm" }} 
              />
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Promedio por Pago
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {formatCurrency(stats.averagePayment, "COP")}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              12.5%
            </StatHelpText>
          </Stat>
        </Box>
      </Grid>

      {/* Filtros y Búsqueda */}
      <Box
        bg={useColorModeValue("white", "navy.800")}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        mb="20px"
      >
        <Grid 
          templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }} 
          gap={{ base: "15px", md: "20px" }}
        >
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar pago SMD VITAL..." 
              size={{ base: "md", md: "lg" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select 
            placeholder="Filtrar por estado"
            size={{ base: "md", md: "lg" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
            <option value="refunded">Reembolsados</option>
          </Select>
          <Select 
            placeholder="Filtrar por método"
            size={{ base: "md", md: "lg" }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">Todos los métodos</option>
            <option value="credit_card">Tarjeta de Crédito</option>
            <option value="cash">Efectivo</option>
            <option value="bank_transfer">Transferencia Bancaria</option>
            <option value="stripe">Stripe</option>
          </Select>
        </Grid>
      </Box>

      {/* Tabla de Pagos */}
      <Box
        bg={useColorModeValue("white", "navy.800")}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        overflowX="auto"
      >
        <Table 
          variant="simple" 
          color={textColor}
          size={{ base: "sm", md: "md" }}
          minW="1000px"
        >
          <Thead>
            <Tr>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Paciente
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Monto
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                Método
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Fecha
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Estado
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                ID Transacción
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Acciones
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py="50px">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" />
                    <Text color={textColorSecondary}>Cargando pagos...</Text>
                  </VStack>
                </Td>
              </Tr>
            ) : error ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py="50px">
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                </Td>
              </Tr>
            ) : filteredPayments.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py="50px">
                  <VStack spacing={4}>
                    <Icon as={MdPayment} boxSize="50px" color={textColorSecondary} />
                    <Text color={textColorSecondary}>
                      {payments.length === 0 
                        ? "No hay pagos registrados. Crea el primer pago usando el botón 'Nuevo Pago SMD VITAL'"
                        : "No se encontraron pagos con los filtros aplicados"
                      }
                    </Text>
                    {payments.length === 0 && (
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={MdAdd} />}
                        onClick={onPaymentModalOpen}
                        size="sm"
                      >
                        Crear Primer Pago
                      </Button>
                    )}
                  </VStack>
                </Td>
              </Tr>
            ) : (
              filteredPayments.map((payment) => (
              <Tr key={payment.id}>
                <Td>
                  <VStack align="start" spacing="2px">
                    <Text 
                      fontWeight="600" 
                      color={textColor}
                      fontSize={{ base: "xs", md: "sm" }}
                      isTruncated
                      maxW="150px"
                    >
                      {payment.patient}
                    </Text>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      color={textColorSecondary}
                    >
                      ID: {payment.patientId}
                    </Text>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      color={textColorSecondary}
                      display={{ base: "block", md: "none" }}
                    >
                      {getMethodText(payment.method)}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                    <Text 
                      fontWeight="600" 
                      color={textColor}
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      {formatCurrency(payment.amount ? payment.amount / 100 : 0, payment.currency || "COP")}
                    </Text>
                </Td>
                <Td 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", md: "table-cell" }}
                >
                  <HStack>
                    <Icon as={getMethodIcon(payment.method)} color={textColor} />
                    <Text color={textColor}>
                      {getMethodText(payment.method)}
                    </Text>
                  </HStack>
                </Td>
                <Td 
                  color={textColor}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  {payment.date}
                </Td>
                <Td>
                  <Badge 
                    colorScheme={getStatusColor(payment.status)} 
                    variant="solid"
                    size={{ base: "sm", md: "md" }}
                  >
                    {getStatusText(payment.status)}
                  </Badge>
                </Td>
                <Td 
                  color={textColor}
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", lg: "table-cell" }}
                >
                  {payment.transactionId}
                </Td>
                <Td>
                  <HStack 
                    spacing={{ base: "5px", md: "10px" }}
                    justify="center"
                    wrap="wrap"
                  >
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdVisibility} />}
                      variant="outline"
                      onClick={() => handleViewPayment(payment)}
                    >
                      <Text display={{ base: "none", sm: "block" }}>Ver</Text>
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdReceipt} />}
                      variant="outline"
                      colorScheme="blue"
                    >
                      <Text display={{ base: "none", sm: "block" }}>Factura</Text>
                    </Button>
                    {payment.status === "completed" && (
                      <Button
                        size={{ base: "xs", md: "sm" }}
                        leftIcon={<Icon as={MdEdit} />}
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleRefundPayment(payment)}
                      >
                        <Text display={{ base: "none", sm: "block" }}>Reembolsar</Text>
                      </Button>
                    )}
                    {payment.status === "pending" && (
                      <Button
                        size={{ base: "xs", md: "sm" }}
                        leftIcon={<Icon as={FaStripe} />}
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => handleStripePayment({
                          patient: payment.patient,
                          doctor: payment.description?.split(' - ')[1] || 'Dr. Especialista',
                          date: payment.date,
                          amount: payment.amount ? payment.amount / 100 : 0,
                          patientId: payment.patientId,
                          appointmentId: payment.appointmentId || payment.id
                        })}
                      >
                        <Text display={{ base: "none", sm: "block" }}>Stripe</Text>
                      </Button>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Detalles del Pago */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "xl", lg: "2xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Detalles del Pago
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedPayment && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                <Grid 
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                  gap={{ base: "15px", md: "20px" }}
                >
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Paciente</FormLabel>
                    <Input 
                      value={selectedPayment.patient} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                    <Input 
                      value={selectedPayment.patientId} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Monto</FormLabel>
                    <Input 
                      value={formatCurrency(selectedPayment.amount, selectedPayment.currency)} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Método de Pago</FormLabel>
                    <Input 
                      value={getMethodText(selectedPayment.method)} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Fecha</FormLabel>
                    <Input 
                      value={selectedPayment.date} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Estado</FormLabel>
                    <Input 
                      value={getStatusText(selectedPayment.status)} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>ID de Transacción</FormLabel>
                    <Input 
                      value={selectedPayment.transactionId} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Número de Factura</FormLabel>
                    <Input 
                      value={selectedPayment.invoice} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                </Grid>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Descripción</FormLabel>
                  <Textarea 
                    value={selectedPayment.description} 
                    isReadOnly 
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <HStack 
                  spacing={{ base: "5px", md: "10px" }} 
                  justify="center"
                  wrap="wrap"
                >
                  <Button 
                    colorScheme="green" 
                    leftIcon={<Icon as={MdReceipt} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Generar Factura
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<Icon as={MdPayment} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Procesar Pago
                  </Button>
                  <Button 
                    colorScheme="red" 
                    leftIcon={<Icon as={MdEdit} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Reembolsar
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para Crear Nuevo Pago */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={onPaymentModalClose} 
        size={{ base: "full", md: "xl", lg: "2xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Crear Nuevo Pago SMD VITAL
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
              <Grid 
                templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                gap={{ base: "15px", md: "20px" }}
              >
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                  <Input 
                    value={newPayment.patientId}
                    onChange={(e) => setNewPayment({...newPayment, patientId: e.target.value})}
                    placeholder="SMD001"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID de Cita</FormLabel>
                  <Input 
                    value={newPayment.appointmentId}
                    onChange={(e) => setNewPayment({...newPayment, appointmentId: e.target.value})}
                    placeholder="APT001"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Monto</FormLabel>
                  <NumberInput
                    value={newPayment.amount}
                    onChange={(valueString, valueNumber) => setNewPayment({...newPayment, amount: valueString})}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField placeholder="150000" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Moneda</FormLabel>
                  <Select 
                    value={newPayment.currency}
                    onChange={(e) => setNewPayment({...newPayment, currency: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Método de Pago</FormLabel>
                  <Select 
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="cash">Efectivo</option>
                    <option value="bank_transfer">Transferencia Bancaria</option>
                    <option value="stripe">Stripe</option>
                  </Select>
                </FormControl>
              </Grid>
              <FormControl>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>Descripción</FormLabel>
                <Textarea 
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                  placeholder="Consulta general SMD VITAL - Dr. Carlos López"
                  size={{ base: "sm", md: "md" }}
                  minH={{ base: "80px", md: "100px" }}
                />
              </FormControl>
              <HStack 
                spacing={{ base: "5px", md: "10px" }} 
                justify="center"
                wrap="wrap"
              >
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Icon as={MdPayment} />}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "full", sm: "auto" }}
                  onClick={handleCreatePayment}
                  isLoading={isLoading}
                >
                  Crear Pago
                </Button>
                <Button 
                  colorScheme="gray" 
                  variant="outline"
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "full", sm: "auto" }}
                  onClick={onPaymentModalClose}
                >
                  Cancelar
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para Reembolso */}
      <Modal 
        isOpen={isRefundModalOpen} 
        onClose={onRefundModalClose} 
        size={{ base: "full", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Procesar Reembolso
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedPayment && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                <Alert status="warning">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Estás a punto de procesar un reembolso para el pago de {selectedPayment.patient}
                  </Text>
                </Alert>
                
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Monto a Reembolsar</FormLabel>
                  <NumberInput
                    value={refundAmount}
                    onChange={(valueString, valueNumber) => setRefundAmount(valueString)}
                    min={0}
                    max={selectedPayment.amount ? selectedPayment.amount / 100 : 0}
                    precision={2}
                  >
                    <NumberInputField placeholder="0.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Monto máximo: {formatCurrency(selectedPayment.amount ? selectedPayment.amount / 100 : 0, selectedPayment.currency || "COP")}
                  </Text>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Razón del Reembolso</FormLabel>
                  <Select 
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="">Seleccionar razón</option>
                    <option value="duplicate">Pago duplicado</option>
                    <option value="fraudulent">Transacción fraudulenta</option>
                    <option value="requested_by_customer">Solicitado por el cliente</option>
                    <option value="cancelled_appointment">Cita cancelada</option>
                    <option value="other">Otra razón</option>
                  </Select>
                </FormControl>
                
                <HStack 
                  spacing={{ base: "5px", md: "10px" }} 
                  justify="center"
                  wrap="wrap"
                >
                  <Button 
                    colorScheme="red" 
                    leftIcon={<Icon as={MdEdit} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                    onClick={handleRefund}
                    isLoading={isLoading}
                    isDisabled={!refundAmount || !refundReason}
                  >
                    Procesar Reembolso
                  </Button>
                  <Button 
                    colorScheme="gray" 
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                    onClick={onRefundModalClose}
                  >
                    Cancelar
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Stripe Payment */}
      <StripePaymentModal
        isOpen={isStripeModalOpen}
        onClose={onStripeModalClose}
        appointmentData={selectedAppointment}
        onPaymentSuccess={handleStripePaymentSuccess}
      />
    </Box>
  );
}
