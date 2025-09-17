import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Badge, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import userIssueDiagnostic from '../utils/diagnoseUserIssue';
import tokenDebugger from '../utils/debugToken';

const UserDisplayTest = () => {
  const { user, token } = useAuth();
  const [testData, setTestData] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    if (token) {
      testUserTransformation();
    }
  }, [token]);

  const testUserTransformation = async () => {
    try {
      const response = await userService.getUserProfile(token);
      if (response.success) {
        setTestData(response.data);
      }
    } catch (error) {
      console.error('Error testing user transformation:', error);
    }
  };

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const result = await userIssueDiagnostic.runDiagnostic();
      setDiagnosticResult(result);
    } catch (error) {
      console.error('Error running diagnostic:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const debugToken = async () => {
    try {
      const success = await tokenDebugger.runDiagnostic();
      const info = tokenDebugger.getTokenInfo();
      setTokenInfo(info);
      
      if (success) {
        console.log('✅ Debug de token completado exitosamente');
      } else {
        console.log('❌ Debug de token encontró problemas');
      }
    } catch (error) {
      console.error('Error debugging token:', error);
    }
  };

  const testCases = [
    {
      name: 'Google Auth Data',
      data: {
        id: '1',
        email: 'juan.perez@gmail.com',
        given_name: 'Juan',
        family_name: 'Pérez',
        name: 'Juan Pérez',
        google_id: 'google_123',
        role: 'user'
      }
    },
    {
      name: 'Traditional Auth Data',
      data: {
        id: '2',
        email: 'maria.garcia@smdvital.com',
        first_name: 'María',
        last_name: 'García',
        username: 'maria.garcia',
        role: 'doctor'
      }
    },
    {
      name: 'Minimal Data',
      data: {
        id: '3',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user'
      }
    }
  ];

  return (
    <Box p={4} border="1px" borderColor="gray.200" borderRadius="md" m={4}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>User Display Test & Diagnostic</Text>
      
      {/* Diagnostic Results */}
      {diagnosticResult && (
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>Diagnóstico del Sistema:</Text>
          {diagnosticResult.hasIssues ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Problemas detectados!</AlertTitle>
                <AlertDescription>
                  Se encontraron {diagnosticResult.issues.length} problema(s). 
                  Revisa la consola para más detalles.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Alert status="success" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Sistema funcionando correctamente</AlertTitle>
                <AlertDescription>
                  No se encontraron problemas en el diagnóstico.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>
      )}
      
      {/* Token Information */}
      {tokenInfo && (
        <VStack align="start" spacing={2} mb={6}>
          <Text fontWeight="bold">Token JWT Information:</Text>
          <Box p={3} bg="gray.50" borderRadius="md" w="100%">
            <Text fontSize="sm">User ID: {tokenInfo.userId || 'N/A'}</Text>
            <Text fontSize="sm">Email: {tokenInfo.email || 'N/A'}</Text>
            <Text fontSize="sm">Role: {tokenInfo.role || 'N/A'}</Text>
            <Text fontSize="sm">Expires: {tokenInfo.expDate || 'N/A'}</Text>
            <Text fontSize="sm" color={tokenInfo.isExpired ? 'red.500' : 'green.500'}>
              Status: {tokenInfo.isExpired ? 'EXPIRED' : 'VALID'}
            </Text>
          </Box>
        </VStack>
      )}

      {/* Current User from Context */}
      <VStack align="start" spacing={2} mb={6}>
        <Text fontWeight="bold">Current User (from AuthContext):</Text>
        <HStack>
          <Text>Name: {user?.name || 'No name'}</Text>
          <Badge colorScheme="blue">{user?.role || 'No role'}</Badge>
        </HStack>
        <Text fontSize="sm" color="gray.600">Email: {user?.email || 'No email'}</Text>
      </VStack>

      {/* Test Data from Backend */}
      {testData && (
        <VStack align="start" spacing={2} mb={6}>
          <Text fontWeight="bold">Test Data (from Backend):</Text>
          <HStack>
            <Text>Name: {testData.name || 'No name'}</Text>
            <Badge colorScheme="green">{testData.role || 'No role'}</Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600">Email: {testData.email || 'No email'}</Text>
        </VStack>
      )}

      {/* Test Cases */}
      <VStack align="start" spacing={4}>
        <Text fontWeight="bold">Transformation Test Cases:</Text>
        {testCases.map((testCase, index) => {
          const transformed = userService.transformUserProfile(testCase.data);
          return (
            <Box key={index} p={3} border="1px" borderColor="gray.300" borderRadius="md" w="100%">
              <Text fontWeight="bold" mb={2}>{testCase.name}</Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">Original: {JSON.stringify(testCase.data, null, 2)}</Text>
                <Text fontSize="sm" color="blue.600">
                  Transformed Name: "{transformed?.name || 'No name'}"
                </Text>
                <Text fontSize="sm" color="green.600">
                  First Name: "{transformed?.first_name || 'No first name'}"
                </Text>
                <Text fontSize="sm" color="green.600">
                  Last Name: "{transformed?.last_name || 'No last name'}"
                </Text>
              </VStack>
            </Box>
          );
        })}
      </VStack>

      <HStack spacing={4} mt={4}>
        <Button onClick={testUserTransformation} colorScheme="blue" size="sm">
          Refresh Test Data
        </Button>
        <Button 
          onClick={runDiagnostic} 
          colorScheme="orange" 
          size="sm"
          isLoading={isRunningDiagnostic}
          loadingText="Ejecutando..."
        >
          Ejecutar Diagnóstico
        </Button>
        <Button 
          onClick={debugToken} 
          colorScheme="purple" 
          size="sm"
        >
          Debug Token JWT
        </Button>
      </HStack>
    </Box>
  );
};

export default UserDisplayTest;
