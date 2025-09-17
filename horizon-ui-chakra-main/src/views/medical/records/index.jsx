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
} from "@chakra-ui/react";
import React, { useState } from "react";
// Assets
import { MdSearch, MdAdd, MdEdit, MdVisibility, MdDownload, MdUpload } from "react-icons/md";

export default function MedicalRecords() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Datos simulados de expedientes SMD VITAL
  const medicalRecords = [
    {
      id: 1,
      patient: "María González",
      patientId: "SMD001",
      doctor: "Dr. Carlos López - SMD VITAL",
      dateCreated: "2024-01-15",
      lastUpdate: "2024-01-20",
      status: "active",
      diagnosis: "Hipertensión arterial SMD VITAL",
      allergies: "Penicilina",
      medications: "Losartán 50mg - SMD VITAL",
      nextAppointment: "2024-02-15"
    },
    {
      id: 2,
      patient: "Juan Pérez",
      patientId: "SMD002",
      doctor: "Dr. Ana Martínez - SMD VITAL",
      dateCreated: "2024-01-10",
      lastUpdate: "2024-01-18",
      status: "active",
      diagnosis: "Diabetes tipo 2 SMD VITAL",
      allergies: "Ninguna",
      medications: "Metformina 850mg - SMD VITAL",
      nextAppointment: "2024-02-10"
    },
    {
      id: 3,
      patient: "Laura Rodríguez",
      patientId: "SMD003",
      doctor: "Dr. Carlos López - SMD VITAL",
      dateCreated: "2024-01-12",
      lastUpdate: "2024-01-19",
      status: "archived",
      diagnosis: "Gripe común SMD VITAL",
      allergies: "Ninguna",
      medications: "Paracetamol - SMD VITAL",
      nextAppointment: "No programada"
    },
    {
      id: 4,
      patient: "Pedro Sánchez",
      patientId: "SMD004",
      doctor: "Dr. Ana Martínez - SMD VITAL",
      dateCreated: "2024-01-08",
      lastUpdate: "2024-01-16",
      status: "active",
      diagnosis: "Artritis reumatoide SMD VITAL",
      allergies: "Aspirina",
      medications: "Methotrexate 15mg - SMD VITAL",
      nextAppointment: "2024-02-08"
    }
  ];

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
            />
          </InputGroup>
          <Select 
            placeholder="Filtrar por estado"
            size={{ base: "md", md: "lg" }}
          >
            <option value="active">Activos</option>
            <option value="archived">Archivados</option>
            <option value="pending">Pendientes</option>
          </Select>
          <Select 
            placeholder="Filtrar por doctor"
            size={{ base: "md", md: "lg" }}
          >
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
            {medicalRecords.map((record) => (
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
                  </HStack>
                </Td>
              </Tr>
            ))}
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
    </Box>
  );
}
