import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Divider
} from '@chakra-ui/react';

export default function BackendConnectionTest() {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const services = [
    { name: 'Auth Service', port: 8000, endpoint: '/api/auth/health' },
    { name: 'Users Service', port: 8000, endpoint: '/api/users/health' },
    { name: 'Appointments Service', port: 8000, endpoint: '/api/appointments/health' },
    { name: 'Medical Records Service', port: 8000, endpoint: '/api/medical-records/health' },
    { name: 'Payments Service', port: 8000, endpoint: '/api/payments/health' },
    { name: 'Notifications Service', port: 8000, endpoint: '/api/notifications/health' }
  ];

  const testService = async (service) => {
    try {
      const response = await fetch(`http://localhost:${service.port}${service.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        status: 'success',
        data: data,
        statusCode: response.status
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        statusCode: 0
      };
    }
  };

  const testAllServices = async () => {
    setIsLoading(true);
    const results = {};

    for (const service of services) {
      const result = await testService(service);
      results[service.name] = result;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Conectado';
      case 'error': return 'Error';
      default: return 'No probado';
    }
  };

  return (
    <Box p="6" bg="white" borderRadius="lg" boxShadow="md">
      <VStack spacing="4" align="stretch">
        <Text fontSize="xl" fontWeight="bold" color="gray.700">
          🔗 Prueba de Conexión Backend SMD VITAL
        </Text>
        
        <Text fontSize="sm" color="gray.600">
          Verifica que todos los microservicios estén funcionando correctamente
        </Text>

        <Button
          colorScheme="blue"
          onClick={testAllServices}
          isLoading={isLoading}
          loadingText="Probando servicios..."
          size="lg"
        >
          {isLoading ? <Spinner size="sm" mr="2" /> : '🚀 Probar Conexión'}
        </Button>

        <Divider />

        <VStack spacing="3" align="stretch">
          {services.map((service) => {
            const result = testResults[service.name];
            return (
              <Box
                key={service.name}
                p="4"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg="gray.50"
              >
                <HStack justify="space-between" mb="2">
                  <Text fontWeight="semibold">{service.name}</Text>
                  <Badge
                    colorScheme={getStatusColor(result?.status)}
                    variant="solid"
                  >
                    {getStatusText(result?.status)}
                  </Badge>
                </HStack>
                
                <Text fontSize="sm" color="gray.600" mb="2">
                  Puerto: {service.port} | Endpoint: {service.endpoint}
                </Text>

                {result?.status === 'success' && (
                  <Alert status="success" size="sm">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Conexión exitosa!</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Status Code: {result.statusCode} | 
                        Service: {result.data?.service} | 
                        Version: {result.data?.version}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {result?.status === 'error' && (
                  <Alert status="error" size="sm">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Error de conexión</AlertTitle>
                      <AlertDescription fontSize="xs">
                        {result.error}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </Box>
            );
          })}
        </VStack>

        {Object.keys(testResults).length > 0 && (
          <Box mt="4">
            <Text fontSize="sm" fontWeight="semibold" mb="2">
              📊 Resumen de Pruebas:
            </Text>
            <HStack spacing="4">
              <Badge colorScheme="green">
                ✅ Exitosos: {Object.values(testResults).filter(r => r.status === 'success').length}
              </Badge>
              <Badge colorScheme="red">
                ❌ Errores: {Object.values(testResults).filter(r => r.status === 'error').length}
              </Badge>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
