// SMD VITAL - ConnectionStatus Component
// Componente para mostrar el estado de conexión con el backend

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
  Link,
  Code
} from '@chakra-ui/react';
import { MdWarning, MdError, MdCheckCircle, MdRefresh, MdInfo } from 'react-icons/md';

/**
 * Componente para mostrar el estado de la conexión
 */
export const ConnectionStatus = memo(() => {
  const [corsErrors, setCorsErrors] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date());
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('orange.200', 'orange.600');

  useEffect(() => {
    // Simplificar detección de errores para evitar bucles
    const handleError = (event) => {
      if (event.message && (event.message.includes('CORS') || event.message.includes('Access-Control-Allow-Origin'))) {
        setCorsErrors(prev => {
          // Evitar duplicados recientes
          const recent = prev.find(err => 
            Date.now() - err.timestamp.getTime() < 5000 && 
            err.message.includes(event.message.substring(0, 50))
          );
          
          if (recent) return prev;
          
          const newError = {
            id: Date.now(),
            message: event.message.substring(0, 200), // Limitar longitud
            timestamp: new Date(),
            type: 'cors'
          };
          
          return [newError, ...prev.slice(0, 3)]; // Máximo 4 errores
        });
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const hasCorsErrors = corsErrors.length > 0;
  const recentErrors = corsErrors.filter(err => 
    Date.now() - err.timestamp.getTime() < 30000 // Últimos 30 segundos
  );

  const getStatusInfo = () => {
    if (recentErrors.length > 0) {
      return {
        status: 'error',
        icon: MdError,
        title: 'Problemas de Conexión Detectados',
        color: 'red',
        message: `${recentErrors.length} errores de CORS en los últimos 30 segundos`
      };
    }
    
    if (hasCorsErrors) {
      return {
        status: 'warning',
        icon: MdWarning,
        title: 'Errores de CORS Anteriores',
        color: 'orange',
        message: `Se detectaron ${corsErrors.length} errores de CORS`
      };
    }
    
    return {
      status: 'success',
      icon: MdCheckCircle,
      title: 'Conexión Estable',
      color: 'green',
      message: 'No se han detectado problemas de conectividad'
    };
  };

  const statusInfo = getStatusInfo();

  const handleRefresh = () => {
    setCorsErrors([]);
    setLastCheck(new Date());
    window.location.reload();
  };

  const getSolutions = () => [
    {
      title: "Verificar Backend",
      description: "Asegúrate de que el backend esté ejecutándose en http://localhost:8000",
      action: "Ejecutar: python -m uvicorn main:app --reload --port 8000"
    },
    {
      title: "Configuración CORS",
      description: "El backend debe permitir requests desde http://localhost:3001",
      action: "Verificar configuración de CORS en el backend"
    },
    {
      title: "Headers Duplicados",
      description: "Eliminar headers Access-Control-Allow-Origin duplicados",
      action: "Revisar configuración del servidor y proxies"
    },
    {
      title: "Rate Limiting",
      description: "Reducir frecuencia de requests para evitar 429 errors",
      action: "Dashboard en tiempo real temporalmente deshabilitado"
    }
  ];

  if (!hasCorsErrors && statusInfo.status === 'success') {
    return null; // No mostrar si todo está bien
  }

  return (
    <Alert 
      status={statusInfo.status} 
      borderRadius="lg" 
      p={4}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
    >
      <AlertIcon as={statusInfo.icon} boxSize="20px" />
      <Box flex="1">
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex="1">
            <HStack>
              <AlertTitle fontSize="sm" mb={0}>
                {statusInfo.title}
              </AlertTitle>
              <Badge colorScheme={statusInfo.color} size="sm">
                {recentErrors.length > 0 ? 'ACTIVO' : 'HISTÓRICO'}
              </Badge>
            </HStack>
            
            <AlertDescription fontSize="xs">
              {statusInfo.message}
            </AlertDescription>
            
            <Text fontSize="xs" color="gray.500">
              Última verificación: {lastCheck.toLocaleTimeString()}
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<Icon as={MdInfo} />}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Detalles'}
            </Button>
            <Button
              size="xs"
              colorScheme={statusInfo.color}
              leftIcon={<Icon as={MdRefresh} />}
              onClick={handleRefresh}
            >
              Reintentar
            </Button>
          </HStack>
        </HStack>

        <Collapse in={showDetails}>
          <VStack align="stretch" mt={4} spacing={3}>
            {/* Errores recientes */}
            {recentErrors.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>
                  Errores Recientes:
                </Text>
                <VStack align="stretch" spacing={1}>
                  {recentErrors.slice(0, 3).map(error => (
                    <Code key={error.id} fontSize="xs" p={2} borderRadius="md">
                      {error.message.substring(0, 100)}...
                    </Code>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Soluciones sugeridas */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={2}>
                Soluciones Sugeridas:
              </Text>
              <VStack align="stretch" spacing={2}>
                {getSolutions().map((solution, index) => (
                  <Box key={`solution-${solution.title}-${index}`} p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xs" fontWeight="bold">
                      {solution.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {solution.description}
                    </Text>
                    <Code fontSize="xs" mt={1}>
                      {solution.action}
                    </Code>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Enlaces útiles */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={2}>
                Enlaces Útiles:
              </Text>
              <VStack align="start" spacing={1}>
                <Link 
                  href="http://localhost:8000/docs" 
                  isExternal 
                  fontSize="xs" 
                  color="blue.500"
                >
                  📚 Documentación API (localhost:8000/docs)
                </Link>
                <Link 
                  href="http://localhost:8000/health" 
                  isExternal 
                  fontSize="xs" 
                  color="blue.500"
                >
                  ❤️ Health Check (localhost:8000/health)
                </Link>
              </VStack>
            </Box>
          </VStack>
        </Collapse>
      </Box>
    </Alert>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;
