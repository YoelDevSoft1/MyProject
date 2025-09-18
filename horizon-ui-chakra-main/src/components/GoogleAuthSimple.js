// SMD VITAL - Google Auth Simple Component
import React, { useEffect, useState } from 'react';
import { Button, HStack, Text, Icon, useToast, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

const GoogleAuthSimple = ({ onSuccess, onError, isLoading, disabled }) => {
  const toast = useToast();
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com';
    
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeGoogle = () => {
      try {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin',
            itp_support: false,
            ux_mode: 'popup',
            scope: 'openid email profile',
          });
          setIsGoogleReady(true);
          console.log('Google Auth Simple initialized successfully');
        } else {
          throw new Error('Google accounts not available');
        }
      } catch (error) {
        console.error('Error initializing Google Auth Simple:', error);
        onError('Error al inicializar Google Auth: ' + error.message);
      } finally {
        setIsLoadingGoogle(false);
      }
    };

    loadGoogleScript()
      .then(initializeGoogle)
      .catch((error) => {
        console.error('Error loading Google script:', error);
        onError('Error al cargar Google Auth: ' + error.message);
        setIsLoadingGoogle(false);
      });
  }, [onError]);

  const handleCredentialResponse = (response) => {
    try {
      console.log('Google credential response received (simple):', response);
      
      if (!response || !response.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Decodificar el JWT token
      const parts = response.credential.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('Decoded Google payload (simple):', payload);
      
      const userData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        email_verified: payload.email_verified,
      };

      console.log('Google user data (simple):', userData);
      onSuccess(userData);
    } catch (error) {
      console.error('Error decoding Google token (simple):', error);
      onError('Error al procesar la respuesta de Google: ' + error.message);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login button clicked (simple)');
    
    if (!isGoogleReady) {
      onError('Google Auth no está listo aún');
      return;
    }

    try {
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification (simple):', notification);
      });
    } catch (error) {
      console.error('Error showing Google prompt (simple):', error);
      onError('Error al mostrar el prompt de Google: ' + error.message);
    }
  };

  if (isLoadingGoogle) {
    return (
      <HStack spacing={2} justify="center">
        <Spinner size="sm" />
        <Text fontSize="sm" color="gray.500">
          Cargando Google Auth...
        </Text>
      </HStack>
    );
  }

  if (!isGoogleReady) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text fontSize="sm">
          Error al cargar Google Auth. Intenta recargar la página.
        </Text>
      </Alert>
    );
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      loadingText="Iniciando sesión..."
      w="100%"
      h="50px"
      variant="outline"
      borderColor="gray.300"
      _hover={{
        bg: "gray.50",
        borderColor: "gray.400"
      }}
      _active={{
        bg: "gray.100"
      }}
    >
      <HStack spacing={3}>
        <Icon as={FcGoogle} boxSize={5} />
        <Text fontSize="sm" fontWeight="500">
          {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
        </Text>
      </HStack>
    </Button>
  );
};

export default GoogleAuthSimple;