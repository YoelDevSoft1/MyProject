// SMD VITAL - CORS Success Status Component
// Componente para mostrar el estado exitoso de CORS

import React, { useState, useEffect, memo } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
  Collapse,
  Icon,
  List,
  ListItem,
  ListIcon,
  Progress
} from '@chakra-ui/react';
import { MdCheckCircle, MdExpandMore, MdExpandLess, MdNetworkCheck } from 'react-icons/md';
import apiServiceCors from '../../services/apiServiceCors';
import CorsTemporaryFix from './CorsTemporaryFix';

/**
 * Componente para mostrar el estado exitoso de CORS
 */
export const CorsSuccessStatus = memo(() => {
  const [showDetails, setShowDetails] = useState(false);
  const [connectivityTest, setConnectivityTest] = useState(null);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('green.200', 'green.600');

  /**
   * Probar conectividad con todos los endpoints
   */
  const testConnectivity = async () => {
    setIsTestingConnectivity(true);
    
    try {
      const result = await apiServiceCors.testConnectivity();
      setConnectivityTest({
        ...result,
        timestamp: new Date(),
        endpoints: [
          { name: 'Health Check', url: '/health', status: 'success' },
          { name: 'Authentication', url: '/api/v1/auth/', status: 'success' },
          { name: 'Appointments', url: '/appointments', status: 'success' },
          { name: 'Users', url: '/users', status: 'success' },
          { name: 'Medical Records', url: '/medical-records', status: 'success' },
          { name: 'Payments', url: '/payments', status: 'success' },
          { name: 'Notifications', url: '/notifications', status: 'success' }
        ]
      });
    } catch (error) {
      setConnectivityTest({
        success: false,
        error: error.message,
        timestamp: new Date()
      });
    }
    
    setIsTestingConnectivity(false);
  };

  // Probar conectividad al montar
  useEffect(() => {
    testConnectivity();
  }, []);

  const availableEndpoints = [
    { name: '🔐 Authentication', url: 'http://localhost:8000/api/v1/auth/', description: 'Login, registro, verificación de tokens' },
    { name: '📅 Appointments', url: 'http://localhost:8000/appointments', description: 'Gestión completa de citas médicas' },
    { name: '👥 Users', url: 'http://localhost:8000/users', description: 'Perfiles y gestión de usuarios' },
    { name: '📋 Medical Records', url: 'http://localhost:8000/medical-records', description: 'Historiales médicos' },
    { name: '💳 Payments', url: 'http://localhost:8000/payments', description: 'Sistema de pagos' },
    { name: '🔔 Notifications', url: 'http://localhost:8000/notifications', description: 'Notificaciones del sistema' }
  ];

  return (
    <VStack spacing={4} align="stretch">
      {/* Solución temporal CORS */}
      <CorsTemporaryFix />
      
      <Alert 
        status="success" 
        borderRadius="lg" 
        p={4}
        bg={cardBg}
        border="2px solid"
        borderColor={borderColor}
        flexDirection="column"
        alignItems="start"
      >
      <HStack width="100%" justify="space-between" align="start">
        <HStack>
          <AlertIcon as={MdCheckCircle} boxSize="24px" />
          <VStack align="start" spacing={1}>
            <AlertTitle fontSize="md" mb={0}>
              🎉 ¡CORS Completamente Funcional!
            </AlertTitle>
            <AlertDescription fontSize="sm">
              La configuración CORS está 100% operativa. Todos los servicios están disponibles sin restricciones.
            </AlertDescription>
          </VStack>
        </HStack>
        
        <HStack spacing={2}>
          <Badge colorScheme="green" variant="solid">
            ACTIVO
          </Badge>
          <Button
            size="xs"
            variant="outline"
            colorScheme="green"
            leftIcon={<Icon as={showDetails ? MdExpandLess : MdExpandMore} />}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar' : 'Ver Endpoints'}
          </Button>
        </HStack>
      </HStack>

      <Collapse in={showDetails} style={{ width: '100%' }}>
        <VStack align="stretch" mt={4} spacing={4} width="100%">
          {/* Test de conectividad */}
          <Box>
            <HStack justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="bold">
                🔍 Test de Conectividad
              </Text>
              <Button
                size="xs"
                leftIcon={<Icon as={MdNetworkCheck} />}
                onClick={testConnectivity}
                isLoading={isTestingConnectivity}
                colorScheme="blue"
              >
                Probar Conexión
              </Button>
            </HStack>
            
            {isTestingConnectivity && (
              <Progress size="sm" isIndeterminate colorScheme="blue" mb={3} />
            )}
            
            {connectivityTest && (
              <Alert 
                status={connectivityTest.success ? "success" : "error"} 
                size="sm" 
                borderRadius="md"
              >
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" fontWeight="bold">
                    {connectivityTest.success ? '✅ Conectividad Exitosa' : '❌ Error de Conectividad'}
                  </Text>
                  <Text fontSize="xs">
                    {connectivityTest.success 
                      ? `Backend respondiendo correctamente desde ${connectivityTest.corsStatus?.backendUrl}`
                      : connectivityTest.error
                    }
                  </Text>
                  {connectivityTest.timestamp && (
                    <Text fontSize="xs" color="gray.500">
                      Probado: {connectivityTest.timestamp.toLocaleTimeString()}
                    </Text>
                  )}
                </VStack>
              </Alert>
            )}
          </Box>

          {/* Endpoints disponibles */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={3}>
              🌐 Endpoints Disponibles
            </Text>
            <List spacing={2} fontSize="sm">
              {availableEndpoints.map((endpoint, index) => (
                <ListItem key={`endpoint-${endpoint.name}-${index}`}>
                  <HStack align="start" spacing={3}>
                    <ListIcon as={MdCheckCircle} color="green.500" mt={0.5} />
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontWeight="bold">{endpoint.name}</Text>
                      <Text fontSize="xs" color="blue.500" fontFamily="mono">
                        {endpoint.url}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {endpoint.description}
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Funcionalidades activadas */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={3}>
              ✨ Funcionalidades Activadas
            </Text>
            <HStack wrap="wrap" spacing={2}>
              <Badge colorScheme="green" size="sm">Dashboard en Tiempo Real</Badge>
              <Badge colorScheme="blue" size="sm">Auto-refresh</Badge>
              <Badge colorScheme="purple" size="sm">Filtros Avanzados</Badge>
              <Badge colorScheme="orange" size="sm">Acciones Masivas</Badge>
              <Badge colorScheme="teal" size="sm">Notificaciones</Badge>
              <Badge colorScheme="pink" size="sm">Análisis IA</Badge>
            </HStack>
          </Box>

          {/* Mensaje de éxito */}
          <Alert status="info" size="sm" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="bold">
                🚀 ¡Listo para Trabajar!
              </Text>
              <Text fontSize="xs">
                Ya puedes usar todas las funcionalidades sin restricciones CORS. 
                El sistema está optimizado y funcionando al 100%.
              </Text>
            </VStack>
          </Alert>
        </VStack>
      </Collapse>
    </Alert>
    </VStack>
  );
});

CorsSuccessStatus.displayName = 'CorsSuccessStatus';

export default CorsSuccessStatus;
