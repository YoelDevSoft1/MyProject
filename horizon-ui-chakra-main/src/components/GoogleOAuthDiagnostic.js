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
  Divider,
  Progress,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { FcGoogle, FcOk, FcCancel } from 'react-icons/fc';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';

const GoogleOAuthDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const addDiagnostic = (test, status, message, details = null) => {
    setDiagnostics(prev => [...prev, {
      id: Date.now() + Math.random(),
      test,
      status, // 'pass', 'fail', 'warning', 'info'
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    setDiagnostics([]);

    const tests = [
      { name: 'Environment Variables', weight: 10 },
      { name: 'Google Script Loading', weight: 20 },
      { name: 'Google API Availability', weight: 20 },
      { name: 'Client ID Configuration', weight: 15 },
      { name: 'Origin Validation', weight: 15 },
      { name: 'Token Retrieval Test', weight: 20 }
    ];

    let currentProgress = 0;

    // Test 1: Environment Variables
    addDiagnostic('Environment Variables', 'info', 'Checking environment variables...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (clientId) {
      addDiagnostic('Environment Variables', 'pass', 'Client ID found in environment', clientId);
    } else {
      addDiagnostic('Environment Variables', 'fail', 'Client ID not found in environment', 'REACT_APP_GOOGLE_CLIENT_ID is undefined');
    }
    
    currentProgress += tests[0].weight;
    setProgress(currentProgress);

    // Test 2: Google Script Loading
    addDiagnostic('Google Script Loading', 'info', 'Checking Google script availability...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (window.google && window.google.accounts) {
      addDiagnostic('Google Script Loading', 'pass', 'Google script loaded successfully');
    } else {
      addDiagnostic('Google Script Loading', 'fail', 'Google script not loaded', 'window.google.accounts is undefined');
    }
    
    currentProgress += tests[1].weight;
    setProgress(currentProgress);

    // Test 3: Google API Availability
    addDiagnostic('Google API Availability', 'info', 'Checking Google API methods...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (window.google?.accounts?.id) {
      addDiagnostic('Google API Availability', 'pass', 'Google Identity API available');
    } else {
      addDiagnostic('Google API Availability', 'fail', 'Google Identity API not available', 'window.google.accounts.id is undefined');
    }
    
    currentProgress += tests[2].weight;
    setProgress(currentProgress);

    // Test 4: Client ID Configuration
    addDiagnostic('Client ID Configuration', 'info', 'Validating Client ID format...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (clientId && clientId.includes('.apps.googleusercontent.com')) {
      addDiagnostic('Client ID Configuration', 'pass', 'Client ID format is valid', clientId);
    } else {
      addDiagnostic('Client ID Configuration', 'fail', 'Client ID format is invalid', clientId || 'undefined');
    }
    
    currentProgress += tests[3].weight;
    setProgress(currentProgress);

    // Test 5: Origin Validation
    addDiagnostic('Origin Validation', 'info', 'Checking origin configuration...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentOrigin = window.location.origin;
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(currentOrigin)) {
      addDiagnostic('Origin Validation', 'pass', 'Current origin is in allowed list', currentOrigin);
    } else {
      addDiagnostic('Origin Validation', 'warning', 'Current origin may not be configured in Google Console', currentOrigin);
    }
    
    currentProgress += tests[4].weight;
    setProgress(currentProgress);

    // Test 6: Token Retrieval Test
    addDiagnostic('Token Retrieval Test', 'info', 'Testing token retrieval...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (window.google?.accounts?.id && clientId) {
        // Simular inicialización para test
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response && response.credential) {
              addDiagnostic('Token Retrieval Test', 'pass', 'Token retrieval simulation successful');
            } else {
              addDiagnostic('Token Retrieval Test', 'fail', 'Token retrieval simulation failed', 'No credential in response');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });
        addDiagnostic('Token Retrieval Test', 'pass', 'Google OAuth initialized successfully');
      } else {
        addDiagnostic('Token Retrieval Test', 'fail', 'Cannot test token retrieval', 'Missing Google API or Client ID');
      }
    } catch (error) {
      addDiagnostic('Token Retrieval Test', 'fail', 'Token retrieval test failed', error.message);
    }
    
    currentProgress += tests[5].weight;
    setProgress(currentProgress);

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckIcon color="green.500" />;
      case 'fail': return <WarningIcon color="red.500" />;
      case 'warning': return <WarningIcon color="yellow.500" />;
      default: return <CheckIcon color="blue.500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'green';
      case 'fail': return 'red';
      case 'warning': return 'yellow';
      default: return 'blue';
    }
  };

  const getRecommendations = () => {
    const failedTests = diagnostics.filter(d => d.status === 'fail');
    const warnings = diagnostics.filter(d => d.status === 'warning');
    
    const recommendations = [];
    
    if (failedTests.some(d => d.test === 'Environment Variables')) {
      recommendations.push('Create .env file with REACT_APP_GOOGLE_CLIENT_ID');
    }
    
    if (failedTests.some(d => d.test === 'Google Script Loading')) {
      recommendations.push('Check internet connection and Google services availability');
    }
    
    if (failedTests.some(d => d.test === 'Client ID Configuration')) {
      recommendations.push('Verify Client ID in Google Cloud Console');
    }
    
    if (warnings.some(d => d.test === 'Origin Validation')) {
      recommendations.push('Add current origin to Google Cloud Console authorized origins');
    }
    
    if (failedTests.some(d => d.test === 'Token Retrieval Test')) {
      recommendations.push('Check Google Cloud Console configuration and CORS settings');
    }
    
    return recommendations;
  };

  useEffect(() => {
    // Auto-run diagnostics on mount
    runDiagnostics();
  }, []);

  return (
    <Box p={6} maxW="1000px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          🔍 Google OAuth Diagnostic Tool
        </Text>

        {/* Progress Bar */}
        {isRunning && (
          <Box>
            <Text mb={2}>Running diagnostics...</Text>
            <Progress value={progress} colorScheme="blue" />
          </Box>
        )}

        {/* Control Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            onClick={runDiagnostics}
            isLoading={isRunning}
            leftIcon={<FcGoogle />}
            colorScheme="blue"
            size="lg"
          >
            Run Diagnostics
          </Button>
          
          <Button
            onClick={() => setDiagnostics([])}
            colorScheme="gray"
            size="lg"
          >
            Clear Results
          </Button>
        </HStack>

        <Divider />

        {/* Diagnostic Results */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Diagnostic Results:
          </Text>
          
          <VStack spacing={3} align="stretch">
            {diagnostics.map((diagnostic) => (
              <Alert
                key={diagnostic.id}
                status={getStatusColor(diagnostic.status)}
                variant="left-accent"
              >
                <ListIcon as={getStatusIcon(diagnostic.status)} />
                <VStack align="start" spacing={1} w="100%">
                  <HStack justify="space-between" w="100%">
                    <Text fontWeight="bold">{diagnostic.test}</Text>
                    <Badge colorScheme={getStatusColor(diagnostic.status)}>
                      {diagnostic.status.toUpperCase()}
                    </Badge>
                  </HStack>
                  <Text>{diagnostic.message}</Text>
                  {diagnostic.details && (
                    <Code fontSize="xs" p={2} w="100%">
                      {diagnostic.details}
                    </Code>
                  )}
                  <Text fontSize="xs" color="gray.500">
                    {diagnostic.timestamp}
                  </Text>
                </VStack>
              </Alert>
            ))}
          </VStack>
        </Box>

        {/* Recommendations */}
        {diagnostics.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Recommendations:
            </Text>
            
            <List spacing={2}>
              {getRecommendations().map((rec, index) => (
                <ListItem key={index}>
                  <ListIcon as={CheckIcon} color="blue.500" />
                  {rec}
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Environment Info */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Environment Information:
          </Text>
          
          <Code p={4} w="100%" fontSize="sm">
            <pre>
{JSON.stringify({
  origin: window.location.origin,
  userAgent: navigator.userAgent.substring(0, 100),
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
  googleAvailable: !!(window.google && window.google.accounts),
  timestamp: new Date().toISOString()
}, null, 2)}
            </pre>
          </Code>
        </Box>
      </VStack>
    </Box>
  );
};

export default GoogleOAuthDiagnostic;
