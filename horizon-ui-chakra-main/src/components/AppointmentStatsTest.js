import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
  Badge,
  HStack,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { testAppointmentStats } from '../utils/testAppointmentStats';

export default function AppointmentStatsTest() {
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { token, isAuthenticated } = useAuth();
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue("white", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  
  const runTest = async () => {
    setIsRunning(true);
    try {
      // Primero verificar que la función existe
      const functionExists = testAppointmentStats.testFunctionExists(apiService);
      
      if (!functionExists) {
        setTestResult({
          success: false,
          message: 'La función getAppointmentStats no está definida en apiService'
        });
        return;
      }
      
      // Si está autenticado, probar la función con token
      if (isAuthenticated && token) {
        const result = await testAppointmentStats.runTest(apiService, token);
        setTestResult(result);
      } else {
        setTestResult({
          success: true,
          message: 'Función disponible pero no autenticado para probar con token'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error ejecutando prueba: ${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <Box p={6} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="bold" color={textColor} mb={2}>
            🧪 Prueba de Estadísticas de Citas
          </Text>
          <Text color="gray.600" fontSize="sm">
            Verifica que la función getAppointmentStats esté funcionando correctamente
          </Text>
        </Box>
        
        <Divider />
        
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={runTest}
            isLoading={isRunning}
            loadingText="Probando..."
            isDisabled={!isAuthenticated}
          >
            {isRunning ? 'Probando...' : 'Probar Estadísticas'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setTestResult(null)}
            isDisabled={!testResult}
          >
            Limpiar
          </Button>
        </HStack>
        
        {!isAuthenticated && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              Necesitas estar autenticado para probar la función con token
            </AlertDescription>
          </Alert>
        )}
        
        {testResult && (
          <Alert 
            status={testResult.success ? "success" : "error"}
            borderRadius="md"
          >
            <AlertIcon />
            <Box>
              <AlertTitle>
                {testResult.success ? 'Prueba Exitosa' : 'Error en Prueba'}
              </AlertTitle>
              <AlertDescription>
                {testResult.message}
              </AlertDescription>
            </Box>
          </Alert>
        )}
        
        <Box>
          <Text fontWeight="semibold" color={textColor} mb={2}>
            🔧 Correcciones Implementadas:
          </Text>
          <VStack align="start" spacing={2}>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Función getAppointmentStats agregada a apiService</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Manejo de errores mejorado en loadStats</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Valores por defecto cuando las estadísticas no están disponibles</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Eliminación de toasts de error para estadísticas</Text>
            </HStack>
          </VStack>
        </Box>
        
        <Box>
          <Text fontWeight="semibold" color={textColor} mb={2}>
            📝 Código Agregado:
          </Text>
          <Code p={3} borderRadius="md" fontSize="sm" display="block" whiteSpace="pre-wrap">
{`// En apiService.js
async getAppointmentStats(token) {
  return this.request('/appointments/stats', {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
}

// En Appointments component
// Manejo de errores mejorado con valores por defecto
setStats({
  total_appointments: 0,
  confirmed_appointments: 0,
  pending_appointments: 0,
  completed_appointments: 0,
  // ... más valores por defecto
});`}
          </Code>
        </Box>
        
        <Box>
          <Text fontWeight="semibold" color={textColor} mb={2}>
            🎯 Resultado Esperado:
          </Text>
          <Text fontSize="sm" color="green.600">
            El componente de Citas Médicas ahora debería cargar sin el error "getAppointmentStats is not a function"
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}

