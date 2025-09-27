import React from 'react';
import { 
  Box, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  VStack,
  Text,
  Badge,
  Code,
  Divider
} from '@chakra-ui/react';

/**
 * Componente que muestra el estado de la solución temporal de CORS
 */
const CorsTemporaryFix = () => {
  return (
    <Box mb={4}>
      <Alert status="warning" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>🔧 Solución Temporal CORS</AlertTitle>
          <AlertDescription>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm">
                Se ha implementado una solución temporal para el problema de CORS con Google Login.
              </Text>
              
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Cambios realizados:</Text>
                <VStack align="start" spacing={1} fontSize="xs">
                  <Text>• <Code>credentials: 'omit'</Code> para Google login</Text>
                  <Text>• Evita conflicto con wildcard <Code>*</Code> del backend</Text>
                  <Text>• Login de Google funcionará sin cookies</Text>
                </VStack>
              </Box>

              <Divider />

              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={1}>Para el backend:</Text>
                <Text fontSize="xs" color="orange.600">
                  Cambiar <Code>allow_origins=["*"]</Code> por <Code>allow_origins=["http://localhost:3001"]</Code>
                </Text>
              </Box>

              <Badge colorScheme="orange" size="sm">
                Solución Temporal
              </Badge>
            </VStack>
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export default CorsTemporaryFix;


