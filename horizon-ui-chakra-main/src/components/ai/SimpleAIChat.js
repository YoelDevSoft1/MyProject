import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Select,
  Textarea,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Flex,
  IconButton,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid
} from '@chakra-ui/react';

const SimpleAIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('phi');
  const [isLoading, setIsLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const availableModels = [
    {
      name: 'phi',
      description: 'Microsoft Phi - Modelo compacto y eficiente',
      memory_required: '2GB',
      best_for: 'Respuestas rápidas, consultas simples'
    },
    {
      name: 'llama2',
      description: 'Meta Llama 2 - Modelo conversacional general',
      memory_required: '4GB',
      best_for: 'Conversación general, análisis médico básico'
    },
    {
      name: 'medllama',
      description: 'MedLlama - Especializado en medicina',
      memory_required: '4GB',
      best_for: 'Diagnósticos médicos, terminología médica'
    }
  ];

  // Scroll automático a los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simular respuesta de IA
      await simulateAIResponse(inputMessage);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el mensaje',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (message) => {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generar respuesta basada en el mensaje
    let response = '';
    
    if (message.toLowerCase().includes('dolor') || message.toLowerCase().includes('síntoma')) {
      response = `Entiendo que mencionas síntomas. Como asistente médico virtual, te recomiendo:

1. **Consulta médica profesional**: Es importante que consultes con un médico para un diagnóstico adecuado.

2. **Síntomas a observar**: 
   - Intensidad del dolor (escala 1-10)
   - Duración y frecuencia
   - Factores que lo empeoran o mejoran

3. **Signos de alarma**: Si experimentas dolor severo, dificultad para respirar, o síntomas que empeoran rápidamente, busca atención médica inmediata.

¿Podrías proporcionar más detalles sobre tus síntomas para una mejor orientación?`;
    } else if (message.toLowerCase().includes('medicamento') || message.toLowerCase().includes('medicina')) {
      response = `Sobre medicamentos, es importante recordar:

1. **No automedicarse**: Siempre consulta con un médico antes de tomar cualquier medicamento.

2. **Información importante**:
   - Alergias conocidas
   - Medicamentos actuales
   - Condiciones médicas existentes

3. **Dosis y horarios**: Sigue exactamente las indicaciones del médico.

4. **Efectos secundarios**: Si experimentas efectos adversos, suspende el medicamento y consulta inmediatamente.

¿Tienes alguna pregunta específica sobre medicamentos que te haya recetado tu médico?`;
    } else if (message.toLowerCase().includes('presión') || message.toLowerCase().includes('tensión')) {
      response = `Sobre la presión arterial:

1. **Valores normales**: 
   - Sistólica: menos de 120 mmHg
   - Diastólica: menos de 80 mmHg

2. **Factores que influyen**:
   - Estrés y ansiedad
   - Alimentación (sal, alcohol)
   - Ejercicio regular
   - Peso corporal

3. **Recomendaciones**:
   - Dieta baja en sodio
   - Ejercicio regular
   - Control del estrés
   - Monitoreo regular

¿Te han diagnosticado hipertensión o tienes valores elevados?`;
    } else {
      response = `Gracias por tu consulta. Como asistente médico virtual, puedo ayudarte con:

🔍 **Análisis de síntomas**
💊 **Información sobre medicamentos**
📊 **Interpretación de signos vitales**
📋 **Orientación médica general**

**Importante**: Recuerda que no reemplazo la consulta médica profesional. Para diagnósticos específicos o tratamientos, siempre consulta con tu médico.

¿En qué más puedo ayudarte hoy?`;
    }

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: response,
      isUser: false,
      timestamp: new Date(),
      model: selectedModel
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">🤖 IA Médica SMD VITAL</Heading>
            <HStack spacing={2}>
              <Badge colorScheme="green">Conectado</Badge>
              {onClose && (
                <IconButton
                  aria-label="Cerrar"
                  icon={<Text>✕</Text>}
                  size="sm"
                  onClick={onClose}
                />
              )}
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Modelos Disponibles</StatLabel>
              <StatNumber>{availableModels.length}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                Total disponible
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Modelo Actual</StatLabel>
              <StatNumber fontSize="sm">{selectedModel}</StatNumber>
              <StatHelpText>
                {availableModels.find(m => m.name === selectedModel)?.memory_required || 'N/A'}
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Mensajes</StatLabel>
              <StatNumber>{messages.length}</StatNumber>
              <StatHelpText>
                En esta conversación
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Configuración */}
      <Card mt={4}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <FormControl minW="200px">
              <FormLabel>Modelo de IA</FormLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                isDisabled={isLoading}
              >
                {availableModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl minW="150px">
              <FormLabel>Modo</FormLabel>
              <HStack>
                <Switch
                  isChecked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                  isDisabled={isLoading}
                />
                <Text fontSize="sm">
                  {useStreaming ? 'Streaming' : 'Normal'}
                </Text>
              </HStack>
            </FormControl>
          </HStack>
        </CardBody>
      </Card>

      {/* Chat Messages */}
      <Box flex="1" overflowY="auto" p={4} bg="gray.50">
        <VStack spacing={4} align="stretch">
          {messages.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" fontSize="lg">
                ¡Hola! Soy tu asistente médico de IA.
              </Text>
              <Text color="gray.400" fontSize="sm" mt={2}>
                Puedes hacerme preguntas sobre síntomas, medicamentos, o cualquier tema médico.
              </Text>
            </Box>
          ) : (
            messages.map((message) => (
              <Box
                key={message.id}
                alignSelf={message.isUser ? 'flex-end' : 'flex-start'}
                maxW="80%"
              >
                <Card
                  bg={message.isUser ? 'blue.500' : 'white'}
                  color={message.isUser ? 'white' : 'black'}
                >
                  <CardBody>
                    <Text whiteSpace="pre-wrap">{message.content}</Text>
                    <HStack mt={2} spacing={2} fontSize="xs" opacity={0.7}>
                      <Text>
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                      {message.model && (
                        <Badge size="sm" variant="subtle">
                          {message.model}
                        </Badge>
                      )}
                    </HStack>
                  </CardBody>
                </Card>
              </Box>
            ))
          )}
          {isLoading && (
            <Box alignSelf="flex-start">
              <Card>
                <CardBody>
                  <HStack>
                    <Spinner size="sm" />
                    <Text fontSize="sm">Pensando...</Text>
                  </HStack>
                </CardBody>
              </Card>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Input */}
      <Box p={4} bg="white" borderTop="1px" borderColor="gray.200">
        <HStack spacing={2}>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu consulta médica aquí..."
            resize="none"
            rows={2}
            isDisabled={isLoading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <VStack spacing={2}>
            <Button
              onClick={sendMessage}
              isLoading={isLoading}
              loadingText="Enviando"
              colorScheme="blue"
              isDisabled={!inputMessage.trim() || isLoading}
            >
              Enviar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearChat}
              isDisabled={isLoading}
            >
              Limpiar
            </Button>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default SimpleAIChat;
