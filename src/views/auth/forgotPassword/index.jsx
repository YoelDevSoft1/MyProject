// SMD VITAL - Forgot Password Component
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { MdLocalHospital, MdEmail, MdArrowBack } from 'react-icons/md';

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

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
      // Simular envío de email de recuperación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
    } catch (error) {
      setErrors({ general: 'Error al enviar el email de recuperación' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          <VStack spacing="20px" textAlign="center">
            <Icon as={MdEmail} w="60px" h="60px" color="green.500" />
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Email Enviado
            </Text>
            <Text fontSize="sm" color={textColorSecondary}>
              Hemos enviado un enlace de recuperación a <strong>{formData.email}</strong>
            </Text>
            <Text fontSize="sm" color={textColorSecondary}>
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </Text>
            <Button
              as={RouterLink}
              to="/auth/sign-in"
              leftIcon={<Icon as={MdArrowBack} />}
              colorScheme="brand"
              variant="outline"
              size="lg"
            >
              Volver al Login
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

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
              Recuperar Contraseña
            </Text>
          </VStack>

          <Divider />

          {/* Error Alert */}
          {errors.general && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription fontSize="sm">{errors.general}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing="20px" align="stretch">
              <Text fontSize="sm" color={textColorSecondary} textAlign="center">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </Text>

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
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  type="email"
                  placeholder="usuario@smdvital.com"
                  size="lg"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  leftIcon={<Icon as={MdEmail} />}
                  bg={inputBg}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm" mt="1">
                    {errors.email}
                  </Text>
                )}
              </FormControl>

              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                type="submit"
                isLoading={isLoading}
                loadingText="Enviando..."
                leftIcon={isLoading ? <Spinner size="sm" /> : <Icon as={MdEmail} />}
              >
                Enviar Enlace de Recuperación
              </Button>
            </VStack>
          </form>

          <Divider />

          {/* Footer */}
          <VStack spacing="10px" textAlign="center">
            <Text fontSize="sm" color={textColorSecondary}>
              ¿Recordaste tu contraseña?{' '}
              <Link as={RouterLink} to="/auth/sign-in" color="brand.500" fontWeight="500">
                Iniciar Sesión
              </Link>
            </Text>
            <Text fontSize="sm" color={textColorSecondary}>
              ¿No tienes cuenta?{' '}
              <Link as={RouterLink} to="/auth/sign-up" color="brand.500" fontWeight="500">
                Crear cuenta
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
