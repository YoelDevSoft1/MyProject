// SMD VITAL - Sign Up Component
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
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
  Select,
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
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
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
                <FormControl isInvalid={!!errors.firstName}>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Nombre<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    type="text"
                    placeholder="Juan"
                    size="lg"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    leftIcon={<Icon as={MdPerson} />}
                    bg={inputBg}
                  />
                  <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.lastName}>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Apellido<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    type="text"
                    placeholder="Pérez"
                    size="lg"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    leftIcon={<Icon as={MdPerson} />}
                    bg={inputBg}
                  />
                  <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Email */}
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
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              {/* Phone */}
              <FormControl isInvalid={!!errors.phone}>
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
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  size="lg"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  leftIcon={<Icon as={MdPhone} />}
                  bg={inputBg}
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>

              {/* Role Selection */}
              <FormControl>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Tipo de Usuario<Text color={brandStars}>*</Text>
                </FormLabel>
                <Select
                  variant="auth"
                  fontSize="sm"
                  size="lg"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  bg={inputBg}
                >
                  <option value="patient">Paciente</option>
                  <option value="doctor">Médico</option>
                  <option value="admin">Administrador</option>
                </Select>
              </FormControl>

              {/* Password Fields */}
              <HStack spacing="15px">
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
                    <Input
                      isRequired={true}
                      fontSize="sm"
                      placeholder="Min. 8 caracteres"
                      size="lg"
                      type={showPassword ? "text" : "password"}
                      variant="auth"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      leftIcon={<Icon as={MdLock} />}
                      bg={inputBg}
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
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    display="flex"
                  >
                    Confirmar<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <InputGroup size="md">
                    <Input
                      isRequired={true}
                      fontSize="sm"
                      placeholder="Repetir contraseña"
                      size="lg"
                      type={showConfirmPassword ? "text" : "password"}
                      variant="auth"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      leftIcon={<Icon as={MdLock} />}
                      bg={inputBg}
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
              ¿Ya tienes cuenta?{' '}
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
