import React, { useEffect, useState, useCallback } from 'react';
import { Button, HStack, Text, Icon, useToast, Spinner } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

const GoogleAuthTraditional = ({ onSuccess, onError, isLoading, disabled }) => {
  const toast = useToast();
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);

  const handleCredentialResponse = useCallback((response) => {
    try {
      console.log('Google credential response received (traditional):', response);
      
      if (!response || !response.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Decodificar el JWT token
      const parts = response.credential.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('Decoded Google payload (traditional):', payload);
      
      const userData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        email_verified: payload.email_verified,
      };

      console.log('Google user data (traditional):', userData);
      onSuccess(userData);
    } catch (error) {
      console.error('Error decoding Google token (traditional):', error);
      onError('Error al procesar la respuesta de Google: ' + error.message);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      onError('Google Client ID no configurado');
      setIsLoadingGoogle(false);
      return;
    }

    // Cargar script de Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          // Configuración completamente tradicional sin FedCM
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            // Configuración mínima tradicional
            context: 'signin',
            // Sin FedCM, sin ITP support
            itp_support: false,
            use_fedcm_for_prompt: false,
            // Configuración básica
            ux_mode: 'popup',
            scope: 'openid email profile',
          });
          setIsGoogleReady(true);
          console.log('Google Auth initialized successfully (traditional method)');
        } catch (error) {
          console.error('Error initializing Google Auth (traditional):', error);
          onError('Error al inicializar Google Auth: ' + error.message);
        }
      } else {
        onError('Google accounts no disponible');
      }
      setIsLoadingGoogle(false);
    };

    script.onerror = () => {
      onError('Error cargando script de Google');
      setIsLoadingGoogle(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onError, handleCredentialResponse]);

  const handleGoogleLogin = () => {
    if (!isGoogleReady) {
      toast({
        title: "Error",
        description: "Google Auth aún no está listo. Espera un momento e intenta de nuevo.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        // Método tradicional sin callback de notificación
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Error showing Google prompt (traditional):', error);
        onError('Error al mostrar el popup de Google: ' + error.message);
      }
    } else {
      onError('Google Auth no está disponible. Recarga la página e intenta de nuevo.');
    }
  };

  if (isLoadingGoogle) {
    return (
      <Button
        isDisabled={true}
        variant="outline"
        size="lg"
        w="100%"
        colorScheme="gray"
      >
        <HStack spacing={3}>
          <Spinner size="sm" />
          <Text>Cargando Google Auth (tradicional)...</Text>
        </HStack>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      isLoading={isLoading}
      isDisabled={disabled || !isGoogleReady}
      variant="outline"
      size="lg"
      w="100%"
      colorScheme="green"
      _hover={{
        bg: "green.50",
        borderColor: "green.300",
      }}
    >
      <HStack spacing={3}>
        <Icon as={FcGoogle} w={6} h={6} />
        <Text>
          {isGoogleReady ? "Continuar con Google (Tradicional)" : "Google Auth no disponible"}
        </Text>
      </HStack>
    </Button>
  );
};

export default GoogleAuthTraditional;
