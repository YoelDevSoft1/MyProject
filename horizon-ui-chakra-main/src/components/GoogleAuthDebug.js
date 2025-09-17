import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Button, Alert, AlertIcon, Code } from '@chakra-ui/react';

const GoogleAuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    setDebugInfo({
      clientId,
      currentUrl: window.location.href,
      origin: window.location.origin,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port,
      userAgent: navigator.userAgent,
      allEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')),
    });
  }, []);

  const testGoogleAuth = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        // Probar la inicialización
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: (response) => {
            console.log('Test response:', response);
            setTestResult({ success: true, response });
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        // Probar el prompt
        window.google.accounts.id.prompt((notification) => {
          console.log('Test notification:', notification);
          setTestResult({ 
            success: true, 
            notification: {
              isNotDisplayed: notification.isNotDisplayed(),
              isSkippedMoment: notification.isSkippedMoment(),
              getDismissedReason: notification.getDismissedReason(),
            }
          });
        });
      } catch (error) {
        console.error('Test error:', error);
        setTestResult({ success: false, error: error.message });
      }
    } else {
      setTestResult({ success: false, error: 'Google accounts not available' });
    }
  };

  const checkGoogleStatus = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const origin = window.location.origin;
    
    // Hacer una petición directa al endpoint de status de Google
    fetch(`https://accounts.google.com/gsi/status?client_id=${clientId}&origin=${encodeURIComponent(origin)}`)
      .then(response => {
        console.log('Google status response:', response.status, response.statusText);
        setTestResult({ 
          success: response.ok, 
          status: response.status,
          statusText: response.statusText,
          origin: origin,
          clientId: clientId
        });
      })
      .catch(error => {
        console.error('Google status error:', error);
        setTestResult({ success: false, error: error.message });
      });
  };

  return (
    <Box p={4} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50">
      <VStack spacing={4} align="start">
        <Text fontWeight="bold" color="red.600">🔍 Google OAuth Debug</Text>
        
        <Box>
          <Text fontWeight="semibold">Información del Cliente:</Text>
          <Code p={2} bg="gray.100" borderRadius="md" w="100%">
            <Text>Client ID: {debugInfo.clientId || 'NO CONFIGURADO'}</Text>
            <Text>URL Actual: {debugInfo.currentUrl}</Text>
            <Text>Origin: {debugInfo.origin}</Text>
            <Text>Protocol: {debugInfo.protocol}</Text>
            <Text>Hostname: {debugInfo.hostname}</Text>
            <Text>Port: {debugInfo.port}</Text>
          </Code>
        </Box>

        <Box>
          <Text fontWeight="semibold">Variables de Entorno:</Text>
          <Code p={2} bg="gray.100" borderRadius="md" w="100%">
            <Text>REACT_APP_*: {debugInfo.allEnvVars?.join(', ') || 'NINGUNA'}</Text>
          </Code>
        </Box>

        <Button onClick={testGoogleAuth} colorScheme="blue" size="sm">
          Probar Google Auth
        </Button>
        
        <Button onClick={checkGoogleStatus} colorScheme="green" size="sm">
          Verificar Status Google
        </Button>

        {testResult && (
          <Alert status={testResult.success ? "success" : "error"}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">
                {testResult.success ? "✅ Prueba Exitosa" : "❌ Error en Prueba"}
              </Text>
              <Code p={2} bg="white" borderRadius="md" mt={2} w="100%">
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              </Code>
            </Box>
          </Alert>
        )}

        <Box>
          <Text fontWeight="semibold">Configuración Requerida en Google Cloud Console:</Text>
          <Code p={2} bg="yellow.100" borderRadius="md" w="100%">
            <Text>Orígenes autorizados de JavaScript:</Text>
            <Text>• {debugInfo.origin}</Text>
            <Text>• http://127.0.0.1:{debugInfo.port}</Text>
            <Text>• http://localhost:{debugInfo.port}</Text>
            <Text>• http://127.0.0.1:3000</Text>
            <Text>• http://localhost:3000</Text>
          </Code>
        </Box>
      </VStack>
    </Box>
  );
};

export default GoogleAuthDebug;
