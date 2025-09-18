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
  useColorModeValue
} from '@chakra-ui/react';
import { diagnoseAppointments } from '../utils/diagnoseAppointments';

export default function AppointmentsTest() {
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue("white", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  
  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const result = diagnoseAppointments.runDiagnostic();
      setDiagnosticResult(result);
    } catch (error) {
      setDiagnosticResult({
        success: false,
        message: `Error ejecutando diagnóstico: ${error.message}`
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
            🔍 Diagnóstico de Citas Médicas
          </Text>
          <Text color="gray.600" fontSize="sm">
            Verifica que el componente Appointments esté funcionando correctamente y no tenga errores de undefined
          </Text>
        </Box>
        
        <Divider />
        
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={runDiagnostic}
            isLoading={isRunning}
            loadingText="Ejecutando..."
          >
            {isRunning ? 'Ejecutando Diagnóstico...' : 'Ejecutar Diagnóstico'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setDiagnosticResult(null)}
            isDisabled={!diagnosticResult}
          >
            Limpiar
          </Button>
        </HStack>
        
        {diagnosticResult && (
          <Alert 
            status={diagnosticResult.success ? "success" : "error"}
            borderRadius="md"
          >
            <AlertIcon />
            <Box>
              <AlertTitle>
                {diagnosticResult.success ? 'Diagnóstico Exitoso' : 'Error en Diagnóstico'}
              </AlertTitle>
              <AlertDescription>
                {diagnosticResult.message}
              </AlertDescription>
            </Box>
          </Alert>
        )}
        
        <Box>
          <Text fontWeight="semibold" color={textColor} mb={2}>
            🛠️ Correcciones Implementadas:
          </Text>
          <VStack align="start" spacing={2}>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Verificación de undefined antes de acceder a .length</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Verificación de undefined antes de .map()</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Inicialización segura del estado con array vacío</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Validación de Array.isArray() en respuestas del API</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="green">✅</Badge>
              <Text fontSize="sm">Manejo de errores que siempre mantiene appointments como array</Text>
            </HStack>
          </VStack>
        </Box>
        
        <Box>
          <Text fontWeight="semibold" color={textColor} mb={2}>
            📝 Código de Ejemplo:
          </Text>
          <Code p={3} borderRadius="md" fontSize="sm" display="block" whiteSpace="pre-wrap">
{`// ANTES (causaba error):
appointments.length === 0

// DESPUÉS (seguro):
!appointments || appointments.length === 0

// ANTES (causaba error):
appointments.map((appointment) => ...)

// DESPUÉS (seguro):
appointments && appointments.map((appointment) => ...)`}
          </Code>
        </Box>
        
        <Box>
          <Text fontWeight="semibold" color={textColor} mb={2}>
            🎯 Resultado Esperado:
          </Text>
          <Text fontSize="sm" color="green.600">
            El componente de Citas Médicas ahora debería cargar sin errores de "Cannot read properties of undefined (reading 'length')"
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}

