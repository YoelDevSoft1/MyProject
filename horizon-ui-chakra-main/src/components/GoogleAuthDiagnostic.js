import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  Code, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  HStack,
  Badge,
  Divider
} from '@chakra-ui/react';

const GoogleAuthDiagnostic = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const currentUrl = window.location.href;
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    const allEnvVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'));

    setDebugInfo({
      clientId: clientId || 'NO CONFIGURADO',
      currentUrl: currentUrl,
      origin: origin,
      hostname: hostname,
      port: port,
      protocol: protocol,
      envVars: allEnvVars.map(key => `${key}: ${process.env[key]}`).join(', '),
      userAgent: navigator.userAgent,
      googleAvailable: !!(window.google && window.google.accounts && window.google.accounts.id),
      timestamp: new Date().toISOString()
    });
  }, []);

  const testGoogleStatus = async () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const origin = window.location.origin;
    
    try {
      const response = await fetch(`https://accounts.google.com/gsi/status?client_id=${clientId}&origin=${encodeURIComponent(origin)}`);
      const result = {
        test: 'Google Status Check',
        status: response.status,
        statusText: response.statusText,
        origin: origin,
        clientId: clientId,
        success: response.ok,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, result]);
      console.log('Google status test result:', result);
    } catch (error) {
      const result = {
        test: 'Google Status Check',
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, result]);
      console.error('Google status test error:', error);
    }
  };

  const testGooglePrompt = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          const result = {
            test: 'Google Prompt Test',
            notification: {
              isNotDisplayed: notification.isNotDisplayed(),
              isSkippedMoment: notification.isSkippedMoment(),
              getDismissedReason: notification.getDismissedReason(),
            },
            success: notification.getDismissedReason() === 'credential_returned',
            timestamp: new Date().toISOString()
          };
          
          setTestResults(prev => [...prev, result]);
          console.log('Google prompt test result:', result);
        });
      } catch (error) {
        const result = {
          test: 'Google Prompt Test',
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        };
        
        setTestResults(prev => [...prev, result]);
        console.error('Google prompt test error:', error);
      }
    } else {
      const result = {
        test: 'Google Prompt Test',
        error: 'Google Auth not available',
        success: false,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, result]);
    }
  };

  const testGoogleInitialization = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            const result = {
              test: 'Google Initialization Test',
              response: response ? 'Credential received' : 'No credential',
              success: !!response,
              timestamp: new Date().toISOString()
            };
            
            setTestResults(prev => [...prev, result]);
            console.log('Google initialization test result:', result);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        const result = {
          test: 'Google Initialization Test',
          message: 'Initialization completed',
          success: true,
          timestamp: new Date().toISOString()
        };
        
        setTestResults(prev => [...prev, result]);
      } catch (error) {
        const result = {
          test: 'Google Initialization Test',
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        };
        
        setTestResults(prev => [...prev, result]);
      }
    } else {
      const result = {
        test: 'Google Initialization Test',
        error: 'Google Auth not available',
        success: false,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, result]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Box p={4} border="1px solid" borderColor="blue.200" borderRadius="md" bg="blue.50">
      <VStack spacing={4} align="start">
        <Text fontWeight="bold" color="blue.600" fontSize="lg">
          🔍 Google OAuth Diagnostic Tool
        </Text>

        {/* Debug Info */}
        <Box w="100%">
          <Text fontWeight="semibold" mb={2}>Environment Information:</Text>
          <Code p={2} bg="gray.100" borderRadius="md" w="100%" fontSize="xs">
            <VStack align="start" spacing={1}>
              <Text>Client ID: {debugInfo.clientId}</Text>
              <Text>Current URL: {debugInfo.currentUrl}</Text>
              <Text>Origin: {debugInfo.origin}</Text>
              <Text>Hostname: {debugInfo.hostname}</Text>
              <Text>Port: {debugInfo.port}</Text>
              <Text>Protocol: {debugInfo.protocol}</Text>
              <Text>Google Available: {debugInfo.googleAvailable ? '✅' : '❌'}</Text>
              <Text>Timestamp: {debugInfo.timestamp}</Text>
            </VStack>
          </Code>
        </Box>

        {/* Test Buttons */}
        <HStack spacing={2} wrap="wrap">
          <Button onClick={testGoogleStatus} colorScheme="blue" size="sm">
            Test Google Status
          </Button>
          <Button onClick={testGooglePrompt} colorScheme="green" size="sm">
            Test Google Prompt
          </Button>
          <Button onClick={testGoogleInitialization} colorScheme="purple" size="sm">
            Test Initialization
          </Button>
          <Button onClick={clearResults} colorScheme="gray" size="sm">
            Clear Results
          </Button>
        </HStack>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Box w="100%">
            <Text fontWeight="semibold" mb={2}>Test Results:</Text>
            <VStack spacing={2} align="start">
              {testResults.map((result, index) => (
                <Alert 
                  key={index} 
                  status={result.success ? "success" : "error"} 
                  borderRadius="md"
                  fontSize="sm"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">
                      {result.test} {result.success ? '✅' : '❌'}
                    </AlertTitle>
                    <AlertDescription fontSize="xs">
                      <VStack align="start" spacing={1}>
                        {result.status && <Text>Status: {result.status} {result.statusText}</Text>}
                        {result.error && <Text>Error: {result.error}</Text>}
                        {result.message && <Text>Message: {result.message}</Text>}
                        {result.response && <Text>Response: {result.response}</Text>}
                        {result.notification && (
                          <Text>Notification: {JSON.stringify(result.notification)}</Text>
                        )}
                        <Text>Time: {result.timestamp}</Text>
                      </VStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default GoogleAuthDiagnostic;
