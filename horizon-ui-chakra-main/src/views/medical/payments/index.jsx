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
} from "@chakra-ui/react";
import React, { useState } from "react";
// Assets
import { MdSearch, MdAdd, MdEdit, MdVisibility, MdReceipt, MdPayment } from "react-icons/md";
import { FaCreditCard, FaMoneyBillWave, FaUniversity } from "react-icons/fa";

export default function Payments() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Datos simulados de pagos SMD VITAL
  const payments = [
    {
      id: 1,
      patient: "María González",
      patientId: "SMD001",
      amount: 180000,
      currency: "COP",
      date: "2024-01-20",
      method: "credit_card",
      status: "completed",
      description: "Consulta general SMD VITAL - Dr. Carlos López",
      transactionId: "SMD001234",
      invoice: "SMD-2024-001"
    },
    {
      id: 2,
      patient: "Juan Pérez",
      patientId: "SMD002",
      amount: 220000,
      currency: "COP",
      date: "2024-01-18",
      method: "cash",
      status: "completed",
      description: "Seguimiento diabetes SMD VITAL - Dr. Ana Martínez",
      transactionId: "SMD001235",
      invoice: "SMD-2024-002"
    },
    {
      id: 3,
      patient: "Laura Rodríguez",
      patientId: "SMD003",
      amount: 150000,
      currency: "COP",
      date: "2024-01-19",
      method: "bank_transfer",
      status: "pending",
      description: "Primera consulta SMD VITAL - Dr. Carlos López",
      transactionId: "SMD001236",
      invoice: "SMD-2024-003"
    },
    {
      id: 4,
      patient: "Pedro Sánchez",
      patientId: "SMD004",
      amount: 200000,
      currency: "COP",
      date: "2024-01-16",
      method: "credit_card",
      status: "failed",
      description: "Consulta de seguimiento SMD VITAL - Dr. Ana Martínez",
      transactionId: "SMD001237",
      invoice: "SMD-2024-004"
    }
  ];

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

  // Estadísticas de pagos
  const totalRevenue = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingAmount = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayments = payments.filter(p => p.status === "completed").length;
  const totalPayments = payments.length;

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
        <Button
          leftIcon={<Icon as={MdAdd} />}
          colorScheme="payment"
          size={{ base: "md", md: "lg" }}
          onClick={onOpen}
          width={{ base: "full", lg: "auto" }}
        >
          Nuevo Pago SMD VITAL
        </Button>
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
              {formatCurrency(totalRevenue, "COP")}
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
              {formatCurrency(pendingAmount, "COP")}
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
              {completedPayments}/{totalPayments}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <Progress 
                value={(completedPayments/totalPayments)*100} 
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
              {formatCurrency(totalRevenue/completedPayments, "COP")}
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
            />
          </InputGroup>
          <Select 
            placeholder="Filtrar por estado"
            size={{ base: "md", md: "lg" }}
          >
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
            <option value="refunded">Reembolsados</option>
          </Select>
          <Select 
            placeholder="Filtrar por método"
            size={{ base: "md", md: "lg" }}
          >
            <option value="credit_card">Tarjeta de Crédito</option>
            <option value="cash">Efectivo</option>
            <option value="bank_transfer">Transferencia Bancaria</option>
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
            {payments.map((payment) => (
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
                    {formatCurrency(payment.amount, payment.currency)}
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
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdEdit} />}
                      variant="outline"
                      colorScheme="yellow"
                    >
                      <Text display={{ base: "none", sm: "block" }}>Editar</Text>
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
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
    </Box>
  );
}
