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
  Input,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  CodeBlock,
  Tooltip,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
// Assets
import { MdSend, MdHistory, MdSettings, MdRefresh, MdDownload, MdUpload, MdChat } from "react-icons/md";
import { FaRobot, FaBrain, FaStethoscope, FaPills, FaImage, FaHeartbeat, FaFileMedical, FaChartLine } from "react-icons/fa";
// Services
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";

export default function AIMedical() {
  // Auth context
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();
  
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const queryBg = useColorModeValue("gray.50", "gray.700");
  const queryBorder = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("white", "navy.800");
  const boxShadow = useColorModeValue("14px 17px 40px 4px rgba(112, 144, 176, 0.08)", "14px 17px 40px 4px rgba(112, 144, 176, 0.08)");
  
  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isStreamOpen, onOpen: onStreamOpen, onClose: onStreamClose } = useDisclosure();
  
  // AI States
  const [selectedTool, setSelectedTool] = useState(null);
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [selectedWorkflow, setSelectedWorkflow] = useState("diagnosis_workflow");
  const [aiModels, setAiModels] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [aiStats, setAiStats] = useState({
    totalQueries: 0,
    successfulQueries: 0,
    averageConfidence: 0,
    totalProcessingTime: 0
  });
  const [queryHistory, setQueryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const streamingRef = useRef(null);
  const wsRef = useRef(null);

  // Herramientas de IA SMD VITAL disponibles
  const aiTools = [
    {
      id: 1,
      name: "Asistente de Diagnóstico SMD VITAL",
      description: "Analiza síntomas y sugiere posibles diagnósticos usando LangGraph",
      icon: FaStethoscope,
      status: "active",
      usage: 95,
      lastUsed: "2024-01-20",
      category: "diagnosis",
      workflow: "diagnosis_workflow"
    },
    {
      id: 2,
      name: "Recomendador de Medicamentos SMD VITAL",
      description: "Sugiere medicamentos basados en síntomas y alergias con IA",
      icon: FaPills,
      status: "active",
      usage: 88,
      lastUsed: "2024-01-19",
      category: "medication",
      workflow: "medication_workflow"
    },
    {
      id: 3,
      name: "Analizador de Imágenes SMD VITAL",
      description: "Analiza radiografías, tomografías y resonancias con IA",
      icon: FaImage,
      status: "active",
      usage: 82,
      lastUsed: "2024-01-18",
      category: "imaging",
      workflow: "imaging_workflow"
    },
    {
      id: 4,
      name: "Monitor de Signos Vitales SMD VITAL",
      description: "Monitorea y analiza signos vitales en tiempo real",
      icon: FaHeartbeat,
      status: "active",
      usage: 96,
      lastUsed: "2024-01-20",
      category: "monitoring",
      workflow: "monitoring_workflow"
    },
    {
      id: 5,
      name: "Asistente de Documentación SMD VITAL",
      description: "Ayuda a generar notas médicas y reportes con IA",
      icon: FaFileMedical,
      status: "active",
      usage: 65,
      lastUsed: "2024-01-15",
      category: "documentation",
      workflow: "documentation_workflow"
    },
    {
      id: 6,
      name: "Predictor de Riesgos SMD VITAL",
      description: "Evalúa riesgos de salud basados en historial con IA",
      icon: FaChartLine,
      status: "active",
      usage: 88,
      lastUsed: "2024-01-17",
      category: "prediction",
      workflow: "prediction_workflow"
    }
  ];

  // Cargar datos de IA al montar el componente
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAIData();
    }
  }, [isAuthenticated, token]);

  // Cargar datos de IA
  const loadAIData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Cargar modelos y workflows en paralelo
      const [modelsResponse, workflowsResponse] = await Promise.all([
        apiService.getAIModels(token),
        apiService.getAIWorkflows(token)
      ]);
      
      setAiModels(modelsResponse.models || []);
      setWorkflows(workflowsResponse.workflows || []);
      
      // Calcular estadísticas
      calculateAIStats();
      
    } catch (err) {
      setError("Error cargando datos de IA: " + (err.message || "Error desconocido"));
      toast({
        title: "Error de IA",
        description: "No se pudieron cargar los datos de IA",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas de IA
  const calculateAIStats = () => {
    // Simular estadísticas basadas en historial
    const totalQueries = queryHistory.length;
    const successfulQueries = queryHistory.filter(q => q.status === 'completed').length;
    const averageConfidence = queryHistory.length > 0 
      ? queryHistory.reduce((sum, q) => sum + (q.confidence || 0), 0) / queryHistory.length 
      : 0;
    
    setAiStats({
      totalQueries,
      successfulQueries,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      totalProcessingTime: queryHistory.reduce((sum, q) => sum + (q.processingTime || 0), 0)
    });
  };

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

  // Procesar consulta de IA
  const handleQuerySubmit = async () => {
    if (!query.trim() || !selectedWorkflow) return;
    
    setIsProcessing(true);
    setError(null);
    setAiResponse("");
    
    try {
      const queryData = {
        query_type: selectedWorkflow.replace('_workflow', ''),
        query_text: query,
        user_id: 'user_123', // En producción, usar ID real del usuario
        context: {
          model: selectedModel,
          workflow: selectedWorkflow
        }
      };
      
      const response = await apiService.processAIQuery(queryData, token);
      
      setAiResponse(response.response_text);
      
      // Agregar a historial
      const newQuery = {
        id: Date.now(),
        query: query,
        response: response.response_text,
        timestamp: new Date().toLocaleString('es-CO'),
        tool: selectedWorkflow,
        confidence: response.confidence_score,
        status: 'completed',
        processingTime: response.processing_time_ms
      };
      
      setQueryHistory(prev => [newQuery, ...prev.slice(0, 9)]);
      
      toast({
        title: "Consulta procesada",
        description: "La consulta de IA se ha procesado exitosamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (err) {
      setError("Error procesando consulta: " + (err.message || "Error desconocido"));
      toast({
        title: "Error de IA",
        description: "No se pudo procesar la consulta",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar consulta con streaming
  const handleStreamQuery = async () => {
    if (!query.trim() || !selectedWorkflow) return;
    
    setIsStreaming(true);
    setStreamingResponse("");
    onStreamOpen();
    
    try {
      const queryData = {
        query_type: selectedWorkflow.replace('_workflow', ''),
        query_text: query,
        user_id: 'user_123',
        context: {
          model: selectedModel,
          workflow: selectedWorkflow
        }
      };
      
      const response = await apiService.streamAIQuery(queryData, token);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                setStreamingResponse(prev => prev + data.content);
              } else if (data.type === 'complete') {
                setStreamingResponse(prev => prev + data.content);
                setIsStreaming(false);
              }
            } catch (e) {
              // Ignorar líneas malformadas
            }
          }
        }
      }
      
    } catch (err) {
      setError("Error en streaming: " + (err.message || "Error desconocido"));
      setIsStreaming(false);
    }
  };

  // Conectar WebSocket para consultas en tiempo real
  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    wsRef.current = apiService.connectAIWebSocket('user_123', token);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chunk') {
        setStreamingResponse(prev => prev + data.content);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket cerrado');
    };
  };

  // Enviar consulta por WebSocket
  const sendWebSocketQuery = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'query',
        data: {
          query_type: selectedWorkflow.replace('_workflow', ''),
          query_text: query,
          user_id: 'user_123'
        }
      }));
    }
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
            IA Médica SMD VITAL con LangGraph
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color={textColorSecondary}
          >
            Herramientas de inteligencia artificial avanzada para asistencia médica
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            colorScheme="blue"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            onClick={loadAIData}
            isLoading={isLoading}
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<Icon as={MdSettings} />}
            colorScheme="ai"
            variant="outline"
            size={{ base: "md", md: "lg" }}
            width={{ base: "full", lg: "auto" }}
          >
            Configuración
          </Button>
        </HStack>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb="20px">
          <AlertIcon />
          <AlertTitle>Error de IA:</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas de IA */}
      <Grid 
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} 
        gap={{ base: "15px", md: "20px" }} 
        mb="20px"
      >
        <Box
          bg={cardBg}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow={boxShadow}
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Modelos Disponibles
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {aiModels.length}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              LangGraph
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={cardBg}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow={boxShadow}
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Consultas Totales
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {aiStats.totalQueries}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              {aiStats.successfulQueries} exitosas
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={cardBg}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow={boxShadow}
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Confianza Promedio
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {Math.round(aiStats.averageConfidence * 100)}%
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              IA Avanzada
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={cardBg}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow={boxShadow}
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Tiempo Promedio
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {aiStats.totalProcessingTime > 0 ? Math.round(aiStats.totalProcessingTime / aiStats.totalQueries) : 0}ms
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              Tiempo Real
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
          bg={cardBg}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow={boxShadow}
        >
          <Text 
            fontSize={{ base: "md", md: "lg" }} 
            fontWeight="700" 
            color={textColor} 
            mb={{ base: "15px", md: "20px" }}
          >
            Consulta Rápida con LangGraph
          </Text>
          <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Workflow de IA</FormLabel>
              <Select 
                placeholder="Seleccionar workflow"
                size={{ base: "sm", md: "md" }}
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
              >
                <option value="diagnosis_workflow">Diagnóstico Médico</option>
                <option value="medication_workflow">Recomendación de Medicamentos</option>
                <option value="imaging_workflow">Análisis de Imágenes</option>
                <option value="monitoring_workflow">Monitoreo de Signos Vitales</option>
                <option value="documentation_workflow">Documentación Médica</option>
                <option value="prediction_workflow">Predicción de Riesgos</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Modelo de IA</FormLabel>
              <Select 
                placeholder="Seleccionar modelo"
                size={{ base: "sm", md: "md" }}
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {aiModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} ({model.provider})
                  </option>
                ))}
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
            
            <HStack spacing={2}>
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={MdSend} />}
                onClick={handleQuerySubmit}
                isLoading={isProcessing}
                loadingText="Procesando..."
                size={{ base: "sm", md: "md" }}
                flex={1}
              >
                Consultar IA
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<Icon as={MdChat} />}
                onClick={handleStreamQuery}
                isLoading={isStreaming}
                loadingText="Streaming..."
                size={{ base: "sm", md: "md" }}
                flex={1}
              >
                Streaming
              </Button>
            </HStack>
            
            <Button
              colorScheme="purple"
              leftIcon={<Icon as={FaRobot} />}
              onClick={connectWebSocket}
              size={{ base: "sm", md: "md" }}
              width="full"
            >
              Conectar WebSocket
            </Button>
          </VStack>
        </Box>
      </Grid>

      {/* Respuesta de IA */}
      {aiResponse && (
        <Box
          bg={cardBg}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow={boxShadow}
          mb="20px"
        >
          <Text 
            fontSize={{ base: "md", md: "lg" }} 
            fontWeight="700" 
            color={textColor} 
            mb={{ base: "15px", md: "20px" }}
          >
            Respuesta de IA
          </Text>
          <Box
            bg={queryBg}
            borderRadius="12px"
            p={{ base: "10px", md: "15px" }}
            border="1px solid"
            borderColor={queryBorder}
          >
            <Text 
              fontSize={{ base: "sm", md: "md" }} 
              color={textColor}
              whiteSpace="pre-wrap"
            >
              {aiResponse}
            </Text>
          </Box>
        </Box>
      )}

      {/* Streaming Response */}
      {isStreaming && (
        <Box
          bg={cardBg}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow={boxShadow}
          mb="20px"
        >
          <HStack justify="space-between" mb="15px">
            <Text 
              fontSize={{ base: "md", md: "lg" }} 
              fontWeight="700" 
              color={textColor}
            >
              Respuesta en Tiempo Real
            </Text>
            <HStack>
              <Spinner size="sm" color="blue.500" />
              <Text fontSize="sm" color={textColorSecondary}>Procesando...</Text>
            </HStack>
          </HStack>
          <Box
            bg={queryBg}
            borderRadius="12px"
            p={{ base: "10px", md: "15px" }}
            border="1px solid"
            borderColor={queryBorder}
            minH="100px"
          >
            <Text 
              fontSize={{ base: "sm", md: "md" }} 
              color={textColor}
              whiteSpace="pre-wrap"
            >
              {streamingResponse}
            </Text>
          </Box>
        </Box>
      )}

      {/* Historial de Consultas */}
      <Box
        bg={cardBg}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow={boxShadow}
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
          {queryHistory.length > 0 ? (
            queryHistory.map((query) => (
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
                      {Math.round(query.confidence * 100)}% confianza
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
                  noOfLines={3}
                >
                  <strong>Respuesta:</strong> {query.response}
                </Text>
                {query.processingTime && (
                  <Text 
                    fontSize={{ base: "xs", md: "sm" }} 
                    color={textColorSecondary}
                    mt={2}
                  >
                    <strong>Tiempo:</strong> {query.processingTime}ms
                  </Text>
                )}
              </Box>
            ))
          ) : (
            <Box
              p={{ base: "20px", md: "30px" }}
              textAlign="center"
              bg={queryBg}
              borderRadius="12px"
              border="1px solid"
              borderColor={queryBorder}
            >
              <Icon as={FaRobot} w={8} h={8} color={textColorSecondary} mb={4} />
              <Text 
                fontSize={{ base: "sm", md: "md" }} 
                color={textColorSecondary}
                fontWeight="600"
              >
                No hay consultas de IA recientes
              </Text>
              <Text 
                fontSize={{ base: "xs", md: "sm" }} 
                color={textColorSecondary}
                mt={2}
              >
                Realiza tu primera consulta con IA para ver el historial aquí
              </Text>
            </Box>
          )}
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
