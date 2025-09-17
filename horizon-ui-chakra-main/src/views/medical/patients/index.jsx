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
} from "@chakra-ui/react";
import React, { useState } from "react";
// Assets
import { MdSearch, MdAdd, MdEdit, MdDelete, MdVisibility, MdPhone, MdCalendarToday } from "react-icons/md";
import { FaMars, FaVenus } from "react-icons/fa";

export default function Patients() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Datos simulados de pacientes SMD VITAL
  const patients = [
    {
      id: 1,
      name: "María González",
      patientId: "SMD001",
      age: 45,
      gender: "female",
      phone: "+57 300 123 4567",
      email: "maria.gonzalez@smdvital.com",
      address: "Calle 123 #45-67, Bogotá - SMD VITAL",
      bloodType: "O+",
      emergencyContact: "Carlos González - +57 300 987 6543",
      lastVisit: "2024-01-20",
      status: "active",
      insurance: "Sura - SMD VITAL",
      allergies: "Penicilina"
    },
    {
      id: 2,
      name: "Juan Pérez",
      patientId: "SMD002",
      age: 32,
      gender: "male",
      phone: "+57 300 234 5678",
      email: "juan.perez@smdvital.com",
      address: "Carrera 45 #78-90, Medellín - SMD VITAL",
      bloodType: "A+",
      emergencyContact: "Ana Pérez - +57 300 876 5432",
      lastVisit: "2024-01-18",
      status: "active",
      insurance: "Nueva EPS - SMD VITAL",
      allergies: "Ninguna"
    },
    {
      id: 3,
      name: "Laura Rodríguez",
      patientId: "SMD003",
      age: 28,
      gender: "female",
      phone: "+57 300 345 6789",
      email: "laura.rodriguez@smdvital.com",
      address: "Avenida 80 #12-34, Cali - SMD VITAL",
      bloodType: "B+",
      emergencyContact: "Miguel Rodríguez - +57 300 765 4321",
      lastVisit: "2024-01-19",
      status: "inactive",
      insurance: "Sanitas - SMD VITAL",
      allergies: "Ninguna"
    },
    {
      id: 4,
      name: "Pedro Sánchez",
      patientId: "SMD004",
      age: 55,
      gender: "male",
      phone: "+57 300 456 7890",
      email: "pedro.sanchez@smdvital.com",
      address: "Calle 100 #56-78, Barranquilla - SMD VITAL",
      bloodType: "AB+",
      emergencyContact: "Carmen Sánchez - +57 300 654 3210",
      lastVisit: "2024-01-16",
      status: "active",
      insurance: "Compensar - SMD VITAL",
      allergies: "Aspirina"
    }
  ];

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
        <Button
          leftIcon={<Icon as={MdAdd} />}
          colorScheme="patient"
          size={{ base: "md", md: "lg" }}
          onClick={onOpen}
          width={{ base: "full", lg: "auto" }}
        >
          Nuevo Paciente SMD VITAL
        </Button>
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
              placeholder="Buscar paciente SMD VITAL..." 
              size={{ base: "md", md: "lg" }}
            />
          </InputGroup>
          <Select 
            placeholder="Filtrar por estado"
            size={{ base: "md", md: "lg" }}
          >
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </Select>
          <Select 
            placeholder="Filtrar por género"
            size={{ base: "md", md: "lg" }}
          >
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
            {patients.map((patient) => (
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
    </Box>
  );
}
