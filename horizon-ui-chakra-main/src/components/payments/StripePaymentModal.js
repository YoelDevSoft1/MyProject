/**
 * SMD VITAL - Stripe Payment Modal Component
 * ==========================================
 * Modal para procesar pagos con Stripe integrado al sistema existente
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Box,
  Divider,
  Badge,
  Icon,
  Grid
} from '@chakra-ui/react';
import { FaStripe, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { MdPayment, MdReceipt } from 'react-icons/md';
import { useAuth } from 'contexts/AuthContext';
import apiService from 'services/apiService';

const StripePaymentModal = ({ 
  isOpen, 
  onClose, 
  appointmentData, 
  onPaymentSuccess 
}) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'COP',
    description: '',
    patientId: '',
    appointmentId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  
  const toast = useToast();
  const { user, token } = useAuth();

  // Initialize payment data when modal opens
  useEffect(() => {
    if (isOpen && appointmentData) {
      setPaymentData({
        amount: appointmentData.amount?.toString() || '',
        currency: 'COP',
        description: `Consulta médica - ${appointmentData.doctor || 'Dr. Especialista'}`,
        patientId: appointmentData.patientId || '',
        appointmentId: appointmentData.appointmentId || ''
      });
    }
  }, [isOpen, appointmentData]);

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreatePaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPaymentStatus('processing');

      const paymentIntentData = {
        appointment_id: paymentData.appointmentId,
        user_id: user.id,
        amount_cents: Math.round(parseFloat(paymentData.amount) * 100),
        currency: paymentData.currency,
        metadata: {
          patient_id: paymentData.patientId,
          description: paymentData.description
        }
      };

      const response = await apiService.createPaymentIntent(paymentIntentData, token);
      setPaymentIntent(response);
      setPaymentStatus('ready');

      toast({
        title: 'PaymentIntent Creado',
        description: 'Redirigiendo a Stripe para completar el pago',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      setError(err.message || 'Error creando PaymentIntent');
      setPaymentStatus('error');
      toast({
        title: 'Error',
        description: 'Error creando PaymentIntent: ' + (err.message || 'Error desconocido'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeRedirect = () => {
    if (paymentIntent?.client_secret) {
      // En un entorno real, aquí integrarías Stripe Elements
      // Por ahora, simulamos el proceso
      window.open(`https://checkout.stripe.com/pay/${paymentIntent.payment_intent_id}`, '_blank');
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!paymentIntent?.payment_intent_id) return;

    try {
      const response = await apiService.getPaymentStatus(paymentIntent.payment_intent_id, token);
      
      if (response.status === 'succeeded') {
        setPaymentStatus('success');
        toast({
          title: 'Pago Exitoso',
          description: 'El pago ha sido procesado correctamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        if (onPaymentSuccess) {
          onPaymentSuccess(response);
        }
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (response.status === 'failed') {
        setPaymentStatus('error');
        setError('El pago fue rechazado');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'blue';
      case 'processing': return 'yellow';
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Listo para pagar';
      case 'processing': return 'Procesando...';
      case 'success': return 'Pago exitoso';
      case 'error': return 'Error en el pago';
      default: return 'Iniciar pago';
    }
  };

  return (
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
          <HStack spacing={3}>
            <Icon as={FaStripe} color="blue.500" boxSize={6} />
            <Text>Procesar Pago con Stripe</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="30px">
          <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
            
            {/* Payment Summary */}
            <Box
              bg="blue.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="blue.200"
            >
              <VStack spacing={2} align="stretch">
                <Text fontSize="lg" fontWeight="bold" color="blue.700">
                  Resumen del Pago
                </Text>
                <HStack justify="space-between">
                  <Text color="gray.600">Paciente:</Text>
                  <Text fontWeight="semibold">{appointmentData?.patient || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Doctor:</Text>
                  <Text fontWeight="semibold">{appointmentData?.doctor || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Fecha:</Text>
                  <Text fontWeight="semibold">{appointmentData?.date || 'N/A'}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">Total:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.700">
                    {formatCurrency(parseFloat(paymentData.amount) || 0, paymentData.currency)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Payment Form */}
            {paymentStatus === 'idle' && (
              <VStack spacing={4} align="stretch">
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl isRequired>
                    <FormLabel>Monto</FormLabel>
                    <NumberInput
                      value={paymentData.amount}
                      onChange={(valueString) => handleInputChange('amount', valueString)}
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
                    <FormLabel>Moneda</FormLabel>
                    <Select 
                      value={paymentData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      <option value="COP">Peso Colombiano (COP)</option>
                      <option value="USD">Dólar Americano (USD)</option>
                    </Select>
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel>Descripción</FormLabel>
                  <Input 
                    value={paymentData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Consulta médica - Dr. Especialista"
                  />
                </FormControl>

                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={FaStripe} />}
                  size="lg"
                  onClick={handleCreatePaymentIntent}
                  isLoading={isLoading}
                  loadingText="Creando PaymentIntent..."
                >
                  Crear PaymentIntent
                </Button>
              </VStack>
            )}

            {/* Payment Processing */}
            {paymentStatus === 'processing' && (
              <VStack spacing={4} align="center" py={8}>
                <Spinner size="xl" color="blue.500" />
                <Text fontSize="lg" color="gray.600">
                  Creando PaymentIntent...
                </Text>
              </VStack>
            )}

            {/* Payment Ready */}
            {paymentStatus === 'ready' && paymentIntent && (
              <VStack spacing={4} align="stretch">
                <Alert status="success">
                  <AlertIcon />
                  PaymentIntent creado exitosamente. ID: {paymentIntent.payment_intent_id}
                </Alert>

                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <VStack spacing={2} align="stretch">
                    <Text fontWeight="bold">Detalles del PaymentIntent:</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">ID:</Text>
                      <Text fontSize="sm" fontFamily="mono">{paymentIntent.payment_intent_id}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Monto:</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {formatCurrency(paymentIntent.amount_cents / 100, paymentIntent.currency)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Estado:</Text>
                      <Badge colorScheme="blue">{paymentIntent.status}</Badge>
                    </HStack>
                  </VStack>
                </Box>

                <HStack spacing={4} justify="center">
                  <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={FaCreditCard} />}
                    onClick={handleStripeRedirect}
                    size="lg"
                  >
                    Ir a Stripe Checkout
                  </Button>
                  <Button
                    colorScheme="gray"
                    variant="outline"
                    leftIcon={<Icon as={MdPayment} />}
                    onClick={handleCheckPaymentStatus}
                    size="lg"
                  >
                    Verificar Estado
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Payment Success */}
            {paymentStatus === 'success' && (
              <VStack spacing={4} align="center" py={8}>
                <Icon as={MdReceipt} boxSize={16} color="green.500" />
                <Text fontSize="xl" fontWeight="bold" color="green.600">
                  ¡Pago Procesado Exitosamente!
                </Text>
                <Text color="gray.600" textAlign="center">
                  El pago ha sido confirmado y procesado correctamente.
                </Text>
                <Button
                  colorScheme="green"
                  onClick={onClose}
                  size="lg"
                >
                  Cerrar
                </Button>
              </VStack>
            )}

            {/* Payment Error */}
            {paymentStatus === 'error' && (
              <VStack spacing={4} align="center" py={8}>
                <Icon as={FaMoneyBillWave} boxSize={16} color="red.500" />
                <Text fontSize="xl" fontWeight="bold" color="red.600">
                  Error en el Pago
                </Text>
                <Text color="gray.600" textAlign="center">
                  {error || 'Hubo un problema procesando el pago. Inténtalo de nuevo.'}
                </Text>
                <HStack spacing={4}>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => {
                      setPaymentStatus('idle');
                      setError(null);
                    }}
                  >
                    Intentar de Nuevo
                  </Button>
                  <Button
                    colorScheme="gray"
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Status Badge */}
            <Box textAlign="center">
              <Badge 
                colorScheme={getStatusColor(paymentStatus)} 
                fontSize="sm" 
                px={3} 
                py={1}
              >
                {getStatusText(paymentStatus)}
              </Badge>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StripePaymentModal;
