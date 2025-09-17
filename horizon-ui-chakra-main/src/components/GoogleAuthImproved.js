import React, { useEffect, useState, useCallback } from 'react';
import { Button, HStack, Text, Icon, useToast, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { getGoogleConfig, isFedcmSupported, validateOrigin, getDebugInfo } from '../config/googleConfig';

const GoogleAuthImproved = ({ onSuccess, onError, isLoading, disabled }) => {
  const toast = useToast();
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const [fedcmSupported, setFedcmSupported] = useState(false);

  const handleCredentialResponse = useCallback((response) => {
    try {
      console.log('Google credential response received:', response);
      
      if (!response) {
        throw new Error('No response received from Google');
      }
      
      if (!response.credential) {
        throw new Error('No credential received from Google. Response: ' + JSON.stringify(response));
      }
      
      // Decodificar el JWT token
      const parts = response.credential.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format. Expected 3 parts, got: ' + parts.length);
      }

      let payload;
      try {
        payload = JSON.parse(atob(parts[1]));
        console.log('Decoded Google payload:', payload);
      } catch (decodeError) {
        throw new Error('Error decoding JWT payload: ' + decodeError.message);
      }
      
      // Validar campos requeridos
      if (!payload.sub) {
        throw new Error('Missing Google ID in token');
      }
      
      if (!payload.email) {
        throw new Error('Missing email in token');
      }
      
      const userData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || '',
        picture: payload.picture || '',
        given_name: payload.given_name || '',
        family_name: payload.family_name || '',
        email_verified: payload.email_verified || false,
      };

      onSuccess(userData);
    } catch (error) {
      console.error('Error processing Google credential:', error);
      onError('Error al procesar la respuesta de Google: ' + error.message);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    // Verificar configuración
    const debug = getDebugInfo();
    setDebugInfo(debug);
    setFedcmSupported(isFedcmSupported());

    console.log('Google Auth Debug Info:', debug);

    if (!validateOrigin()) {
      const errorMsg = `Origen no permitido: ${debug.currentOrigin}. Verifica la configuración en Google Cloud Console.`;
      console.error(errorMsg);
      onError(errorMsg);
      setIsLoadingGoogle(false);
      return;
    }

    const config = getGoogleConfig();
    console.log('Google Auth Config:', config);

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

    // Función para inicializar Google Auth
    const initializeGoogle = () => {
      try {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          const finalConfig = {
            ...config,
            callback: handleCredentialResponse
          };

          window.google.accounts.id.initialize(finalConfig);
          setIsGoogleReady(true);
          console.log('Google Auth initialized successfully with config:', finalConfig);
        } else {
          throw new Error('Google accounts not available');
        }
      } catch (error) {
        console.error('Error initializing Google Auth:', error);
        onError('Error al inicializar Google Auth: ' + error.message);
      } finally {
        setIsLoadingGoogle(false);
      }
    };

    // Cargar e inicializar
    loadGoogleScript()
      .then(initializeGoogle)
      .catch((error) => {
        console.error('Error loading Google script:', error);
        onError('Error al cargar Google Auth: ' + error.message);
        setIsLoadingGoogle(false);
      });
  }, [onError, handleCredentialResponse]);

  const handleGoogleLogin = () => {
    console.log('Google login button clicked');
    console.log('Google ready:', isGoogleReady);
    console.log('FedCM supported:', fedcmSupported);
    
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
        // Usar el método apropiado según el soporte de FedCM
        if (fedcmSupported) {
          console.log('Using FedCM method');
          // Método FedCM (más moderno)
          window.google.accounts.id.prompt((notification) => {
            console.log('Google FedCM notification:', notification);
            handlePromptNotification(notification);
          });
        } else {
          console.log('Using traditional method');
          // Método tradicional
          window.google.accounts.id.prompt((notification) => {
            console.log('Google traditional notification:', notification);
            handlePromptNotification(notification);
          });
        }
      } catch (error) {
        console.error('Error showing Google prompt:', error);
        onError('Error al mostrar el popup de Google: ' + error.message);
      }
    } else {
      console.error('Google Auth not available');
      onError('Google Auth no está disponible. Recarga la página e intenta de nuevo.');
    }
  };

  const handlePromptNotification = (notification) => {
    try {
      console.log('Google prompt notification received:', notification);
      
      if (notification.isNotDisplayed()) {
        console.log('Google prompt not displayed');
        const reasons = notification.getNotDisplayedReason();
        console.log('Not displayed reasons:', reasons, 'Type:', typeof reasons);
        
        // Manejar diferentes tipos de datos de reasons de forma segura
        let reasonText = 'Desconocido';
        try {
          if (Array.isArray(reasons)) {
            reasonText = reasons.join(', ');
          } else if (typeof reasons === 'string') {
            reasonText = reasons;
          } else if (reasons && typeof reasons === 'object') {
            reasonText = Object.values(reasons).join(', ');
          } else if (reasons !== null && reasons !== undefined) {
            reasonText = String(reasons);
          }
        } catch (reasonError) {
          console.error('Error processing reasons:', reasonError);
          reasonText = 'Error al procesar razones';
        }
        
        onError(`No se pudo mostrar el popup de Google. Razón: ${reasonText}`);
      } else if (notification.isSkippedMoment()) {
        console.log('Google prompt skipped');
        const reasons = notification.getSkippedReason();
        console.log('Skipped reasons:', reasons, 'Type:', typeof reasons);
        
        // Manejar diferentes tipos de datos de reasons de forma segura
        let reasonText = 'Desconocido';
        try {
          if (Array.isArray(reasons)) {
            reasonText = reasons.join(', ');
          } else if (typeof reasons === 'string') {
            reasonText = reasons;
          } else if (reasons && typeof reasons === 'object') {
            reasonText = Object.values(reasons).join(', ');
          } else if (reasons !== null && reasons !== undefined) {
            reasonText = String(reasons);
          }
        } catch (reasonError) {
          console.error('Error processing reasons:', reasonError);
          reasonText = 'Error al procesar razones';
        }
        
        onError(`El popup de Google fue cancelado. Razón: ${reasonText}`);
      } else if (notification.getDismissedReason() === 'credential_returned') {
        console.log('Google credential returned successfully');
        // El callback handleCredentialResponse se ejecutará automáticamente
      } else {
        const dismissedReason = notification.getDismissedReason();
        console.log('Google prompt other reason:', dismissedReason);
        
        // Manejar diferentes tipos de cancelación sin mostrar error al usuario
        if (dismissedReason === 'user_cancel' || dismissedReason === 'cancel') {
          console.log('Usuario canceló el login de Google');
          // No llamar onError para cancelaciones del usuario
          return;
        }
        
        // Solo mostrar error para problemas reales
        onError('Error inesperado con Google Auth: ' + (dismissedReason || 'Razón desconocida'));
      }
    } catch (error) {
      console.error('Error in handlePromptNotification:', error);
      onError('Error al procesar la notificación de Google: ' + error.message);
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
      {/* Información de debug en desarrollo */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <Alert status="info" mb={4} fontSize="sm">
          <AlertIcon />
          <Text fontSize="xs">
            Debug: {fedcmSupported ? 'FedCM' : 'Traditional'} | 
            Origin: {debugInfo.currentOrigin} | 
            Valid: {debugInfo.isOriginValid ? 'Yes' : 'No'}
          </Text>
        </Alert>
      )}

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

export default GoogleAuthImproved;
