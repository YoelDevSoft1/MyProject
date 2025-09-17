import React, { useState } from 'react';
import { Button, VStack, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

const GoogleTest = () => {
  const [status, setStatus] = useState('');

  const handleTest = () => {
    setStatus('Botón clickeado correctamente');
    console.log('Test button clicked');
    console.log('Environment variables:', {
      REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    });
    console.log('Window Google:', window.google);
  };

  return (
    <VStack spacing={4} p={4}>
      <Text fontSize="lg" fontWeight="bold">
        Test de Google OAuth
      </Text>
      
      <Button
        onClick={handleTest}
        leftIcon={<FcGoogle />}
        colorScheme="blue"
        size="lg"
      >
        Test Button
      </Button>

      {status && (
        <Alert status="success">
          <AlertIcon />
          {status}
        </Alert>
      )}

      <Text fontSize="sm" color="gray.600">
        Client ID: {process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'Configurado' : 'No configurado'}
      </Text>
    </VStack>
  );
};

export default GoogleTest;

