// SMD VITAL - Sign In Component
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  VStack,
  Text,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useColorModeValue,
  Icon,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from 'contexts/AuthContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import GoogleAuthImproved from 'components/GoogleAuthImproved';
import GoogleAuthFallback from 'components/GoogleAuthFallback';
import { MdLocalHospital, MdLock, MdEmail } from 'react-icons/md';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [useGoogleFallback, setUseGoogleFallback] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Chakra Color Mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const boxBg = useColorModeValue("white", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputBg = useColorModeValue("transparent", "whiteAlpha.100");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Redirigir a la página que el usuario intentaba acceder originalmente
        // o al dashboard por defecto
        const from = location.state?.from || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.error || 'Error al iniciar sesión' });
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado al iniciar sesión' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleUserData) => {
    try {
      setIsLoading(true);
      const result = await loginWithGoogle(googleUserData);
      
      if (result.success) {
        // Redirigir a la página que el usuario intentaba acceder originalmente
        // o al dashboard por defecto
        const from = location.state?.from || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.error || 'Error al iniciar sesión con Google' });
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado al iniciar sesión con Google' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Auth Error:', error);
    
    // Si es un error de runtime (como reasons.join), activar fallback
    if (error.includes('reasons.join') || error.includes('is not a function')) {
      console.log('Activating Google Auth fallback due to runtime error');
      setUseGoogleFallback(true);
      setErrors({ general: 'Activando modo de compatibilidad...' });
    } else {
      setErrors({ general: error || 'Error al conectar con Google' });
    }
  };

  return (
    <Box
      w="100%"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <Box
        w={{ base: "90%", md: "400px" }}
        bg={boxBg}
        borderRadius="20px"
        p="30px"
        boxShadow="0 20px 27px 0px rgba(0, 0, 0, 0.05)"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing="20px" align="stretch">
          
          {/* Header */}
          <VStack spacing="10px" textAlign="center">
            <Icon as={MdLocalHospital} w="60px" h="60px" color="brand.500" />
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              SMD VITAL
            </Text>
            <Text fontSize="sm" color={textColorSecondary}>
              Sistema Médico Digital - Iniciar Sesión
            </Text>
          </VStack>

          <Divider />

          {/* Mensaje informativo si fue redirigido */}
          {location.state?.from && (
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Acceso requerido</AlertTitle>
                <AlertDescription fontSize="sm">
                  Debes iniciar sesión para acceder a esta página
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Error Alert */}
          {errors.general && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Error de autenticación!</AlertTitle>
                <AlertDescription fontSize="sm">{errors.general}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing="20px" align="stretch">
              <FormControl isInvalid={!!errors.email}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Email<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdEmail} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    id="email"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: "0px", md: "0px" }}
                    type="email"
                    placeholder="usuario@smdvital.com"
                    mb="24px"
                    size="lg"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    bg={inputBg}
                    pl="10"
                    autoComplete="email"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </InputGroup>
                {errors.email && (
                  <Text id="email-error" color="red.500" fontSize="sm" mt="1" mb="4">
                    {errors.email}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  display="flex"
                >
                  Contraseña<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdLock} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    id="password"
                    isRequired={true}
                    fontSize="sm"
                    placeholder="Min. 8 caracteres"
                    mb="24px"
                    size="lg"
                    type={showPassword ? "text" : "password"}
                    variant="auth"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    bg={inputBg}
                    pl="10"
                    autoComplete="current-password"
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <InputRightElement display="flex" alignItems="center" mt="4px">
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: "pointer" }}
                      as={showPassword ? ViewOffIcon : ViewIcon}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.password && (
                  <Text id="password-error" color="red.500" fontSize="sm" mt="1" mb="4">
                    {errors.password}
                  </Text>
                )}
              </FormControl>

              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
                type="submit"
                isLoading={isLoading}
                loadingText="Iniciando sesión..."
                leftIcon={isLoading ? <Spinner size="sm" /> : <Icon as={MdLocalHospital} />}
              >
                Iniciar Sesión
              </Button>

              {/* Divider */}
              <HStack>
                <Divider />
                <Text fontSize="sm" color={textColorSecondary} px="2">
                  o
                </Text>
                <Divider />
              </HStack>

              {/* Google Auth */}
              {useGoogleFallback ? (
                <GoogleAuthFallback
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  isLoading={isLoading}
                  disabled={isLoading}
                />
              ) : (
                <GoogleAuthImproved
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  isLoading={isLoading}
                  disabled={isLoading}
                />
              )}
              

              <Text fontSize="sm" color={textColorSecondary} textAlign="center">
                <Link as={RouterLink} to="/auth/forgot-password" color="brand.500" fontWeight="500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </Text>
            </VStack>
          </form>

          <Divider />

          {/* Footer */}
          <VStack spacing="10px" textAlign="center">
            <Text fontSize="sm" color={textColorSecondary}>
              ¿No tienes cuenta?{' '}
              <Link as={RouterLink} to="/auth/sign-up" color="brand.500" fontWeight="500">
                Crear cuenta
              </Link>
            </Text>
            <HStack spacing="20px">
              <Link fontSize="sm" color={textColorSecondary} href="#">
                Términos de Uso
              </Link>
              <Text color={textColorSecondary}>•</Text>
              <Link fontSize="sm" color={textColorSecondary} href="#">
                Política de Privacidad
              </Link>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}