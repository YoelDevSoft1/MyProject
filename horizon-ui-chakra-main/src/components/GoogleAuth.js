import React, { useEffect, useState } from 'react';
import { Button, HStack, Text, Icon, useToast } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

const GoogleAuth = ({ onSuccess, onError, isLoading, disabled }) => {
  const toast = useToast();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Cargar el script de Google OAuth
    const loadGoogleScript = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleAuth();
        return;
      }

      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.onload = initializeGoogleAuth;
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google script loaded');
        initializeGoogleAuth();
      };
      script.onerror = () => {
        console.error('Error loading Google script');
        onError('Error al cargar Google Auth');
      };
      document.head.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setIsGoogleLoaded(true);
          console.log('Google Auth initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Auth:', error);
          onError('Error al inicializar Google Auth');
        }
      } else {
        console.error('Google accounts not available');
        onError('Google Auth no está disponible');
      }
    };

    loadGoogleScript();

    return () => {
      // Cleanup si es necesario
    };
  }, [onError]);

  const handleCredentialResponse = (response) => {
    try {
      console.log('Google credential response received');
      // Decodificar el JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const userData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        email_verified: payload.email_verified,
      };

      console.log('Google user data:', userData);
      onSuccess(userData);
    } catch (error) {
      console.error('Error decoding Google token:', error);
      onError('Error al procesar la respuesta de Google');
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login button clicked');
    console.log('Google loaded:', isGoogleLoaded);
    console.log('Google object:', window.google);
    
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          console.log('Google prompt notification:', notification);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // El popup no se mostró o fue cancelado
            console.log('Google login popup not displayed or skipped');
            onError('No se pudo mostrar el popup de Google. Verifica que no tengas bloqueadores de popup.');
          }
        });
      } catch (error) {
        console.error('Error showing Google prompt:', error);
        onError('Error al mostrar el popup de Google');
      }
    } else {
      console.error('Google Auth not available');
      toast({
        title: "Error",
        description: "Google Auth no está disponible. Intenta recargar la página.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      isLoading={isLoading}
      isDisabled={disabled}
      variant="outline"
      size="lg"
      w="100%"
      colorScheme="gray"
      _hover={{
        bg: "gray.50",
        borderColor: "gray.300",
      }}
    >
      <HStack spacing={3}>
        <Icon as={FcGoogle} w={6} h={6} />
        <Text>Continuar con Google</Text>
      </HStack>
    </Button>
  );
};

export default GoogleAuth;
