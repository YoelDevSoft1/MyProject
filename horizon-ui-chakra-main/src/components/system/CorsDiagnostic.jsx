// SMD VITAL - CORS Diagnostic Component
// Componente para diagnosticar y resolver problemas de CORS

import React, { useState, useEffect, memo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  Badge,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Heading,
  List,
  ListItem,
  ListIcon,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Icon,
  Spinner,
  Divider
} from '@chakra-ui/react';
import { 
  MdCheckCircle, 
  MdError, 
  MdWarning, 
  MdRefresh, 
  MdSettings,
  MdNetworkCheck,
  MdBugReport,
  MdInfo
} from 'react-icons/md';
import apiServiceCors from '../../services/apiServiceCors';
import { environment, logger } from '../../config/environment';

/**
 * Componente de diagnóstico completo de CORS
 */
export const CorsDiagnostic = memo(() => {
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  /**
   * Ejecutar diagnóstico completo
   */
  const runDiagnostic = async () => {
    setIsRunning(true);
    logger.info('Iniciando diagnóstico CORS...');

    const results = {
      timestamp: new Date(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: environment.apiUrl,
        corsEnabled: environment.corsEnabled,
        useProxy: environment.useProxy
      },
      connectivity: null,
      corsStatus: null,
      endpoints: [],
      recommendations: []
    };

    try {
      // 1. Probar conectividad básica
      logger.cors('Probando conectividad...');
      results.connectivity = await apiServiceCors.testConnectivity();

      // 2. Obtener estado de CORS
      results.corsStatus = apiServiceCors.getCorsStatus();

      // 3. Probar endpoints críticos
      const criticalEndpoints = [
        { name: 'Health Check', endpoint: '/health', method: 'GET', requiresAuth: false },
        { name: 'System Info', endpoint: '/system/info', method: 'GET', requiresAuth: false },
        { name: 'User Profile', endpoint: '/users/profile', method: 'GET', requiresAuth: true },
        { name: 'Appointments', endpoint: '/appointments', method: 'GET', requiresAuth: true }
      ];

      for (const test of criticalEndpoints) {
        logger.cors(`Probando endpoint: ${test.name}`);
        
        try {
          let response;
          if (test.requiresAuth) {
            const token = localStorage.getItem('smd_vital_token');
            if (!token) {
              results.endpoints.push({
                ...test,
                status: 'skipped',
                message: 'No hay token de autenticación'
              });
              continue;
            }
            response = await apiServiceCors.makeRequest(test.method.toLowerCase(), test.endpoint, null, token);
          } else {
            response = await apiServiceCors.makeRequest(test.method.toLowerCase(), test.endpoint);
          }

          results.endpoints.push({
            ...test,
            status: response.success ? 'success' : 'error',
            message: response.success ? 'OK' : response.error,
            corsError: response.corsError
          });
        } catch (error) {
          results.endpoints.push({
            ...test,
            status: 'error',
            message: error.message,
            corsError: error.message.includes('CORS')
          });
        }
      }

      // 4. Generar recomendaciones
      results.recommendations = generateRecommendations(results);

    } catch (error) {
      logger.error('Error durante diagnóstico:', error);
      results.error = error.message;
    }

    setDiagnosticData(results);
    setLastRun(new Date());
    setIsRunning(false);
    
    logger.info('Diagnóstico CORS completado:', results);
  };

  /**
   * Generar recomendaciones basadas en los resultados
   */
  const generateRecommendations = (results) => {
    const recommendations = [];

    // Verificar conectividad
    if (!results.connectivity?.success) {
      recommendations.push({
        type: 'error',
        title: 'Backend No Disponible',
        description: 'El backend no responde en ninguna de las URLs configuradas',
        actions: [
          'Verificar que el backend esté ejecutándose en http://localhost:8000',
          'Ejecutar: python -m uvicorn main:app --reload --port 8000',
          'Verificar que no haya conflictos de puerto'
        ]
      });
    }

    // Verificar errores de CORS
    const corsErrors = results.endpoints.filter(ep => ep.corsError);
    if (corsErrors.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Errores de CORS Detectados',
        description: `${corsErrors.length} endpoints tienen problemas de CORS`,
        actions: [
          'Configurar CORS en el backend FastAPI',
          'Verificar que el origen http://localhost:3001 esté permitido',
          'Revisar headers Access-Control-Allow-Origin duplicados'
        ]
      });
    }

    // Verificar autenticación
    const authErrors = results.endpoints.filter(ep => ep.message?.includes('401') || ep.message?.includes('token'));
    if (authErrors.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Problemas de Autenticación',
        description: 'Algunos endpoints requieren autenticación válida',
        actions: [
          'Hacer login para obtener un token válido',
          'Verificar que el token no haya expirado',
          'Revisar configuración de JWT en el backend'
        ]
      });
    }

    // Recomendaciones de configuración
    if (!environment.useProxy && environment.isDevelopment) {
      recommendations.push({
        type: 'info',
        title: 'Proxy No Configurado',
        description: 'Considera usar proxy en desarrollo para evitar problemas de CORS',
        actions: [
          'Agregar "proxy": "http://localhost:8000" en package.json',
          'O configurar REACT_APP_USE_PROXY=true'
        ]
      });
    }

    return recommendations;
  };

  /**
   * Obtener color del estado
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'skipped': return 'gray';
      default: return 'blue';
    }
  };

  /**
   * Obtener icono del estado
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return MdCheckCircle;
      case 'error': return MdError;
      case 'warning': return MdWarning;
      default: return MdInfo;
    }
  };

  // Ejecutar diagnóstico inicial
  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Icon as={MdBugReport} color="blue.500" boxSize={6} />
            <VStack align="start" spacing={0}>
              <Heading size="md">Diagnóstico CORS</Heading>
              <Text fontSize="sm" color="gray.500">
                {lastRun ? `Última ejecución: ${lastRun.toLocaleTimeString()}` : 'Nunca ejecutado'}
              </Text>
            </VStack>
          </HStack>
          
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={runDiagnostic}
            isLoading={isRunning}
            size="sm"
            colorScheme="blue"
          >
            {isRunning ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}
          </Button>
        </HStack>
      </CardHeader>

      <CardBody>
        {isRunning && (
          <VStack spacing={4}>
            <Progress size="sm" isIndeterminate colorScheme="blue" width="100%" />
            <HStack>
              <Spinner size="sm" color="blue.500" />
              <Text fontSize="sm">Ejecutando diagnóstico CORS...</Text>
            </HStack>
          </VStack>
        )}

        {diagnosticData && !isRunning && (
          <VStack spacing={6} align="stretch">
            {/* Resumen General */}
            <Box>
              <Text fontWeight="bold" mb={3}>📊 Resumen General</Text>
              <HStack spacing={4} wrap="wrap">
                <Badge colorScheme={diagnosticData.connectivity?.success ? 'green' : 'red'}>
                  Conectividad: {diagnosticData.connectivity?.success ? 'OK' : 'ERROR'}
                </Badge>
                <Badge colorScheme={diagnosticData.corsStatus?.initialized ? 'green' : 'yellow'}>
                  CORS: {diagnosticData.corsStatus?.initialized ? 'Inicializado' : 'No Inicializado'}
                </Badge>
                <Badge colorScheme="blue">
                  Endpoints: {diagnosticData.endpoints?.length || 0} probados
                </Badge>
                <Badge colorScheme="purple">
                  Recomendaciones: {diagnosticData.recommendations?.length || 0}
                </Badge>
              </HStack>
            </Box>

            <Divider />

            {/* Información del Entorno */}
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Icon as={MdSettings} />
                      <Text fontWeight="bold">🔧 Configuración del Entorno</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Entorno:</Text>
                      <Code fontSize="sm">{diagnosticData.environment.nodeEnv}</Code>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">API URL:</Text>
                      <Code fontSize="sm">{diagnosticData.environment.apiUrl}</Code>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">CORS Habilitado:</Text>
                      <Badge colorScheme={diagnosticData.environment.corsEnabled ? 'green' : 'red'} size="sm">
                        {diagnosticData.environment.corsEnabled ? 'SÍ' : 'NO'}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Usar Proxy:</Text>
                      <Badge colorScheme={diagnosticData.environment.useProxy ? 'green' : 'gray'} size="sm">
                        {diagnosticData.environment.useProxy ? 'SÍ' : 'NO'}
                      </Badge>
                    </HStack>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {/* Estado de Endpoints */}
            <Box>
              <Text fontWeight="bold" mb={3}>🌐 Estado de Endpoints</Text>
              <VStack spacing={2} align="stretch">
                {diagnosticData.endpoints?.map((endpoint, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                    <HStack>
                      <Icon 
                        as={getStatusIcon(endpoint.status)} 
                        color={`${getStatusColor(endpoint.status)}.500`} 
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold">{endpoint.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {endpoint.method} {endpoint.endpoint}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={0}>
                      <Badge colorScheme={getStatusColor(endpoint.status)} size="sm">
                        {endpoint.status.toUpperCase()}
                      </Badge>
                      {endpoint.message && (
                        <Text fontSize="xs" color="gray.500" textAlign="right">
                          {endpoint.message.substring(0, 50)}
                          {endpoint.message.length > 50 ? '...' : ''}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Recomendaciones */}
            {diagnosticData.recommendations?.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={3}>💡 Recomendaciones</Text>
                <VStack spacing={3} align="stretch">
                  {diagnosticData.recommendations.map((rec, index) => (
                    <Alert key={index} status={rec.type} borderRadius="md">
                      <AlertIcon />
                      <VStack align="start" spacing={2} flex="1">
                        <Text fontWeight="bold" fontSize="sm">{rec.title}</Text>
                        <Text fontSize="sm">{rec.description}</Text>
                        <List spacing={1} fontSize="xs">
                          {rec.actions.map((action, actionIndex) => (
                            <ListItem key={actionIndex}>
                              <ListIcon as={MdCheckCircle} color="green.500" />
                              {action}
                            </ListItem>
                          ))}
                        </List>
                      </VStack>
                    </Alert>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
});

CorsDiagnostic.displayName = 'CorsDiagnostic';

export default CorsDiagnostic;
