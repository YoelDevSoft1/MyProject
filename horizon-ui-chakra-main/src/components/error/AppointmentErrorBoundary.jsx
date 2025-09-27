// SMD VITAL - AppointmentErrorBoundary Component
// Error boundary específico para la página de citas

import React from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  HStack,
  Code,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue
} from '@chakra-ui/react';

class AppointmentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log del error para debugging
    console.error('AppointmentErrorBoundary caught an error:', error, errorInfo);
    
    // Enviar error a servicio de monitoreo si está configurado
    if (window.reportError) {
      window.reportError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onRetry }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.200', 'red.600');

  const isDataError = error?.message?.includes('filter is not a function') ||
                     error?.message?.includes('Cannot read property') ||
                     error?.message?.includes('Cannot read properties');

  const getErrorSuggestion = () => {
    if (isDataError) {
      return {
        title: "Error de Datos",
        description: "Parece que hay un problema con la estructura de datos recibida del servidor.",
        solutions: [
          "Verifica que el backend esté enviando los datos en el formato correcto",
          "Revisa la consola para ver la estructura exacta de los datos",
          "Asegúrate de que el endpoint de citas devuelva un array",
          "Verifica la conectividad con el backend"
        ]
      };
    }

    return {
      title: "Error Desconocido",
      description: "Ha ocurrido un error inesperado en la aplicación.",
      solutions: [
        "Intenta recargar la página",
        "Verifica tu conexión a internet",
        "Contacta al administrador del sistema si el problema persiste"
      ]
    };
  };

  const errorSuggestion = getErrorSuggestion();

  return (
    <Box p={6} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Alert status="error" borderRadius="lg" p={6}>
          <AlertIcon boxSize="40px" mr={4} />
          <Box flex="1">
            <AlertTitle fontSize="xl" mb={2}>
              {errorSuggestion.title}
            </AlertTitle>
            <AlertDescription fontSize="md">
              {errorSuggestion.description}
            </AlertDescription>
          </Box>
        </Alert>

        {/* Sugerencias de solución */}
        <Box bg={cardBg} p={4} borderRadius="md" border="1px solid" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3} color="red.600">
            Posibles Soluciones:
          </Text>
          <VStack align="stretch" spacing={2}>
            {errorSuggestion.solutions.map((solution, index) => (
              <HStack key={index} align="start">
                <Text color="red.500" fontWeight="bold" minW="20px">
                  {index + 1}.
                </Text>
                <Text fontSize="sm">{solution}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Acciones */}
        <HStack spacing={4} justify="center">
          <Button colorScheme="blue" onClick={onRetry}>
            Reintentar
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recargar Página
          </Button>
          <Button variant="ghost" onClick={() => window.location.href = '/admin/dashboard'}>
            Ir al Dashboard
          </Button>
        </HStack>

        {/* Detalles técnicos (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Detalles Técnicos (Desarrollo)</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack align="stretch" spacing={4}>
                  {error && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Error Message:</Text>
                      <Code p={3} borderRadius="md" display="block" whiteSpace="pre-wrap">
                        {error.toString()}
                      </Code>
                    </Box>
                  )}
                  
                  {error?.stack && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Stack Trace:</Text>
                      <Code 
                        p={3} 
                        borderRadius="md" 
                        display="block" 
                        whiteSpace="pre-wrap"
                        fontSize="xs"
                        maxH="200px"
                        overflowY="auto"
                      >
                        {error.stack}
                      </Code>
                    </Box>
                  )}
                  
                  {errorInfo?.componentStack && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Component Stack:</Text>
                      <Code 
                        p={3} 
                        borderRadius="md" 
                        display="block" 
                        whiteSpace="pre-wrap"
                        fontSize="xs"
                        maxH="200px"
                        overflowY="auto"
                      >
                        {errorInfo.componentStack}
                      </Code>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}

        {/* Información adicional */}
        <Box textAlign="center" color="gray.500">
          <Text fontSize="sm">
            Si el problema persiste, por favor contacta al equipo de soporte técnico.
          </Text>
          <Text fontSize="xs" mt={2}>
            Error ID: {Date.now().toString(36)}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default AppointmentErrorBoundary;
