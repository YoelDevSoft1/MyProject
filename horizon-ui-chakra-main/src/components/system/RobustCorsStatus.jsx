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
  Progress,
  Code,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { 
  MdCheckCircle, 
  MdExpandMore, 
  MdExpandLess, 
  MdNetworkCheck,
  MdWarning,
  MdInfo,
  MdError
} from 'react-icons/md';
import robustApiService from '../../services/robustApiService';

/**
 * Componente robusto para mostrar el estado del sistema CORS
 */
export const RobustCorsStatus = memo(() => {
  const [showDetails, setShowDetails] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [corsStatus, setCorsStatus] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('green.200', 'green.600');

  /**
   * Ejecutar diagnóstico completo
   */
  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    
    try {
      const diagnosticsResult = await robustApiService.diagnoseCors();
      const statusResult = robustApiService.getCorsStatus();
      
      setDiagnostics(diagnosticsResult);
      setCorsStatus(statusResult);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDiagnostics({
        corsStatus: null,
        connectivity: { success: false, error: error.message },
        recommendations: []
      });
    }
    
    setIsRunningDiagnostics(false);
  };

  // Ejecutar diagnóstico al montar
  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'red';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return MdCheckCircle;
      case 'disconnected': return MdError;
      case 'error': return MdError;
      default: return MdInfo;
    }
  };

  const getStrategyBadgeColor = (strategy) => {
    switch (strategy) {
      case 'credentials-wildcard': return 'green';
      case 'specific-origin': return 'blue';
      case 'wildcard-omit': return 'orange';
      case 'proxy': return 'purple';
      case 'fallback': return 'red';
      default: return 'gray';
    }
  };

  return (
    <VStack spacing={4} align="stretch">
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
                🚀 Sistema CORS Robusto Activo
              </AlertTitle>
              <AlertDescription fontSize="sm">
                Detección automática y adaptación inteligente a la configuración del backend.
              </AlertDescription>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            {corsStatus && (
              <Badge colorScheme={getStrategyBadgeColor(corsStatus.corsStrategy)} variant="solid">
                {corsStatus.corsStrategy?.toUpperCase() || 'DETECTING'}
              </Badge>
            )}
            <Button
              size="xs"
              variant="outline"
              colorScheme="green"
              leftIcon={<Icon as={showDetails ? MdExpandLess : MdExpandMore} />}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Diagnóstico'}
            </Button>
          </HStack>
        </HStack>

        <Collapse in={showDetails} style={{ width: '100%' }}>
          <VStack align="stretch" mt={4} spacing={4} width="100%">
            
            {/* Diagnóstico en tiempo real */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="bold">
                  🔍 Diagnóstico del Sistema
                </Text>
                <Button
                  size="xs"
                  leftIcon={<Icon as={MdNetworkCheck} />}
                  onClick={runDiagnostics}
                  isLoading={isRunningDiagnostics}
                  colorScheme="blue"
                >
                  Ejecutar Diagnóstico
                </Button>
              </HStack>
              
              {isRunningDiagnostics && (
                <Progress size="sm" isIndeterminate colorScheme="blue" mb={3} />
              )}
              
              {diagnostics && (
                <Accordion allowToggle>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={getStatusIcon(diagnostics.connectivity?.status)} />
                            <Text fontSize="sm" fontWeight="bold">
                              Estado de Conectividad
                            </Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Badge colorScheme={getStatusColor(diagnostics.connectivity?.status)}>
                            {diagnostics.connectivity?.status?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          <Text fontSize="xs">
                            Estrategia: {diagnostics.corsStatus?.corsStrategy || 'N/A'}
                          </Text>
                        </HStack>
                        {diagnostics.connectivity?.error && (
                          <Text fontSize="xs" color="red.500">
                            Error: {diagnostics.connectivity.error}
                          </Text>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={MdInfo} />
                            <Text fontSize="sm" fontWeight="bold">
                              Configuración CORS
                            </Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {corsStatus && (
                        <VStack align="start" spacing={2} fontSize="xs">
                          <HStack>
                            <Text fontWeight="bold">Backend URL:</Text>
                            <Code>{corsStatus.backendConfig?.backendUrl || 'N/A'}</Code>
                          </HStack>
                          <HStack>
                            <Text fontWeight="bold">Credentials Mode:</Text>
                            <Badge colorScheme={corsStatus.credentialsMode === 'include' ? 'green' : 'orange'}>
                              {corsStatus.credentialsMode}
                            </Badge>
                          </HStack>
                          <HStack>
                            <Text fontWeight="bold">Retry Count:</Text>
                            <Text>{corsStatus.retryCount}</Text>
                          </HStack>
                          <HStack>
                            <Text fontWeight="bold">Detecting:</Text>
                            <Text>{corsStatus.isDetecting ? 'Sí' : 'No'}</Text>
                          </HStack>
                        </VStack>
                      )}
                    </AccordionPanel>
                  </AccordionItem>

                  {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Icon as={MdWarning} />
                              <Text fontSize="sm" fontWeight="bold">
                                Recomendaciones ({diagnostics.recommendations.length})
                              </Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack align="start" spacing={2}>
                          {diagnostics.recommendations.map((rec, index) => (
                            <Alert 
                              key={`recommendation-${rec.title}-${index}`}
                              status={rec.type === 'error' ? 'error' : rec.type === 'warning' ? 'warning' : 'info'}
                              size="sm"
                              borderRadius="md"
                            >
                              <AlertIcon />
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" fontWeight="bold">
                                  {rec.message}
                                </Text>
                                <Text fontSize="xs">
                                  {rec.action}
                                </Text>
                              </VStack>
                            </Alert>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  )}
                </Accordion>
              )}
            </Box>

            {/* Características del sistema robusto */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={3}>
                ✨ Características del Sistema Robusto
              </Text>
              <List spacing={2} fontSize="sm">
                <ListItem>
                  <HStack align="start" spacing={3}>
                    <ListIcon as={MdCheckCircle} color="green.500" mt={0.5} />
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontWeight="bold">Detección Automática</Text>
                      <Text fontSize="xs" color="gray.600">
                        Identifica automáticamente la configuración CORS del backend
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack align="start" spacing={3}>
                    <ListIcon as={MdCheckCircle} color="green.500" mt={0.5} />
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontWeight="bold">Adaptación Inteligente</Text>
                      <Text fontSize="xs" color="gray.600">
                        Se adapta dinámicamente a diferentes configuraciones
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack align="start" spacing={3}>
                    <ListIcon as={MdCheckCircle} color="green.500" mt={0.5} />
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontWeight="bold">Estrategias de Fallback</Text>
                      <Text fontSize="xs" color="gray.600">
                        Implementa múltiples estrategias de conexión
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack align="start" spacing={3}>
                    <ListIcon as={MdCheckCircle} color="green.500" mt={0.5} />
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontWeight="bold">Gestión de Credentials</Text>
                      <Text fontSize="xs" color="gray.600">
                        Maneja credentials de manera inteligente según la configuración
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>
              </List>
            </Box>

            {/* Mensaje de éxito */}
            <Alert status="info" size="sm" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" fontWeight="bold">
                  🎯 Sistema Robusto en Funcionamiento
                </Text>
                <Text fontSize="xs">
                  El sistema detecta y se adapta automáticamente a cualquier configuración CORS del backend.
                  No se requieren cambios manuales en el frontend.
                </Text>
              </VStack>
            </Alert>
          </VStack>
        </Collapse>
      </Alert>
    </VStack>
  );
});

RobustCorsStatus.displayName = 'RobustCorsStatus';

export default RobustCorsStatus;


