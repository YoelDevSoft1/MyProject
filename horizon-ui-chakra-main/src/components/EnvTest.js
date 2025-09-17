import React from 'react';
import { Box, Text, VStack, Code } from '@chakra-ui/react';

const EnvTest = () => {
  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <VStack align="start" spacing={2}>
        <Text fontWeight="bold">Variables de Entorno:</Text>
        <Code p={2} bg="gray.100" borderRadius="md" w="100%">
          <Text>NODE_ENV: {process.env.NODE_ENV}</Text>
          <Text>REACT_APP_GOOGLE_CLIENT_ID: {process.env.REACT_APP_GOOGLE_CLIENT_ID || 'NO CONFIGURADO'}</Text>
          <Text>REACT_APP_API_URL: {process.env.REACT_APP_API_URL || 'NO CONFIGURADO'}</Text>
        </Code>
        <Text fontSize="sm" color="gray.600">
          Todas las variables REACT_APP_*: {Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')).join(', ')}
        </Text>
      </VStack>
    </Box>
  );
};

export default EnvTest;

