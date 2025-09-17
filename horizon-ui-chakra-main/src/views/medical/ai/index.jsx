// Chakra imports
import {
  Box,
  Flex,
  Grid,
  useColorModeValue,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
  HStack,
  VStack,
  Textarea,
  Select,
  Badge,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import React, { useState } from "react";
// Assets
import { MdSend, MdHistory, MdSettings } from "react-icons/md";
import { FaRobot, FaBrain, FaStethoscope, FaPills, FaImage, FaHeartbeat } from "react-icons/fa";

export default function AIMedical() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const queryBg = useColorModeValue("gray.50", "gray.700");
  const queryBorder = useColorModeValue("gray.200", "gray.600");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTool, setSelectedTool] = useState(null);
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Herramientas de IA SMD VITAL disponibles
  const aiTools = [
    {
      id: 1,
      name: "Asistente de Diagnóstico SMD VITAL",
      description: "Analiza síntomas y sugiere posibles diagnósticos SMD VITAL",
      icon: FaStethoscope,
      status: "active",
      usage: 95,
      lastUsed: "2024-01-20",
      category: "diagnosis"
    },
    {
      id: 2,
      name: "Recomendador de Medicamentos SMD VITAL",
      description: "Sugiere medicamentos SMD VITAL basados en síntomas y alergias",
      icon: FaPills,
      status: "active",
      usage: 88,
      lastUsed: "2024-01-19",
      category: "medication"
    },
    {
      id: 3,
      name: "Analizador de Imágenes SMD VITAL",
      description: "Analiza radiografías, tomografías y resonancias SMD VITAL",
      icon: FaImage,
      status: "active",
      usage: 82,
      lastUsed: "2024-01-18",
      category: "imaging"
    },
    {
      id: 4,
      name: "Monitor de Signos Vitales SMD VITAL",
      description: "Monitorea y analiza signos vitales SMD VITAL en tiempo real",
      icon: FaHeartbeat,
      status: "active",
      usage: 96,
      lastUsed: "2024-01-20",
      category: "monitoring"
    },
    {
      id: 5,
      name: "Asistente de Documentación SMD VITAL",
      description: "Ayuda a generar notas médicas y reportes SMD VITAL",
      icon: FaBrain,
      status: "maintenance",
      usage: 65,
      lastUsed: "2024-01-15",
      category: "documentation"
    },
    {
      id: 6,
      name: "Predictor de Riesgos SMD VITAL",
      description: "Evalúa riesgos de salud SMD VITAL basados en historial",
      icon: FaRobot,
      status: "active",
      usage: 88,
      lastUsed: "2024-01-17",
      category: "prediction"
    }
  ];

  // Historial de consultas SMD VITAL recientes
  const recentQueries = [
    {
      id: 1,
      query: "Paciente SMD VITAL con dolor de cabeza, fiebre y náuseas",
      response: "Posibles diagnósticos SMD VITAL: Migraña, Gripe, Meningitis. Recomiendo exámenes adicionales SMD VITAL.",
      timestamp: "2024-01-20 14:30",
      tool: "Asistente de Diagnóstico SMD VITAL",
      confidence: 95
    },
    {
      id: 2,
      query: "Medicamento SMD VITAL para hipertensión en paciente diabético",
      response: "Recomiendo Losartán 50mg SMD VITAL. Evitar diuréticos tiazídicos. Monitorear función renal SMD VITAL.",
      timestamp: "2024-01-20 11:15",
      tool: "Recomendador de Medicamentos SMD VITAL",
      confidence: 98
    },
    {
      id: 3,
      query: "Análisis SMD VITAL de radiografía de tórax",
      response: "Hallazgos SMD VITAL: Infiltrado en lóbulo inferior derecho. Sugiero TAC SMD VITAL para confirmación.",
      timestamp: "2024-01-19 16:45",
      tool: "Analizador de Imágenes SMD VITAL",
      confidence: 88
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "green";
      case "maintenance": return "yellow";
      case "inactive": return "red";
      default: return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active": return "Activo";
      case "maintenance": return "Mantenimiento";
      case "inactive": return "Inactivo";
      default: return status;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return "green";
    if (confidence >= 70) return "yellow";
    return "red";
  };

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    onOpen();
  };

  const handleQuerySubmit = () => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      // Aquí se procesaría la consulta con la IA
      console.log("Procesando consulta:", query);
    }, 2000);
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
            IA Médica SMD VITAL
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color={textColorSecondary}
          >
            Herramientas de inteligencia artificial SMD VITAL para asistencia médica
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={MdSettings} />}
          colorScheme="ai"
          variant="outline"
          size={{ base: "md", md: "lg" }}
          width={{ base: "full", lg: "auto" }}
        >
          Configuración SMD VITAL
        </Button>
      </Flex>

      {/* Estadísticas de IA */}
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
              Herramientas Activas
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {aiTools.filter(t => t.status === "active").length}
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
              Consultas Hoy
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              24
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
              Precisión Promedio
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              87%
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
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
              Tiempo Ahorrado
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              2.5h
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              15.3%
            </StatHelpText>
          </Stat>
        </Box>
      </Grid>

      <Grid 
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }} 
        gap={{ base: "15px", md: "20px" }} 
        mb="20px"
      >
        {/* Herramientas de IA */}
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
            Herramientas Disponibles
          </Text>
          <Grid 
            templateColumns={{ base: "1fr", sm: "1fr 1fr" }} 
            gap={{ base: "10px", md: "15px" }}
          >
            {aiTools.map((tool) => (
              <Card
                key={tool.id}
                cursor="pointer"
                onClick={() => handleToolClick(tool)}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
                size={{ base: "sm", md: "md" }}
              >
                <CardBody p={{ base: "10px", md: "15px" }}>
                  <HStack justify="space-between" mb={{ base: "8px", md: "10px" }}>
                    <Icon 
                      as={tool.icon} 
                      w={{ base: "20px", md: "24px" }} 
                      h={{ base: "20px", md: "24px" }} 
                      color="ai.500" 
                    />
                    <Badge 
                      colorScheme={getStatusColor(tool.status)} 
                      variant="solid"
                      size={{ base: "sm", md: "md" }}
                    >
                      {getStatusText(tool.status)}
                    </Badge>
                  </HStack>
                  <Text 
                    fontWeight="600" 
                    color={textColor} 
                    mb="5px"
                    fontSize={{ base: "sm", md: "md" }}
                    isTruncated
                  >
                    {tool.name}
                  </Text>
                  <Text 
                    fontSize={{ base: "xs", md: "sm" }} 
                    color={textColorSecondary} 
                    mb={{ base: "8px", md: "10px" }}
                    noOfLines={2}
                  >
                    {tool.description}
                  </Text>
                  <VStack spacing="5px" align="stretch">
                    <HStack justify="space-between">
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        color={textColorSecondary}
                      >
                        Uso: {tool.usage}%
                      </Text>
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        color={textColorSecondary}
                        display={{ base: "none", sm: "block" }}
                      >
                        {tool.lastUsed}
                      </Text>
                    </HStack>
                    <Progress 
                      value={tool.usage} 
                      colorScheme="ai" 
                      size={{ base: "xs", md: "sm" }} 
                    />
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>

        {/* Consulta Rápida */}
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
            Consulta Rápida
          </Text>
          <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Herramienta</FormLabel>
              <Select 
                placeholder="Seleccionar herramienta"
                size={{ base: "sm", md: "md" }}
              >
                <option value="diagnosis">Asistente de Diagnóstico</option>
                <option value="medication">Recomendador de Medicamentos</option>
                <option value="imaging">Analizador de Imágenes</option>
                <option value="monitoring">Monitor de Signos Vitales</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Consulta</FormLabel>
              <Textarea
                placeholder="Describe tu consulta médica..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={{ base: 3, md: 4 }}
                size={{ base: "sm", md: "md" }}
              />
            </FormControl>
            <Button
              colorScheme="ai"
              leftIcon={<Icon as={MdSend} />}
              onClick={handleQuerySubmit}
              isLoading={isProcessing}
              loadingText="Procesando..."
              size={{ base: "sm", md: "md" }}
              width="full"
            >
              Consultar IA
            </Button>
          </VStack>
        </Box>
      </Grid>

      {/* Historial de Consultas */}
      <Box
        bg={useColorModeValue("white", "navy.800")}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      >
        <HStack 
          justify="space-between" 
          mb={{ base: "15px", md: "20px" }}
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "center" }}
          spacing={2}
        >
          <Text 
            fontSize={{ base: "md", md: "lg" }} 
            fontWeight="700" 
            color={textColor}
          >
            Consultas Recientes
          </Text>
          <Button
            leftIcon={<Icon as={MdHistory} />}
            variant="outline"
            size={{ base: "sm", md: "md" }}
            width={{ base: "full", sm: "auto" }}
          >
            Ver Todo
          </Button>
        </HStack>
        <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
          {recentQueries.map((query) => (
            <Box
              key={query.id}
              p={{ base: "10px", md: "15px" }}
              bg={queryBg}
              borderRadius="12px"
              border="1px solid"
              borderColor={queryBorder}
            >
              <HStack 
                justify="space-between" 
                mb={{ base: "8px", md: "10px" }}
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                spacing={2}
              >
                <Text 
                  fontWeight="600" 
                  color={textColor}
                  fontSize={{ base: "sm", md: "md" }}
                  isTruncated
                >
                  {query.tool}
                </Text>
                <HStack 
                  spacing={{ base: "5px", md: "10px" }}
                  wrap="wrap"
                  justify={{ base: "center", sm: "flex-end" }}
                >
                  <Badge 
                    colorScheme={getConfidenceColor(query.confidence)} 
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                  >
                    {query.confidence}% confianza
                  </Badge>
                  <Text 
                    fontSize={{ base: "xs", md: "sm" }} 
                    color={textColorSecondary}
                  >
                    {query.timestamp}
                  </Text>
                </HStack>
              </HStack>
              <Text 
                fontSize={{ base: "xs", md: "sm" }} 
                color={textColor} 
                mb={{ base: "8px", md: "10px" }}
              >
                <strong>Consulta:</strong> {query.query}
              </Text>
              <Text 
                fontSize={{ base: "xs", md: "sm" }} 
                color={textColorSecondary}
              >
                <strong>Respuesta:</strong> {query.response}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Modal de Herramienta de IA */}
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
            {selectedTool?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedTool && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                <Alert status="info" size={{ base: "sm", md: "md" }}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize={{ base: "sm", md: "md" }}>Herramienta Activa</AlertTitle>
                    <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
                      Esta herramienta está disponible y lista para usar.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Text 
                  color={textColor}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {selectedTool.description}
                </Text>
                
                <Divider />
                
                <Grid 
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                  gap={{ base: "15px", md: "20px" }}
                >
                  <Box>
                    <Text 
                      fontWeight="600" 
                      color={textColor} 
                      mb="5px"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Estado
                    </Text>
                    <Badge 
                      colorScheme={getStatusColor(selectedTool.status)} 
                      variant="solid"
                      size={{ base: "sm", md: "md" }}
                    >
                      {getStatusText(selectedTool.status)}
                    </Badge>
                  </Box>
                  <Box>
                    <Text 
                      fontWeight="600" 
                      color={textColor} 
                      mb="5px"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Último Uso
                    </Text>
                    <Text 
                      color={textColorSecondary}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {selectedTool.lastUsed}
                    </Text>
                  </Box>
                </Grid>
                
                <Box>
                  <Text 
                    fontWeight="600" 
                    color={textColor} 
                    mb={{ base: "8px", md: "10px" }}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    Nivel de Uso
                  </Text>
                  <Progress 
                    value={selectedTool.usage} 
                    colorScheme="ai" 
                    size={{ base: "md", md: "lg" }} 
                  />
                  <Text 
                    fontSize={{ base: "xs", md: "sm" }} 
                    color={textColorSecondary} 
                    mt="5px"
                  >
                    {selectedTool.usage}% de utilización
                  </Text>
                </Box>
                
                <HStack 
                  spacing={{ base: "5px", md: "10px" }} 
                  justify="center"
                  wrap="wrap"
                >
                  <Button 
                    colorScheme="ai" 
                    leftIcon={<Icon as={FaRobot} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Usar Herramienta
                  </Button>
                  <Button 
                    variant="outline" 
                    leftIcon={<Icon as={MdSettings} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Configurar
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
