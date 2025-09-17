import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  Text, 
  Alert, 
  AlertIcon, 
  HStack,
  Badge,
  Code,
  Divider
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import GoogleAuthImproved from './GoogleAuthImproved';
import GoogleAuthFallback from './GoogleAuthFallback';

const GoogleAuthTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (type, message, success = true) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleGoogleSuccess = (userData) => {
    addTestResult('success', `Login exitoso: ${userData.email}`, true);
    setIsLoading(false);
  };

  const handleGoogleError = (error) => {
    addTestResult('error', `Error: ${error}`, false);
    
    // Si es el error específico, activar fallback
    if (error.includes('reasons.join') || error.includes('is not a function')) {
      addTestResult('info', 'Activando modo de compatibilidad...', true);
      setUseFallback(true);
    }
    
    setIsLoading(false);
  };

  const testGoogleAuth = () => {
    setIsLoading(true);
    addTestResult('info', 'Iniciando prueba de Google OAuth...', true);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const resetToImproved = () => {
    setUseFallback(false);
    addTestResult('info', 'Cambiando a modo mejorado...', true);
  };

  useEffect(() => {
    // Información del entorno
    addTestResult('info', `Entorno: ${process.env.NODE_ENV}`, true);
    addTestResult('info', `Client ID: ${process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'Configurado' : 'No configurado'}`, true);
    addTestResult('info', `Origen: ${window.location.origin}`, true);
    addTestResult('info', `User Agent: ${navigator.userAgent.substring(0, 50)}...`, true);
  }, []);

  return (
    <Box p={6} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          🧪 Test de Google OAuth - SMD VITAL
        </Text>

        {/* Información del estado */}
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Estado Actual:</Text>
            <HStack>
              <Badge colorScheme={useFallback ? "orange" : "blue"}>
                {useFallback ? "Modo Compatibilidad" : "Modo Mejorado"}
              </Badge>
              <Badge colorScheme={isLoading ? "yellow" : "green"}>
                {isLoading ? "Cargando..." : "Listo"}
              </Badge>
            </HStack>
          </VStack>
        </Alert>

        {/* Controles de prueba */}
        <HStack spacing={4} justify="center">
          <Button
            onClick={testGoogleAuth}
            isLoading={isLoading}
            leftIcon={<FcGoogle />}
            colorScheme="blue"
            size="lg"
          >
            Probar Google OAuth
          </Button>
          
          <Button
            onClick={resetToImproved}
            isDisabled={!useFallback}
            colorScheme="green"
            size="lg"
          >
            Usar Modo Mejorado
          </Button>
          
          <Button
            onClick={clearResults}
            colorScheme="gray"
            size="lg"
          >
            Limpiar Resultados
          </Button>
        </HStack>

        <Divider />

        {/* Componente de Google Auth */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Componente de Google OAuth:
          </Text>
          
          {useFallback ? (
            <GoogleAuthFallback
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              isLoading={isLoading}
              disabled={isLoading}
            />
          ) : (
            <GoogleAuthImproved
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              isLoading={isLoading}
              disabled={isLoading}
            />
          )}
        </Box>

        <Divider />

        {/* Resultados de las pruebas */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Resultados de las Pruebas:
          </Text>
          
          <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
            {testResults.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No hay resultados de prueba aún
              </Text>
            ) : (
              testResults.map((result) => (
                <Alert
                  key={result.id}
                  status={result.success ? "success" : "error"}
                  fontSize="sm"
                >
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Badge colorScheme={result.success ? "green" : "red"}>
                        {result.type.toUpperCase()}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {result.timestamp}
                      </Text>
                    </HStack>
                    <Text>{result.message}</Text>
                  </VStack>
                </Alert>
              ))
            )}
          </VStack>
        </Box>

        {/* Información de debug */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Información de Debug:
          </Text>
          
          <Code p={4} w="100%" fontSize="sm">
            <pre>
{JSON.stringify({
  environment: process.env.NODE_ENV,
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'Configurado' : 'No configurado',
  origin: window.location.origin,
  userAgent: navigator.userAgent.substring(0, 100),
  googleAvailable: !!(window.google && window.google.accounts),
  fallbackMode: useFallback,
  testResultsCount: testResults.length
}, null, 2)}
            </pre>
          </Code>
        </Box>
      </VStack>
    </Box>
  );
};

export default GoogleAuthTest;