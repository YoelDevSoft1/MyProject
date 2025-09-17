// SMD VITAL - Sign Up Component
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
  FormErrorMessage,
  Checkbox,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from 'contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { MdLocalHospital, MdPerson, MdLock, MdEmail, MdPhone } from 'react-icons/md';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    username: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Chakra Color Mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const boxBg = useColorModeValue("white", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const inputBg = useColorModeValue("transparent", "whiteAlpha.100");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'El teléfono es requerido';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debe aceptar los términos y condiciones';
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
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone_number: formData.phone_number,
      };

      const result = await register(userData);
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrors({ general: result.error || 'Error al crear la cuenta' });
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado al crear la cuenta' });
    } finally {
      setIsLoading(false);
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
      py="20px"
    >
      <Box
        w={{ base: "90%", md: "500px" }}
        bg={boxBg}
        borderRadius="20px"
        p="30px"
        boxShadow="0 20px 27px 0px rgba(0, 0, 0, 0.05)"
        border="1px solid"
        borderColor={borderColor}
        maxH="90vh"
        overflowY="auto"
      >
        <VStack spacing="20px" align="stretch">
          {/* Header */}
          <VStack spacing="10px" textAlign="center">
            <Icon as={MdLocalHospital} w="60px" h="60px" color="brand.500" />
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              SMD VITAL
            </Text>
            <Text fontSize="sm" color={textColorSecondary}>
              Sistema Médico Digital - Crear Cuenta
            </Text>
          </VStack>

          <Divider />

          {/* Error Alert */}
          {errors.general && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Error de registro!</AlertTitle>
                <AlertDescription fontSize="sm">{errors.general}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing="20px" align="stretch">
              {/* Name Fields */}
              <HStack spacing="15px">
                <FormControl isInvalid={!!errors.first_name}>
                  <FormLabel
                    htmlFor="first_name"
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Nombre<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={MdPerson} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      type="text"
                      placeholder="Juan"
                      size="lg"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      bg={inputBg}
                      pl="10"
                      autoComplete="given-name"
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.last_name}>
                  <FormLabel
                    htmlFor="last_name"
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Apellido<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={MdPerson} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      type="text"
                      placeholder="Pérez"
                      size="lg"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      bg={inputBg}
                      pl="10"
                      autoComplete="family-name"
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Email */}
              <FormControl isInvalid={!!errors.email}>
                <FormLabel
                  htmlFor="email"
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
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    type="email"
                    placeholder="usuario@smdvital.com"
                    size="lg"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    bg={inputBg}
                    pl="10"
                    autoComplete="email"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              {/* Username */}
              <FormControl isInvalid={!!errors.username}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Nombre de Usuario<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdPerson} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    type="text"
                    placeholder="juan.perez"
                    size="lg"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    bg={inputBg}
                    pl="10"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>

              {/* Phone */}
              <FormControl isInvalid={!!errors.phone_number}>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Teléfono<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdPhone} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    size="lg"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    bg={inputBg}
                    pl="10"
                  />
                </InputGroup>
                <FormErrorMessage>{errors.phone_number}</FormErrorMessage>
              </FormControl>


              {/* Password Fields */}
              <HStack spacing="15px">
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel
                    htmlFor="password"
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
                      isRequired={true}
                      fontSize="sm"
                      placeholder="Min. 8 caracteres"
                      size="lg"
                      type={showPassword ? "text" : "password"}
                      variant="auth"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      bg={inputBg}
                      pl="10"
                      autoComplete="new-password"
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
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel
                    htmlFor="confirmPassword"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    display="flex"
                  >
                    Confirmar<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={MdLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      isRequired={true}
                      fontSize="sm"
                      placeholder="Repetir contraseña"
                      size="lg"
                      type={showConfirmPassword ? "text" : "password"}
                      variant="auth"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      bg={inputBg}
                      pl="10"
                      autoComplete="new-password"
                    />
                    <InputRightElement display="flex" alignItems="center" mt="4px">
                      <Icon
                        color={textColorSecondary}
                        _hover={{ cursor: "pointer" }}
                        as={showConfirmPassword ? ViewOffIcon : ViewIcon}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Terms and Conditions */}
              <FormControl isInvalid={!!errors.acceptTerms}>
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  isChecked={formData.acceptTerms}
                  onChange={handleInputChange}
                  colorScheme="brand"
                  size="md"
                >
                  <Text fontSize="sm" color={textColor}>
                    Acepto los{' '}
                    <Link color="brand.500" href="#" fontWeight="500">
                      términos y condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link color="brand.500" href="#" fontWeight="500">
                      política de privacidad
                    </Link>
                  </Text>
                </Checkbox>
                {errors.acceptTerms && (
                  <Text color="red.500" fontSize="sm" mt="1">
                    {errors.acceptTerms}
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
                loadingText="Creando cuenta..."
                leftIcon={isLoading ? <Spinner size="sm" /> : <Icon as={MdLocalHospital} />}
              >
                Crear Cuenta
              </Button>
            </VStack>
          </form>

          <Divider />

          {/* Footer */}
          <VStack spacing="10px" textAlign="center">
            <Text fontSize="sm" color={textColorSecondary}>
              Ya tienes cuenta?{' '}
              <Link as={RouterLink} to="/auth/sign-in" color="brand.500" fontWeight="500">
                Iniciar Sesión
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
