// Chakra imports
import {
  Box,
  Flex,
  Grid,
  useColorModeValue,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Switch,
  Checkbox,
} from "@chakra-ui/react";
import React, { useState } from "react";
// Assets
import { MdSearch, MdAdd, MdEdit, MdDelete, MdVisibility, MdBackup, MdRestore, MdUpdate, MdWarning, MdCheckCircle, MdError, MdInfo } from "react-icons/md";
import { FaUserMd, FaUserNurse, FaUser, FaShieldAlt } from "react-icons/fa";

export default function AdminPanel() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);

  // Datos simulados de usuarios del sistema SMD VITAL
  const users = [
    {
      id: 1,
      name: "Dr. Carlos López",
      email: "carlos.lopez@smdvital.com",
      role: "doctor",
      department: "Medicina General SMD VITAL",
      status: "active",
      lastLogin: "2024-01-20 14:30",
      permissions: ["appointments", "records", "patients"],
      phone: "+57 300 123 4567",
      location: "Sede Principal SMD VITAL - Bogotá"
    },
    {
      id: 2,
      name: "Dra. Ana Martínez",
      email: "ana.martinez@smdvital.com",
      role: "doctor",
      department: "Cardiología SMD VITAL",
      status: "active",
      lastLogin: "2024-01-20 12:15",
      permissions: ["appointments", "records", "patients", "ai"],
      phone: "+57 300 234 5678",
      location: "Sede Principal SMD VITAL - Bogotá"
    },
    {
      id: 3,
      name: "María González",
      email: "maria.gonzalez@smdvital.com",
      role: "nurse",
      department: "Enfermería SMD VITAL",
      status: "active",
      lastLogin: "2024-01-20 10:45",
      permissions: ["appointments", "patients"],
      phone: "+57 300 345 6789",
      location: "Sede Principal SMD VITAL - Bogotá"
    },
    {
      id: 4,
      name: "Pedro Sánchez",
      email: "pedro.sanchez@smdvital.com",
      role: "admin",
      department: "Administración SMD VITAL",
      status: "active",
      lastLogin: "2024-01-20 16:20",
      permissions: ["all"],
      phone: "+57 300 456 7890",
      location: "Sede Principal SMD VITAL - Bogotá"
    },
    {
      id: 5,
      name: "Laura Rodríguez",
      email: "laura.rodriguez@smdvital.com",
      role: "receptionist",
      department: "Recepción SMD VITAL",
      status: "inactive",
      lastLogin: "2024-01-18 09:30",
      permissions: ["appointments", "patients"],
      phone: "+57 300 567 8901",
      location: "Sede Principal SMD VITAL - Bogotá"
    }
  ];

  // Datos del sistema SMD VITAL
  const systemStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    totalAppointments: 1247,
    totalPatients: 3456,
    systemUptime: "99.9%",
    storageUsed: "15.7 GB",
    lastBackup: "2024-01-20 02:00"
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return FaShieldAlt;
      case "doctor": return FaUserMd;
      case "nurse": return FaUserNurse;
      case "receptionist": return FaUser;
      default: return FaUser;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "red";
      case "doctor": return "blue";
      case "nurse": return "green";
      case "receptionist": return "purple";
      default: return "gray";
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "admin": return "Administrador";
      case "doctor": return "Doctor";
      case "nurse": return "Enfermera";
      case "receptionist": return "Recepcionista";
      default: return role;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "green";
      case "inactive": return "red";
      case "pending": return "yellow";
      default: return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "pending": return "Pendiente";
      default: return status;
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Header */}
      <Flex 
        direction={{ base: "column", lg: "row" }} 
        justify="space-between" 
        align={{ base: "stretch", lg: "center" }} 
        mb="20px"
        gap={4}
      >
        <Box textAlign={{ base: "center", lg: "left" }}>
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            fontWeight="700" 
            color={textColor}
          >
            Panel de Administración SMD VITAL
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color={textColorSecondary}
          >
            Gestiona usuarios, configuraciones y monitoreo del sistema médico SMD VITAL
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={MdAdd} />}
          colorScheme="red"
          size={{ base: "md", md: "lg" }}
          onClick={onOpen}
          width={{ base: "full", lg: "auto" }}
        >
          <Text display={{ base: "none", sm: "block" }}>
            Nuevo Usuario SMD VITAL
          </Text>
          <Text display={{ base: "block", sm: "none" }}>
            Nuevo Usuario
          </Text>
        </Button>
      </Flex>

      {/* Estadísticas del Sistema */}
      <Grid 
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} 
        gap={{ base: "15px", md: "20px" }} 
        mb="20px"
      >
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Usuarios Activos
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {systemStats.activeUsers}/{systemStats.totalUsers}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              12.5%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Citas Totales
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {systemStats.totalAppointments}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              8.2%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Uptime del Sistema
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {systemStats.systemUptime}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              0.1%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Almacenamiento
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {systemStats.storageUsed}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              15.3%
            </StatHelpText>
          </Stat>
        </Box>
      </Grid>

      <Tabs>
        <TabList 
          flexWrap="wrap"
          fontSize={{ base: "sm", md: "md" }}
        >
          <Tab fontSize={{ base: "xs", md: "sm" }}>Usuarios</Tab>
          <Tab fontSize={{ base: "xs", md: "sm" }}>Configuración</Tab>
          <Tab fontSize={{ base: "xs", md: "sm" }}>Monitoreo</Tab>
          <Tab fontSize={{ base: "xs", md: "sm" }}>Seguridad</Tab>
        </TabList>

        <TabPanels>
          {/* Panel de Usuarios */}
          <TabPanel>
            <Box
              bg={useColorModeValue("white", "navy.800")}
              borderRadius="20px"
              p={{ base: "15px", md: "20px" }}
              boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
            >
              {/* Filtros */}
              <Grid 
                templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }} 
                gap={{ base: "15px", md: "20px" }} 
                mb="20px"
              >
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Buscar por nombre o email..." 
                    size={{ base: "sm", md: "md" }}
                  />
                </InputGroup>
                <Select 
                  placeholder="Filtrar por rol"
                  size={{ base: "sm", md: "md" }}
                >
                  <option value="admin">Administrador</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Enfermera</option>
                  <option value="receptionist">Recepcionista</option>
                </Select>
                <Select 
                  placeholder="Filtrar por estado"
                  size={{ base: "sm", md: "md" }}
                >
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="pending">Pendientes</option>
                </Select>
              </Grid>

              {/* Tabla de Usuarios */}
              <Box overflowX="auto">
                <Table 
                  variant="simple" 
                  color={textColor}
                  size={{ base: "sm", md: "md" }}
                  minW="800px"
                >
                  <Thead>
                    <Tr>
                      <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                        Usuario
                      </Th>
                      <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                        Rol
                      </Th>
                      <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                        Departamento
                      </Th>
                      <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                        Último Acceso
                      </Th>
                      <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                        Estado
                      </Th>
                      <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                        Acciones
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <VStack align="start" spacing="2px">
                            <Text 
                              fontWeight="600" 
                              color={textColor}
                              fontSize={{ base: "xs", md: "sm" }}
                              isTruncated
                              maxW="150px"
                            >
                              {user.name}
                            </Text>
                            <Text 
                              fontSize={{ base: "xs", md: "sm" }} 
                              color={textColorSecondary}
                              isTruncated
                              maxW="150px"
                            >
                              {user.email}
                            </Text>
                            <HStack 
                              spacing={2}
                              display={{ base: "flex", md: "none" }}
                            >
                              <Icon 
                                as={getRoleIcon(user.role)} 
                                color={`${getRoleColor(user.role)}.500`}
                                w="12px"
                                h="12px"
                              />
                              <Text 
                                color={textColor}
                                fontSize="xs"
                              >
                                {getRoleText(user.role)}
                              </Text>
                            </HStack>
                          </VStack>
                        </Td>
                        <Td 
                          color={textColor}
                          fontSize={{ base: "xs", md: "sm" }}
                          display={{ base: "none", md: "table-cell" }}
                        >
                          <HStack>
                            <Icon 
                              as={getRoleIcon(user.role)} 
                              color={`${getRoleColor(user.role)}.500`}
                              w="16px"
                              h="16px"
                            />
                            <Text color={textColor}>
                              {getRoleText(user.role)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td 
                          color={textColor}
                          fontSize={{ base: "xs", md: "sm" }}
                          display={{ base: "none", lg: "table-cell" }}
                          isTruncated
                          maxW="200px"
                        >
                          {user.department}
                        </Td>
                        <Td 
                          color={textColor}
                          fontSize={{ base: "xs", md: "sm" }}
                          display={{ base: "none", xl: "table-cell" }}
                        >
                          {user.lastLogin}
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={getStatusColor(user.status)} 
                            variant="solid"
                            size={{ base: "sm", md: "md" }}
                          >
                            {getStatusText(user.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack 
                            spacing={{ base: "5px", md: "10px" }}
                            wrap="wrap"
                            justify="center"
                          >
                            <Button
                              size={{ base: "xs", md: "sm" }}
                              leftIcon={<Icon as={MdVisibility} />}
                              variant="outline"
                              onClick={() => handleViewUser(user)}
                            >
                              <Text display={{ base: "none", sm: "block" }}>Ver</Text>
                            </Button>
                            <Button
                              size={{ base: "xs", md: "sm" }}
                              leftIcon={<Icon as={MdEdit} />}
                              variant="outline"
                              colorScheme="blue"
                            >
                              <Text display={{ base: "none", sm: "block" }}>Editar</Text>
                            </Button>
                            <Button
                              size={{ base: "xs", md: "sm" }}
                              leftIcon={<Icon as={MdDelete} />}
                              variant="outline"
                              colorScheme="red"
                            >
                              <Text display={{ base: "none", sm: "block" }}>Eliminar</Text>
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </TabPanel>

          {/* Panel de Configuración */}
          <TabPanel>
            <Grid 
              templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
              gap={{ base: "15px", md: "20px" }}
            >
              <Box
                bg={useColorModeValue("white", "navy.800")}
                borderRadius="20px"
                p={{ base: "15px", md: "20px" }}
                boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
              >
                <Text 
                  fontSize={{ base: "md", md: "lg" }} 
                  fontWeight="700" 
                  color={textColor} 
                  mb={{ base: "15px", md: "20px" }}
                >
                  Configuración General
                </Text>
                <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
                  <FormControl 
                    display="flex" 
                    alignItems="center"
                    direction={{ base: "column", sm: "row" }}
                    gap={2}
                  >
                    <FormLabel 
                      htmlFor="email-alerts" 
                      mb="0"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Alertas por Email
                    </FormLabel>
                    <Switch id="email-alerts" defaultChecked />
                  </FormControl>
                  <FormControl 
                    display="flex" 
                    alignItems="center"
                    direction={{ base: "column", sm: "row" }}
                    gap={2}
                  >
                    <FormLabel 
                      htmlFor="sms-notifications" 
                      mb="0"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Notificaciones SMS
                    </FormLabel>
                    <Switch id="sms-notifications" />
                  </FormControl>
                  <FormControl 
                    display="flex" 
                    alignItems="center"
                    direction={{ base: "column", sm: "row" }}
                    gap={2}
                  >
                    <FormLabel 
                      htmlFor="ai-enabled" 
                      mb="0"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      IA Médica Habilitada
                    </FormLabel>
                    <Switch id="ai-enabled" defaultChecked />
                  </FormControl>
                  <FormControl 
                    display="flex" 
                    alignItems="center"
                    direction={{ base: "column", sm: "row" }}
                    gap={2}
                  >
                    <FormLabel 
                      htmlFor="backup-auto" 
                      mb="0"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Respaldo Automático
                    </FormLabel>
                    <Switch id="backup-auto" defaultChecked />
                  </FormControl>
                </VStack>
              </Box>

              <Box
                bg={useColorModeValue("white", "navy.800")}
                borderRadius="20px"
                p={{ base: "15px", md: "20px" }}
                boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
              >
                <Text 
                  fontSize={{ base: "md", md: "lg" }} 
                  fontWeight="700" 
                  color={textColor} 
                  mb={{ base: "15px", md: "20px" }}
                >
                  Configuración de Seguridad
                </Text>
                <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>
                      Tiempo de Sesión (minutos)
                    </FormLabel>
                    <NumberInput defaultValue={30} min={5} max={480} size={{ base: "sm", md: "md" }}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>
                      Intentos de Login Máximos
                    </FormLabel>
                    <NumberInput defaultValue={3} min={1} max={10} size={{ base: "sm", md: "md" }}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl 
                    display="flex" 
                    alignItems="center"
                    direction={{ base: "column", sm: "row" }}
                    gap={2}
                  >
                    <FormLabel 
                      htmlFor="two-factor" 
                      mb="0"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Autenticación de Dos Factores
                    </FormLabel>
                    <Switch id="two-factor" />
                  </FormControl>
                  <FormControl 
                    display="flex" 
                    alignItems="center"
                    direction={{ base: "column", sm: "row" }}
                    gap={2}
                  >
                    <FormLabel 
                      htmlFor="password-policy" 
                      mb="0"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Política de Contraseñas Estricta
                    </FormLabel>
                    <Switch id="password-policy" defaultChecked />
                  </FormControl>
                </VStack>
              </Box>
            </Grid>
          </TabPanel>

          {/* Panel de Monitoreo */}
          <TabPanel>
            <Grid 
              templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
              gap={{ base: "15px", md: "20px" }}
            >
              <Box
                bg={useColorModeValue("white", "navy.800")}
                borderRadius="20px"
                p={{ base: "15px", md: "20px" }}
                boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
              >
                <Text 
                  fontSize={{ base: "md", md: "lg" }} 
                  fontWeight="700" 
                  color={textColor} 
                  mb={{ base: "15px", md: "20px" }}
                >
                  Estado del Sistema
                </Text>
                <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
                  <HStack justify="space-between">
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      CPU
                    </Text>
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      45%
                    </Text>
                  </HStack>
                  <Progress value={45} colorScheme="green" size={{ base: "sm", md: "md" }} />
                  
                  <HStack justify="space-between">
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Memoria
                    </Text>
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      67%
                    </Text>
                  </HStack>
                  <Progress value={67} colorScheme="yellow" size={{ base: "sm", md: "md" }} />
                  
                  <HStack justify="space-between">
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Almacenamiento
                    </Text>
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      23%
                    </Text>
                  </HStack>
                  <Progress value={23} colorScheme="blue" size={{ base: "sm", md: "md" }} />
                  
                  <HStack justify="space-between">
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Red
                    </Text>
                    <Text 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      12%
                    </Text>
                  </HStack>
                  <Progress value={12} colorScheme="purple" size={{ base: "sm", md: "md" }} />
                </VStack>
              </Box>

              <Box
                bg={useColorModeValue("white", "navy.800")}
                borderRadius="20px"
                p={{ base: "15px", md: "20px" }}
                boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
              >
                <Text 
                  fontSize={{ base: "md", md: "lg" }} 
                  fontWeight="700" 
                  color={textColor} 
                  mb={{ base: "15px", md: "20px" }}
                >
                  Respaldos
                </Text>
                <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
                  <Alert status="success" size={{ base: "sm", md: "md" }}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize={{ base: "sm", md: "md" }}>
                        Último Respaldo Exitoso
                      </AlertTitle>
                      <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
                        {systemStats.lastBackup}
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <Button 
                    leftIcon={<Icon as={MdBackup} />} 
                    colorScheme="blue"
                    size={{ base: "sm", md: "md" }}
                    width="full"
                  >
                    Crear Respaldo Manual
                  </Button>
                  
                  <Button 
                    leftIcon={<Icon as={MdRestore} />} 
                    colorScheme="yellow" 
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                    width="full"
                  >
                    Restaurar desde Respaldo
                  </Button>
                  
                  <Button 
                    leftIcon={<Icon as={MdUpdate} />} 
                    colorScheme="green" 
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                    width="full"
                  >
                    Actualizar Sistema
                  </Button>
                </VStack>
              </Box>
            </Grid>
          </TabPanel>

          {/* Panel de Seguridad */}
          <TabPanel>
            <Box
              bg={useColorModeValue("white", "navy.800")}
              borderRadius="20px"
              p={{ base: "15px", md: "20px" }}
              boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
            >
              <Text 
                fontSize={{ base: "md", md: "lg" }} 
                fontWeight="700" 
                color={textColor} 
                mb={{ base: "15px", md: "20px" }}
              >
                Logs de Seguridad
              </Text>
              <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
                {[
                  { type: "success", message: "Login exitoso - Dr. Carlos López", time: "2024-01-20 14:30" },
                  { type: "warning", message: "Intento de login fallido - IP 192.168.1.100", time: "2024-01-20 14:25" },
                  { type: "info", message: "Cambio de contraseña - María González", time: "2024-01-20 12:15" },
                  { type: "error", message: "Acceso denegado - Usuario inactivo", time: "2024-01-20 10:45" },
                  { type: "success", message: "Respaldo de seguridad completado", time: "2024-01-20 02:00" }
                ].map((log, index) => (
                  <Box
                    key={index}
                    p={{ base: "10px", md: "15px" }}
                    bg="gray.50"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack 
                      justify="space-between"
                      direction={{ base: "column", sm: "row" }}
                      align={{ base: "stretch", sm: "center" }}
                      spacing={2}
                    >
                      <HStack spacing={2}>
                        <Icon
                          as={
                            log.type === "success" ? MdCheckCircle :
                            log.type === "warning" ? MdWarning :
                            log.type === "error" ? MdError : MdInfo
                          }
                          color={
                            log.type === "success" ? "green.500" :
                            log.type === "warning" ? "yellow.500" :
                            log.type === "error" ? "red.500" : "blue.500"
                          }
                          w={{ base: "16px", md: "20px" }}
                          h={{ base: "16px", md: "20px" }}
                        />
                        <Text 
                          color={textColor}
                          fontSize={{ base: "xs", md: "sm" }}
                          isTruncated
                          maxW="300px"
                        >
                          {log.message}
                        </Text>
                      </HStack>
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        color={textColorSecondary}
                        textAlign={{ base: "center", sm: "right" }}
                      >
                        {log.time}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal de Detalles de Usuario */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "xl", lg: "2xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Detalles del Usuario
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedUser && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                <Grid 
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                  gap={{ base: "15px", md: "20px" }}
                >
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Nombre</FormLabel>
                    <Input 
                      value={selectedUser.name} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Email</FormLabel>
                    <Input 
                      value={selectedUser.email} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Rol</FormLabel>
                    <Input 
                      value={getRoleText(selectedUser.role)} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Departamento</FormLabel>
                    <Input 
                      value={selectedUser.department} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Teléfono</FormLabel>
                    <Input 
                      value={selectedUser.phone} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={{ base: "sm", md: "md" }}>Estado</FormLabel>
                    <Input 
                      value={getStatusText(selectedUser.status)} 
                      isReadOnly 
                      size={{ base: "sm", md: "md" }}
                    />
                  </FormControl>
                </Grid>
                
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Permisos</FormLabel>
                  <VStack align="start" spacing={{ base: "5px", md: "10px" }}>
                    {selectedUser.permissions.map((permission, index) => (
                      <Checkbox 
                        key={index} 
                        defaultChecked 
                        isReadOnly
                        size={{ base: "sm", md: "md" }}
                      >
                        <Text fontSize={{ base: "xs", md: "sm" }}>
                          {permission}
                        </Text>
                      </Checkbox>
                    ))}
                  </VStack>
                </FormControl>
                
                <HStack 
                  spacing={{ base: "5px", md: "10px" }} 
                  justify="center"
                  wrap="wrap"
                >
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<Icon as={MdEdit} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Editar Usuario
                  </Button>
                  <Button 
                    colorScheme="red" 
                    leftIcon={<Icon as={MdDelete} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Eliminar Usuario
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
