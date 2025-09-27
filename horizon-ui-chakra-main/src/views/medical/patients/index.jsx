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
  Textarea,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
// Assets
import { MdSearch, MdAdd, MdEdit, MdDelete, MdVisibility, MdPhone, MdCalendarToday, MdRefresh, MdDownload, MdPerson } from "react-icons/md";
import { FaMars, FaVenus } from "react-icons/fa";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";

export default function Patients() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  
  // State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    inactivePatients: 0,
    pendingPatients: 0,
    averageAge: 0
  });
  
  // New Patient State
  const [newPatient, setNewPatient] = useState({
    name: "",
    patientId: "",
    age: "",
    gender: "female",
    phone: "",
    email: "",
    address: "",
    bloodType: "O+",
    emergencyContact: "",
    insurance: "",
    allergies: ""
  });
  
  // Edit Patient State
  const [editPatient, setEditPatient] = useState({
    name: "",
    patientId: "",
    age: "",
    gender: "female",
    phone: "",
    email: "",
    address: "",
    bloodType: "O+",
    emergencyContact: "",
    insurance: "",
    allergies: ""
  });
  
  const toast = useToast();
  const { user, token } = useAuth();

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, [currentPage, statusFilter, genderFilter, searchTerm]);

  // Load patients from API
  const loadPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        gender: genderFilter,
        search: searchTerm
      };
      
      const response = await apiService.getPatients(token, params);
      const patientsData = response.data || response || [];
      
      // Ensure patients is always an array
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setTotalPages(response.totalPages || 1);
      calculateStats(Array.isArray(patientsData) ? patientsData : []);
      
    } catch (err) {
      console.error("Error loading patients:", err);
      setError("Error cargando pacientes: " + (err.message || "Error desconocido"));
      // Set empty array as fallback
      setPatients([]);
      setTotalPages(1);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate patient statistics
  const calculateStats = (patientsData) => {
    // Ensure patientsData is an array
    const safePatientsData = Array.isArray(patientsData) ? patientsData : [];
    
    const activePatients = safePatientsData.filter(p => p.status === "active");
    const inactivePatients = safePatientsData.filter(p => p.status === "inactive");
    const pendingPatients = safePatientsData.filter(p => p.status === "pending");
    
    const totalAge = safePatientsData.reduce((sum, p) => sum + (p.age || 0), 0);
    const averageAge = safePatientsData.length > 0 ? totalAge / safePatientsData.length : 0;
    
    setStats({
      totalPatients: safePatientsData.length,
      activePatients: activePatients.length,
      inactivePatients: inactivePatients.length,
      pendingPatients: pendingPatients.length,
      averageAge: Math.round(averageAge)
    });
  };

  // Create new patient
  const handleCreatePatient = async () => {
    try {
      setIsLoading(true);
      
      const patientData = {
        ...newPatient,
        age: parseInt(newPatient.age),
        userId: user.id
      };
      
      const response = await apiService.createPatient(patientData, token);
      
      toast({
        title: "Paciente Creado",
        description: "El paciente ha sido creado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setNewPatient({
        name: "",
        patientId: "",
        age: "",
        gender: "female",
        phone: "",
        email: "",
        address: "",
        bloodType: "O+",
        emergencyContact: "",
        insurance: "",
        allergies: ""
      });
      
      onClose();
      loadPatients();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error creando paciente: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update patient
  const handleUpdatePatient = async () => {
    try {
      setIsLoading(true);
      
      const patientData = {
        ...editPatient,
        age: parseInt(editPatient.age),
        id: selectedPatient.id
      };
      
      const response = await apiService.updatePatient(selectedPatient.id, patientData, token);
      
      toast({
        title: "Paciente Actualizado",
        description: "El paciente ha sido actualizado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onEditModalClose();
      loadPatients();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error actualizando paciente: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete patient
  const handleDeletePatient = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.deletePatient(selectedPatient.id, token);
      
      toast({
        title: "Paciente Eliminado",
        description: "El paciente ha sido eliminado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onDeleteModalClose();
      loadPatients();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error eliminando paciente: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export patients
  const handleExportPatients = async () => {
    try {
      const response = await apiService.exportPatients(token, {
        status: statusFilter,
        gender: genderFilter,
        search: searchTerm
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pacientes_smd_vital_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Exportación Exitosa",
        description: "Los pacientes han sido exportados correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error exportando pacientes: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "green";
      case "inactive": return "gray";
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

  const getGenderIcon = (gender) => {
    return gender === "male" ? FaMars : FaVenus;
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    onOpen();
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setEditPatient({
      name: patient.name || "",
      patientId: patient.patientId || "",
      age: patient.age?.toString() || "",
      gender: patient.gender || "female",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      bloodType: patient.bloodType || "O+",
      emergencyContact: patient.emergencyContact || "",
      insurance: patient.insurance || "",
      allergies: patient.allergies || ""
    });
    onEditModalOpen();
  };

  const handleDeletePatientClick = (patient) => {
    setSelectedPatient(patient);
    onDeleteModalOpen();
  };

  // Filter patients based on search and filters
  const filteredPatients = Array.isArray(patients) ? patients.filter(patient => {
    const matchesSearch = !searchTerm || 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || patient.status === statusFilter;
    const matchesGender = !genderFilter || patient.gender === genderFilter;
    
    return matchesSearch && matchesStatus && matchesGender;
  }) : [];

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
            Pacientes SMD VITAL
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color={textColorSecondary}
          >
            Gestiona la información de tus pacientes SMD VITAL
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button
            leftIcon={<Icon as={MdDownload} />}
            colorScheme="gray"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            onClick={handleExportPatients}
          >
            Exportar
          </Button>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            colorScheme="gray"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            onClick={loadPatients}
            isLoading={isLoading}
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="patient"
            size={{ base: "md", md: "lg" }}
            onClick={onOpen}
            width={{ base: "full", lg: "auto" }}
          >
            Nuevo Paciente SMD VITAL
          </Button>
        </HStack>
      </Flex>

      {/* Estadísticas de Pacientes */}
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
              Total Pacientes
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.totalPatients}
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
              Pacientes Activos
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.activePatients}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <Progress 
                value={stats.totalPatients > 0 ? (stats.activePatients/stats.totalPatients)*100 : 0} 
                colorScheme="green" 
                size={{ base: "xs", md: "sm" }} 
              />
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
              Pacientes Inactivos
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.inactivePatients}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="decrease" />
              5.2%
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
              Edad Promedio
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.averageAge} años
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              2.1%
            </StatHelpText>
          </Stat>
        </Box>
      </Grid>

      {/* Filtros y Búsqueda */}
      <Box
        bg={useColorModeValue("white", "navy.800")}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        mb="20px"
      >
        <Grid 
          templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }} 
          gap={{ base: "15px", md: "20px" }}
        >
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar paciente SMD VITAL..." 
              size={{ base: "md", md: "lg" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select 
            placeholder="Filtrar por estado"
            size={{ base: "md", md: "lg" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </Select>
          <Select 
            placeholder="Filtrar por género"
            size={{ base: "md", md: "lg" }}
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">Todos los géneros</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </Select>
        </Grid>
      </Box>

      {/* Tabla de Pacientes */}
      <Box
        bg={useColorModeValue("white", "navy.800")}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        overflowX="auto"
      >
        <Table 
          variant="simple" 
          color={textColor}
          size={{ base: "sm", md: "md" }}
          minW="1000px"
        >
          <Thead>
            <Tr>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Paciente
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                ID
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                Edad
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                Género
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                Teléfono
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Última Visita
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
            {isLoading ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py="50px">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" />
                    <Text color={textColorSecondary}>Cargando pacientes...</Text>
                  </VStack>
                </Td>
              </Tr>
            ) : error ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py="50px">
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                </Td>
              </Tr>
            ) : filteredPatients.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py="50px">
                  <VStack spacing={4}>
                    <Icon as={MdPerson} boxSize="50px" color={textColorSecondary} />
                    <Text color={textColorSecondary}>
                      {patients.length === 0 
                        ? "No hay pacientes registrados. Crea el primer paciente usando el botón 'Nuevo Paciente SMD VITAL'"
                        : "No se encontraron pacientes con los filtros aplicados"
                      }
                    </Text>
                    {patients.length === 0 && (
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={MdAdd} />}
                        onClick={onOpen}
                        size="sm"
                      >
                        Crear Primer Paciente
                      </Button>
                    )}
                  </VStack>
                </Td>
              </Tr>
            ) : (
              filteredPatients.map((patient) => (
              <Tr key={patient.id}>
                <Td>
                  <HStack spacing={{ base: "10px", md: "15px" }}>
                    <Avatar
                      size={{ base: "xs", md: "sm" }}
                      name={patient.name}
                      src={`https://ui-avatars.com/api/?name=${patient.name}&background=random`}
                    />
                    <VStack align="start" spacing="2px">
                      <Text 
                        fontWeight="600" 
                        color={textColor}
                        fontSize={{ base: "xs", md: "sm" }}
                        isTruncated
                        maxW="150px"
                      >
                        {patient.name}
                      </Text>
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        color={textColorSecondary}
                        isTruncated
                        maxW="150px"
                      >
                        {patient.email}
                      </Text>
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        color={textColorSecondary}
                        display={{ base: "block", md: "none" }}
                      >
                        ID: {patient.patientId} | {patient.age} años
                      </Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td 
                  color={textColor} 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", md: "table-cell" }}
                >
                  {patient.patientId}
                </Td>
                <Td 
                  color={textColor} 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", lg: "table-cell" }}
                >
                  {patient.age} años
                </Td>
                <Td 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", xl: "table-cell" }}
                >
                  <HStack>
                    <Icon as={getGenderIcon(patient.gender)} color={textColor} />
                    <Text color={textColor}>
                      {patient.gender === "male" ? "M" : "F"}
                    </Text>
                  </HStack>
                </Td>
                <Td 
                  color={textColor} 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", lg: "table-cell" }}
                  isTruncated
                  maxW="120px"
                >
                  {patient.phone}
                </Td>
                <Td 
                  color={textColor}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  {patient.lastVisit}
                </Td>
                <Td>
                  <Badge 
                    colorScheme={getStatusColor(patient.status)} 
                    variant="solid"
                    size={{ base: "sm", md: "md" }}
                  >
                    {getStatusText(patient.status)}
                  </Badge>
                </Td>
                <Td>
                  <HStack 
                    spacing={{ base: "5px", md: "10px" }}
                    justify="center"
                    wrap="wrap"
                  >
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdVisibility} />}
                      variant="outline"
                      onClick={() => handleViewPatient(patient)}
                    >
                      <Text display={{ base: "none", sm: "block" }}>Ver</Text>
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdEdit} />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => handleEditPatient(patient)}
                    >
                      <Text display={{ base: "none", sm: "block" }}>Editar</Text>
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdDelete} />}
                      variant="outline"
                      colorScheme="red"
                      onClick={() => handleDeletePatientClick(patient)}
                    >
                      <Text display={{ base: "none", sm: "block" }}>Eliminar</Text>
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Detalles del Paciente */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "xl", lg: "4xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Información del Paciente SMD VITAL
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedPatient && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                {/* Información Personal */}
                <Box>
                  <Text 
                    fontSize={{ base: "md", md: "lg" }} 
                    fontWeight="600" 
                    color={textColor} 
                    mb={{ base: "10px", md: "15px" }}
                  >
                    Información Personal
                  </Text>
                  <Grid 
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                    gap={{ base: "15px", md: "20px" }}
                  >
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Nombre Completo</FormLabel>
                      <Input 
                        value={selectedPatient.name} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                      <Input 
                        value={selectedPatient.patientId} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Edad</FormLabel>
                      <Input 
                        value={`${selectedPatient.age} años`} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Género</FormLabel>
                      <Input 
                        value={selectedPatient.gender === "male" ? "Masculino" : "Femenino"} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Tipo de Sangre</FormLabel>
                      <Input 
                        value={selectedPatient.bloodType} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Estado</FormLabel>
                      <Input 
                        value={getStatusText(selectedPatient.status)} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                  </Grid>
                </Box>

                <Divider />

                {/* Información de Contacto */}
                <Box>
                  <Text 
                    fontSize={{ base: "md", md: "lg" }} 
                    fontWeight="600" 
                    color={textColor} 
                    mb={{ base: "10px", md: "15px" }}
                  >
                    Información de Contacto
                  </Text>
                  <Grid 
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                    gap={{ base: "15px", md: "20px" }}
                  >
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Teléfono</FormLabel>
                      <Input 
                        value={selectedPatient.phone} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Email</FormLabel>
                      <Input 
                        value={selectedPatient.email} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Dirección</FormLabel>
                      <Textarea 
                        value={selectedPatient.address} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                        minH={{ base: "80px", md: "100px" }}
                      />
                    </FormControl>
                    <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Contacto de Emergencia</FormLabel>
                      <Input 
                        value={selectedPatient.emergencyContact} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                  </Grid>
                </Box>

                <Divider />

                {/* Información Médica */}
                <Box>
                  <Text 
                    fontSize={{ base: "md", md: "lg" }} 
                    fontWeight="600" 
                    color={textColor} 
                    mb={{ base: "10px", md: "15px" }}
                  >
                    Información Médica
                  </Text>
                  <Grid 
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                    gap={{ base: "15px", md: "20px" }}
                  >
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Seguro Médico</FormLabel>
                      <Input 
                        value={selectedPatient.insurance} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Última Visita</FormLabel>
                      <Input 
                        value={selectedPatient.lastVisit} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                      />
                    </FormControl>
                    <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Alergias Conocidas</FormLabel>
                      <Textarea 
                        value={selectedPatient.allergies} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                        minH={{ base: "80px", md: "100px" }}
                      />
                    </FormControl>
                  </Grid>
                </Box>

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
                    Editar Paciente SMD VITAL
                  </Button>
                  <Button 
                    colorScheme="green" 
                    leftIcon={<Icon as={MdCalendarToday} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Nueva Cita SMD VITAL
                  </Button>
                  <Button 
                    colorScheme="purple" 
                    leftIcon={<Icon as={MdPhone} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Contactar SMD VITAL
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para Crear Nuevo Paciente */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "xl", lg: "4xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Crear Nuevo Paciente SMD VITAL
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
              <Grid 
                templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                gap={{ base: "15px", md: "20px" }}
              >
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Nombre Completo</FormLabel>
                  <Input 
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    placeholder="María González"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                  <Input 
                    value={newPatient.patientId}
                    onChange={(e) => setNewPatient({...newPatient, patientId: e.target.value})}
                    placeholder="SMD001"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Edad</FormLabel>
                  <NumberInput
                    value={newPatient.age}
                    onChange={(valueString) => setNewPatient({...newPatient, age: valueString})}
                    min={0}
                    max={120}
                  >
                    <NumberInputField placeholder="45" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Género</FormLabel>
                  <Select 
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Teléfono</FormLabel>
                  <Input 
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    placeholder="+57 300 123 4567"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Email</FormLabel>
                  <Input 
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    placeholder="maria.gonzalez@smdvital.com"
                    type="email"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Tipo de Sangre</FormLabel>
                  <Select 
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({...newPatient, bloodType: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Seguro Médico</FormLabel>
                  <Input 
                    value={newPatient.insurance}
                    onChange={(e) => setNewPatient({...newPatient, insurance: e.target.value})}
                    placeholder="Sura - SMD VITAL"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Dirección</FormLabel>
                  <Textarea 
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    placeholder="Calle 123 #45-67, Bogotá - SMD VITAL"
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Contacto de Emergencia</FormLabel>
                  <Input 
                    value={newPatient.emergencyContact}
                    onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                    placeholder="Carlos González - +57 300 987 6543"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Alergias Conocidas</FormLabel>
                  <Textarea 
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
                    placeholder="Penicilina, Aspirina, etc."
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
              </Grid>
              <HStack 
                spacing={{ base: "5px", md: "10px" }} 
                justify="center"
                wrap="wrap"
              >
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Icon as={MdAdd} />}
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "full", sm: "auto" }}
                  onClick={handleCreatePatient}
                  isLoading={isLoading}
                >
                  Crear Paciente
                </Button>
                <Button 
                  colorScheme="gray" 
                  variant="outline"
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "full", sm: "auto" }}
                  onClick={onClose}
                >
                  Cancelar
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para Editar Paciente */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={onEditModalClose} 
        size={{ base: "full", md: "xl", lg: "4xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Editar Paciente SMD VITAL
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
              <Grid 
                templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                gap={{ base: "15px", md: "20px" }}
              >
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Nombre Completo</FormLabel>
                  <Input 
                    value={editPatient.name}
                    onChange={(e) => setEditPatient({...editPatient, name: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                  <Input 
                    value={editPatient.patientId}
                    onChange={(e) => setEditPatient({...editPatient, patientId: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Edad</FormLabel>
                  <NumberInput
                    value={editPatient.age}
                    onChange={(valueString) => setEditPatient({...editPatient, age: valueString})}
                    min={0}
                    max={120}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Género</FormLabel>
                  <Select 
                    value={editPatient.gender}
                    onChange={(e) => setEditPatient({...editPatient, gender: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Teléfono</FormLabel>
                  <Input 
                    value={editPatient.phone}
                    onChange={(e) => setEditPatient({...editPatient, phone: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Email</FormLabel>
                  <Input 
                    value={editPatient.email}
                    onChange={(e) => setEditPatient({...editPatient, email: e.target.value})}
                    type="email"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Tipo de Sangre</FormLabel>
                  <Select 
                    value={editPatient.bloodType}
                    onChange={(e) => setEditPatient({...editPatient, bloodType: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Seguro Médico</FormLabel>
                  <Input 
                    value={editPatient.insurance}
                    onChange={(e) => setEditPatient({...editPatient, insurance: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Dirección</FormLabel>
                  <Textarea 
                    value={editPatient.address}
                    onChange={(e) => setEditPatient({...editPatient, address: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Contacto de Emergencia</FormLabel>
                  <Input 
                    value={editPatient.emergencyContact}
                    onChange={(e) => setEditPatient({...editPatient, emergencyContact: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Alergias Conocidas</FormLabel>
                  <Textarea 
                    value={editPatient.allergies}
                    onChange={(e) => setEditPatient({...editPatient, allergies: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
              </Grid>
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
                  onClick={handleUpdatePatient}
                  isLoading={isLoading}
                >
                  Actualizar Paciente
                </Button>
                <Button 
                  colorScheme="gray" 
                  variant="outline"
                  size={{ base: "sm", md: "md" }}
                  width={{ base: "full", sm: "auto" }}
                  onClick={onEditModalClose}
                >
                  Cancelar
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para Eliminar Paciente */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={onDeleteModalClose} 
        size={{ base: "full", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Eliminar Paciente
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedPatient && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                <Alert status="warning">
                  <AlertIcon />
                  <Text fontSize="sm">
                    ¿Estás seguro de que quieres eliminar al paciente {selectedPatient.name}? 
                    Esta acción no se puede deshacer.
                  </Text>
                </Alert>
                
                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <VStack spacing={2} align="stretch">
                    <Text fontWeight="bold">Información del Paciente:</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Nombre:</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedPatient.name}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">ID:</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedPatient.patientId}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Email:</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedPatient.email}</Text>
                    </HStack>
                  </VStack>
                </Box>
                
                <HStack 
                  spacing={{ base: "5px", md: "10px" }} 
                  justify="center"
                  wrap="wrap"
                >
                  <Button 
                    colorScheme="red" 
                    leftIcon={<Icon as={MdDelete} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                    onClick={handleDeletePatient}
                    isLoading={isLoading}
                  >
                    Eliminar Paciente
                  </Button>
                  <Button 
                    colorScheme="gray" 
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                    onClick={onDeleteModalClose}
                  >
                    Cancelar
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
