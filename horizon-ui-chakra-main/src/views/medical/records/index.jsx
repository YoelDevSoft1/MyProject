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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
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
  Divider,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
// Assets
import { MdSearch, MdAdd, MdEdit, MdVisibility, MdDownload, MdUpload, MdRefresh, MdFileCopy, MdDelete } from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";

export default function MedicalRecords() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  
  // State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeRecords: 0,
    archivedRecords: 0,
    pendingRecords: 0,
    averageAge: 0
  });
  
  // New Record State
  const [newRecord, setNewRecord] = useState({
    patientId: "",
    doctorId: "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medications: "",
    allergies: "",
    notes: "",
    status: "active"
  });
  
  // Edit Record State
  const [editRecord, setEditRecord] = useState({
    patientId: "",
    doctorId: "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medications: "",
    allergies: "",
    notes: "",
    status: "active"
  });
  
  const toast = useToast();
  const { user, token } = useAuth();

  // Load medical records on component mount
  useEffect(() => {
    loadMedicalRecords();
  }, [currentPage, statusFilter, doctorFilter, searchTerm]);

  // Load medical records from API
  const loadMedicalRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        doctor: doctorFilter,
        search: searchTerm
      };
      
      const response = await apiService.getMedicalRecords(token, params);
      const recordsData = response.data || response || [];
      
      // Ensure medicalRecords is always an array
      setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
      setTotalPages(response.totalPages || 1);
      calculateStats(Array.isArray(recordsData) ? recordsData : []);
      
    } catch (err) {
      console.error("Error loading medical records:", err);
      setError("Error cargando expedientes: " + (err.message || "Error desconocido"));
      // Set empty array as fallback
      setMedicalRecords([]);
      setTotalPages(1);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate medical records statistics
  const calculateStats = (recordsData) => {
    // Ensure recordsData is an array
    const safeRecordsData = Array.isArray(recordsData) ? recordsData : [];
    
    const activeRecords = safeRecordsData.filter(r => r.status === "active");
    const archivedRecords = safeRecordsData.filter(r => r.status === "archived");
    const pendingRecords = safeRecordsData.filter(r => r.status === "pending");
    
    setStats({
      totalRecords: safeRecordsData.length,
      activeRecords: activeRecords.length,
      archivedRecords: archivedRecords.length,
      pendingRecords: pendingRecords.length,
      averageAge: 0 // This would be calculated from patient data
    });
  };

  // Create new medical record
  const handleCreateRecord = async () => {
    try {
      setIsLoading(true);
      
      const recordData = {
        ...newRecord,
        userId: user.id
      };
      
      const response = await apiService.createMedicalRecord(recordData, token);
      
      toast({
        title: "Expediente Creado",
        description: "El expediente médico ha sido creado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setNewRecord({
        patientId: "",
        doctorId: "",
        diagnosis: "",
        symptoms: "",
        treatment: "",
        medications: "",
        allergies: "",
        notes: "",
        status: "active"
      });
      
      onClose();
      loadMedicalRecords();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error creando expediente: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update medical record
  const handleUpdateRecord = async () => {
    try {
      setIsLoading(true);
      
      const recordData = {
        ...editRecord,
        id: selectedRecord.id
      };
      
      const response = await apiService.updateMedicalRecord(selectedRecord.id, recordData, token);
      
      toast({
        title: "Expediente Actualizado",
        description: "El expediente médico ha sido actualizado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onEditModalClose();
      loadMedicalRecords();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error actualizando expediente: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete medical record
  const handleDeleteRecord = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.deleteMedicalRecord(selectedRecord.id, token);
      
      toast({
        title: "Expediente Eliminado",
        description: "El expediente médico ha sido eliminado exitosamente",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onDeleteModalClose();
      loadMedicalRecords();
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error eliminando expediente: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export medical records
  const handleExportRecords = async () => {
    try {
      const response = await apiService.exportMedicalRecords(token, {
        status: statusFilter,
        doctor: doctorFilter,
        search: searchTerm
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expedientes_medicos_smd_vital_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Exportación Exitosa",
        description: "Los expedientes han sido exportados correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Error exportando expedientes: " + (err.message || "Error desconocido"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "green";
      case "archived": return "gray";
      case "pending": return "yellow";
      default: return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active": return "Activo";
      case "archived": return "Archivado";
      case "pending": return "Pendiente";
      default: return status;
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    onOpen();
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setEditRecord({
      patientId: record.patientId || "",
      doctorId: record.doctorId || "",
      diagnosis: record.diagnosis || "",
      symptoms: record.symptoms || "",
      treatment: record.treatment || "",
      medications: record.medications || "",
      allergies: record.allergies || "",
      notes: record.notes || "",
      status: record.status || "active"
    });
    onEditModalOpen();
  };

  const handleDeleteRecordClick = (record) => {
    setSelectedRecord(record);
    onDeleteModalOpen();
  };

  // Filter medical records based on search and filters
  const filteredRecords = Array.isArray(medicalRecords) ? medicalRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesDoctor = !doctorFilter || record.doctorId === doctorFilter;
    
    return matchesSearch && matchesStatus && matchesDoctor;
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
            Expedientes Médicos SMD VITAL
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color={textColorSecondary}
          >
            Gestiona los expedientes médicos SMD VITAL de tus pacientes
          </Text>
        </Box>
        <HStack 
          spacing={{ base: "10px", md: "15px" }}
          justify={{ base: "center", lg: "flex-end" }}
          wrap="wrap"
        >
          <Button
            leftIcon={<Icon as={MdDownload} />}
            colorScheme="gray"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            onClick={handleExportRecords}
          >
            Exportar
          </Button>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            colorScheme="gray"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            onClick={loadMedicalRecords}
            isLoading={isLoading}
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<Icon as={MdUpload} />}
            colorScheme="blue"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            width={{ base: "full", sm: "auto" }}
          >
            Importar SMD VITAL
          </Button>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="record"
            size={{ base: "md", md: "lg" }}
            onClick={onOpen}
            width={{ base: "full", sm: "auto" }}
          >
            Nuevo Expediente SMD VITAL
          </Button>
        </HStack>
      </Flex>

      {/* Estadísticas de Expedientes Médicos */}
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
              Total Expedientes
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.totalRecords}
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
              Expedientes Activos
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.activeRecords}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <Progress 
                value={stats.totalRecords > 0 ? (stats.activeRecords/stats.totalRecords)*100 : 0} 
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
              Expedientes Archivados
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.archivedRecords}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="decrease" />
              3.1%
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
              Pendientes
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {stats.pendingRecords}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              1.5%
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
              placeholder="Buscar expediente SMD VITAL..." 
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
            <option value="archived">Archivados</option>
            <option value="pending">Pendientes</option>
          </Select>
          <Select 
            placeholder="Filtrar por doctor"
            size={{ base: "md", md: "lg" }}
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="">Todos los doctores</option>
            <option value="dr-carlos">Dr. Carlos López - SMD VITAL</option>
            <option value="dr-ana">Dr. Ana Martínez - SMD VITAL</option>
          </Select>
        </Grid>
      </Box>

      {/* Tabla de Expedientes */}
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
          minW="900px"
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
                Doctor
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                Diagnóstico
              </Th>
              <Th color={textColorSecondary} fontSize={{ base: "xs", md: "sm" }}>
                Última Actualización
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
                <Td colSpan={7} textAlign="center" py="50px">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="brand.500" />
                    <Text color={textColorSecondary}>Cargando expedientes...</Text>
                  </VStack>
                </Td>
              </Tr>
            ) : error ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py="50px">
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                </Td>
              </Tr>
            ) : filteredRecords.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py="50px">
                  <VStack spacing={4}>
                    <Icon as={MdFileCopy} boxSize="50px" color={textColorSecondary} />
                    <Text color={textColorSecondary}>
                      {medicalRecords.length === 0 
                        ? "No hay expedientes registrados. Crea el primer expediente usando el botón 'Nuevo Expediente SMD VITAL'"
                        : "No se encontraron expedientes con los filtros aplicados"
                      }
                    </Text>
                    {medicalRecords.length === 0 && (
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={MdAdd} />}
                        onClick={onOpen}
                        size="sm"
                      >
                        Crear Primer Expediente
                      </Button>
                    )}
                  </VStack>
                </Td>
              </Tr>
            ) : (
              filteredRecords.map((record) => (
              <Tr key={record.id}>
                <Td>
                  <VStack align="start" spacing="2px">
                    <Text 
                      fontWeight="600" 
                      color={textColor}
                      fontSize={{ base: "xs", md: "sm" }}
                      isTruncated
                      maxW="150px"
                    >
                      {record.patient}
                    </Text>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      color={textColorSecondary}
                      display={{ base: "block", md: "none" }}
                    >
                      ID: {record.patientId}
                    </Text>
                  </VStack>
                </Td>
                <Td 
                  color={textColor} 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", md: "table-cell" }}
                >
                  {record.patientId}
                </Td>
                <Td 
                  color={textColor} 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", lg: "table-cell" }}
                  isTruncated
                  maxW="200px"
                >
                  {record.doctor}
                </Td>
                <Td 
                  color={textColor} 
                  fontSize={{ base: "xs", md: "sm" }}
                  display={{ base: "none", xl: "table-cell" }}
                  isTruncated
                  maxW="200px"
                >
                  {record.diagnosis}
                </Td>
                <Td 
                  color={textColor}
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  {record.lastUpdate}
                </Td>
                <Td>
                  <Badge 
                    colorScheme={getStatusColor(record.status)} 
                    variant="solid"
                    size={{ base: "sm", md: "md" }}
                  >
                    {getStatusText(record.status)}
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
                      onClick={() => handleViewRecord(record)}
                    >
                      <Text display={{ base: "none", sm: "block" }}>Ver</Text>
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdEdit} />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => handleEditRecord(record)}
                    >
                      <Text display={{ base: "none", sm: "block" }}>Editar</Text>
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdDownload} />}
                      variant="outline"
                      colorScheme="green"
                    >
                      <Text display={{ base: "none", sm: "block" }}>Descargar</Text>
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdDelete} />}
                      variant="outline"
                      colorScheme="red"
                      onClick={() => handleDeleteRecordClick(record)}
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

      {/* Modal de Detalles del Expediente */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "xl", lg: "6xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Expediente Médico - {selectedRecord?.patient}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedRecord && (
              <Tabs>
                <TabList 
                  flexWrap="wrap"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  <Tab fontSize={{ base: "xs", md: "sm" }}>Información General</Tab>
                  <Tab fontSize={{ base: "xs", md: "sm" }}>Historial Médico</Tab>
                  <Tab fontSize={{ base: "xs", md: "sm" }}>Medicamentos</Tab>
                  <Tab fontSize={{ base: "xs", md: "sm" }}>Exámenes</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Grid 
                      templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                      gap={{ base: "15px", md: "20px" }}
                    >
                      <FormControl>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Paciente</FormLabel>
                        <Input 
                          value={selectedRecord.patient} 
                          isReadOnly 
                          size={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                        <Input 
                          value={selectedRecord.patientId} 
                          isReadOnly 
                          size={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Doctor Asignado</FormLabel>
                        <Input 
                          value={selectedRecord.doctor} 
                          isReadOnly 
                          size={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Estado</FormLabel>
                        <Input 
                          value={getStatusText(selectedRecord.status)} 
                          isReadOnly 
                          size={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Fecha de Creación</FormLabel>
                        <Input 
                          value={selectedRecord.dateCreated} 
                          isReadOnly 
                          size={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Última Actualización</FormLabel>
                        <Input 
                          value={selectedRecord.lastUpdate} 
                          isReadOnly 
                          size={{ base: "sm", md: "md" }}
                        />
                      </FormControl>
                    </Grid>
                    <FormControl mt="20px">
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Diagnóstico Principal</FormLabel>
                      <Textarea 
                        value={selectedRecord.diagnosis} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                        minH={{ base: "80px", md: "100px" }}
                      />
                    </FormControl>
                    <FormControl mt="20px">
                      <FormLabel fontSize={{ base: "sm", md: "md" }}>Alergias Conocidas</FormLabel>
                      <Textarea 
                        value={selectedRecord.allergies} 
                        isReadOnly 
                        size={{ base: "sm", md: "md" }}
                        minH={{ base: "80px", md: "100px" }}
                      />
                    </FormControl>
                  </TabPanel>

                  <TabPanel>
                    <Accordion allowMultiple>
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box as="span" flex="1" textAlign="left">
                              Consulta del 20/01/2024
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Text>Consulta de seguimiento para control de hipertensión arterial. Presión arterial: 140/90 mmHg. Se ajusta medicación.</Text>
                        </AccordionPanel>
                      </AccordionItem>
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box as="span" flex="1" textAlign="left">
                              Consulta del 15/01/2024
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Text>Primera consulta. Se establece diagnóstico de hipertensión arterial. Se inicia tratamiento con Losartán.</Text>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
                      <Box 
                        p={{ base: "10px", md: "15px" }} 
                        bg="gray.50" 
                        borderRadius="12px"
                      >
                        <HStack 
                          justify="space-between" 
                          direction={{ base: "column", sm: "row" }}
                          align={{ base: "start", sm: "center" }}
                          spacing={2}
                        >
                          <Text 
                            fontWeight="600" 
                            fontSize={{ base: "sm", md: "md" }}
                            isTruncated
                            maxW="200px"
                          >
                            Losartán 50mg
                          </Text>
                          <Badge colorScheme="green" size={{ base: "sm", md: "md" }}>
                            Activo
                          </Badge>
                        </HStack>
                        <Text 
                          fontSize={{ base: "xs", md: "sm" }} 
                          color={textColorSecondary} 
                          mt="5px"
                        >
                          Una tableta al día, preferiblemente en la mañana
                        </Text>
                      </Box>
                      <Box 
                        p={{ base: "10px", md: "15px" }} 
                        bg="gray.50" 
                        borderRadius="12px"
                      >
                        <HStack 
                          justify="space-between" 
                          direction={{ base: "column", sm: "row" }}
                          align={{ base: "start", sm: "center" }}
                          spacing={2}
                        >
                          <Text 
                            fontWeight="600" 
                            fontSize={{ base: "sm", md: "md" }}
                            isTruncated
                            maxW="200px"
                          >
                            Hidroclorotiazida 12.5mg
                          </Text>
                          <Badge colorScheme="yellow" size={{ base: "sm", md: "md" }}>
                            Pendiente
                          </Badge>
                        </HStack>
                        <Text 
                          fontSize={{ base: "xs", md: "sm" }} 
                          color={textColorSecondary} 
                          mt="5px"
                        >
                          Una tableta al día, en la mañana
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
                      <Box 
                        p={{ base: "10px", md: "15px" }} 
                        bg="blue.50" 
                        borderRadius="12px"
                      >
                        <HStack 
                          justify="space-between" 
                          direction={{ base: "column", sm: "row" }}
                          align={{ base: "start", sm: "center" }}
                          spacing={2}
                        >
                          <Text 
                            fontWeight="600" 
                            fontSize={{ base: "sm", md: "md" }}
                            isTruncated
                            maxW="200px"
                          >
                            Hemograma Completo
                          </Text>
                          <Badge colorScheme="green" size={{ base: "sm", md: "md" }}>
                            Completado
                          </Badge>
                        </HStack>
                        <Text 
                          fontSize={{ base: "xs", md: "sm" }} 
                          color={textColorSecondary} 
                          mt="5px"
                        >
                          Fecha: 18/01/2024 - Resultados dentro de parámetros normales
                        </Text>
                      </Box>
                      <Box 
                        p={{ base: "10px", md: "15px" }} 
                        bg="blue.50" 
                        borderRadius="12px"
                      >
                        <HStack 
                          justify="space-between" 
                          direction={{ base: "column", sm: "row" }}
                          align={{ base: "start", sm: "center" }}
                          spacing={2}
                        >
                          <Text 
                            fontWeight="600" 
                            fontSize={{ base: "sm", md: "md" }}
                            isTruncated
                            maxW="200px"
                          >
                            Perfil Lipídico
                          </Text>
                          <Badge colorScheme="yellow" size={{ base: "sm", md: "md" }}>
                            Pendiente
                          </Badge>
                        </HStack>
                        <Text 
                          fontSize={{ base: "xs", md: "sm" }} 
                          color={textColorSecondary} 
                          mt="5px"
                        >
                          Programado para: 25/01/2024
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal para Crear Nuevo Expediente */}
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
            Crear Nuevo Expediente Médico SMD VITAL
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
              <Grid 
                templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                gap={{ base: "15px", md: "20px" }}
              >
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                  <Input 
                    value={newRecord.patientId}
                    onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
                    placeholder="SMD001"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Doctor</FormLabel>
                  <Input 
                    value={newRecord.doctorId}
                    onChange={(e) => setNewRecord({...newRecord, doctorId: e.target.value})}
                    placeholder="DOC001"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Diagnóstico Principal</FormLabel>
                  <Input 
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    placeholder="Hipertensión arterial"
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Estado</FormLabel>
                  <Select 
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({...newRecord, status: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="active">Activo</option>
                    <option value="archived">Archivado</option>
                    <option value="pending">Pendiente</option>
                  </Select>
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Síntomas</FormLabel>
                  <Textarea 
                    value={newRecord.symptoms}
                    onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                    placeholder="Dolor de cabeza, mareos, fatiga..."
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Tratamiento</FormLabel>
                  <Textarea 
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                    placeholder="Control de presión arterial, dieta baja en sodio..."
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Medicamentos</FormLabel>
                  <Textarea 
                    value={newRecord.medications}
                    onChange={(e) => setNewRecord({...newRecord, medications: e.target.value})}
                    placeholder="Losartán 50mg una vez al día..."
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Alergias Conocidas</FormLabel>
                  <Textarea 
                    value={newRecord.allergies}
                    onChange={(e) => setNewRecord({...newRecord, allergies: e.target.value})}
                    placeholder="Penicilina, Aspirina..."
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Notas Adicionales</FormLabel>
                  <Textarea 
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    placeholder="Observaciones del médico, recomendaciones..."
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
                  onClick={handleCreateRecord}
                  isLoading={isLoading}
                >
                  Crear Expediente
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

      {/* Modal para Editar Expediente */}
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
            Editar Expediente Médico SMD VITAL
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
              <Grid 
                templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                gap={{ base: "15px", md: "20px" }}
              >
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Paciente</FormLabel>
                  <Input 
                    value={editRecord.patientId}
                    onChange={(e) => setEditRecord({...editRecord, patientId: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>ID del Doctor</FormLabel>
                  <Input 
                    value={editRecord.doctorId}
                    onChange={(e) => setEditRecord({...editRecord, doctorId: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Diagnóstico Principal</FormLabel>
                  <Input 
                    value={editRecord.diagnosis}
                    onChange={(e) => setEditRecord({...editRecord, diagnosis: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Estado</FormLabel>
                  <Select 
                    value={editRecord.status}
                    onChange={(e) => setEditRecord({...editRecord, status: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                  >
                    <option value="active">Activo</option>
                    <option value="archived">Archivado</option>
                    <option value="pending">Pendiente</option>
                  </Select>
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Síntomas</FormLabel>
                  <Textarea 
                    value={editRecord.symptoms}
                    onChange={(e) => setEditRecord({...editRecord, symptoms: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Tratamiento</FormLabel>
                  <Textarea 
                    value={editRecord.treatment}
                    onChange={(e) => setEditRecord({...editRecord, treatment: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Medicamentos</FormLabel>
                  <Textarea 
                    value={editRecord.medications}
                    onChange={(e) => setEditRecord({...editRecord, medications: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Alergias Conocidas</FormLabel>
                  <Textarea 
                    value={editRecord.allergies}
                    onChange={(e) => setEditRecord({...editRecord, allergies: e.target.value})}
                    size={{ base: "sm", md: "md" }}
                    minH={{ base: "80px", md: "100px" }}
                  />
                </FormControl>
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize={{ base: "sm", md: "md" }}>Notas Adicionales</FormLabel>
                  <Textarea 
                    value={editRecord.notes}
                    onChange={(e) => setEditRecord({...editRecord, notes: e.target.value})}
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
                  onClick={handleUpdateRecord}
                  isLoading={isLoading}
                >
                  Actualizar Expediente
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

      {/* Modal para Eliminar Expediente */}
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
            Eliminar Expediente Médico
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedRecord && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                <Alert status="warning">
                  <AlertIcon />
                  <Text fontSize="sm">
                    ¿Estás seguro de que quieres eliminar el expediente médico de {selectedRecord.patient}? 
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
                    <Text fontWeight="bold">Información del Expediente:</Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Paciente:</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedRecord.patient}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">ID:</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedRecord.patientId}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Diagnóstico:</Text>
                      <Text fontSize="sm" fontWeight="bold">{selectedRecord.diagnosis}</Text>
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
                    onClick={handleDeleteRecord}
                    isLoading={isLoading}
                  >
                    Eliminar Expediente
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
