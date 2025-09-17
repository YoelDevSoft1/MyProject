import React, { useEffect, useState, useCallback } from 'react';
import { Button, HStack, Text, Icon, useToast, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

const GoogleAuthFallback = ({ onSuccess, onError, isLoading, disabled }) => {
  const toast = useToast();
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);

  const handleCredentialResponse = useCallback((response) => {
    try {
      console.log('Google credential response received (fallback):', response);
      
      if (!response || !response.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Decodificar el JWT token
      const parts = response.credential.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('Decoded Google payload (fallback):', payload);
      
      const userData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        email_verified: payload.email_verified,
      };

      console.log('Google user data (fallback):', userData);
      onSuccess(userData);
    } catch (error) {
      console.error('Error decoding Google token (fallback):', error);
      onError('Error al procesar la respuesta de Google: ' + error.message);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com';
    
    console.log('Google Auth Fallback - Client ID:', clientId);
    
    if (!clientId) {
      console.error('Google Client ID not found');
      onError('Google Client ID no configurado');
      setIsLoadingGoogle(false);
      return;
    }

    // Función para cargar el script de Google
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (window.google && window.google.accounts) {
          resolve();
          return;
        }

        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
          existingScript.addEventListener('load', resolve);
          existingScript.addEventListener('error', reject);
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

    // Función para inicializar Google Auth con configuración mínima
    const initializeGoogle = () => {
      try {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          // Configuración mínima y estable
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            // Configuración básica sin APIs avanzadas
            context: 'signin',
            itp_support: false,
            ux_mode: 'popup',
            scope: 'openid email profile',
          });
          setIsGoogleReady(true);
          console.log('Google Auth Fallback initialized successfully');
        } else {
          throw new Error('Google accounts not available');
        }
      } catch (error) {
        console.error('Error initializing Google Auth Fallback:', error);
        onError('Error al inicializar Google Auth: ' + error.message);
      } finally {
        setIsLoadingGoogle(false);
      }
    };

    // Cargar e inicializar
    loadGoogleScript()
      .then(initializeGoogle)
      .catch((error) => {
        console.error('Error loading Google script (fallback):', error);
        onError('Error al cargar Google Auth: ' + error.message);
        setIsLoadingGoogle(false);
      });
  }, [onError, handleCredentialResponse]);

  const handleGoogleLogin = () => {
    console.log('Google login button clicked (fallback)');
    
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
        // Usar el método más simple y estable
        window.google.accounts.id.prompt((notification) => {
          console.log('Google prompt notification (fallback):', notification);
          
          // Manejo simplificado de notificaciones
          if (notification.isNotDisplayed()) {
            console.log('Google prompt not displayed (fallback)');
            onError('No se pudo mostrar el popup de Google. Verifica que no tengas bloqueadores de popup activos.');
          } else if (notification.isSkippedMoment()) {
            console.log('Google prompt skipped (fallback)');
            onError('El popup de Google fue cancelado. Intenta de nuevo.');
          } else if (notification.getDismissedReason() === 'credential_returned') {
            console.log('Google credential returned successfully (fallback)');
            // El callback handleCredentialResponse se ejecutará automáticamente
          } else {
            console.log('Google prompt other reason (fallback):', notification.getDismissedReason());
            onError('Error inesperado con Google Auth: ' + (notification.getDismissedReason() || 'Razón desconocida'));
          }
        });
      } catch (error) {
        console.error('Error showing Google prompt (fallback):', error);
        onError('Error al mostrar el popup de Google: ' + error.message);
      }
    } else {
      console.error('Google Auth not available (fallback)');
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
          <Text>Cargando Google Auth...</Text>
        </HStack>
      </Button>
    );
  }

  return (
    <>
      <Alert status="info" mb={4} fontSize="sm">
        <AlertIcon />
        <Text fontSize="xs">
          Modo de compatibilidad activado
        </Text>
      </Alert>

      <Button
        onClick={handleGoogleLogin}
        isLoading={isLoading}
        isDisabled={disabled || !isGoogleReady}
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
          <Text>
            {isGoogleReady ? "Continuar con Google" : "Google Auth no disponible"}
          </Text>
        </HStack>
      </Button>
    </>
  );
};

export default GoogleAuthFallback;
