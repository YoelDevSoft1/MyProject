import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
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

const RealAIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [aiStatus, setAiStatus] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const loadAvailableModels = useCallback(async () => {
    try {
      console.log('Cargando modelos de OpenAI desde ai-langgraph...');
      const response = await fetch('http://localhost:8008/ai/models', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const openaiModels = (data.models || []).filter(m => m.provider === 'openai');
      const models = openaiModels.map(m => ({
        name: m.name,
        provider: 'openai',
        free: false,
        description: `Modelo ${m.name} - OpenAI`,
        memory_required: 'N/A',
        best_for: 'Asistente médico conversacional'
        }));
        setAvailableModels(models);
      if (models.length > 0) {
        const preferred = models.find(m => m.name === 'gpt-4o-mini') || models.find(m => m.name === 'gpt-4') || models[0];
        setSelectedModel(preferred.name);
      }
    } catch (error) {
      console.error('Error cargando modelos:', error);
      setAvailableModels([]);
      setAiStatus(prev => ({ ...prev, status: 'unhealthy' }));
      
      toast({
        title: 'Advertencia',
        description: 'No se pudo cargar la lista de modelos de OpenAI.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Cargar modelos disponibles
  useEffect(() => {
    loadAvailableModels();
    checkAIStatus();
  }, [loadAvailableModels]);

  // Scroll automático a los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAIStatus = async () => {
    try {
      console.log('Verificando estado de ai-langgraph...');
      const response = await fetch('http://localhost:8008/health');
      if (!response.ok) throw new Error('Respuesta inválida de ai-langgraph');
      setAiStatus({ status: 'healthy' });
    } catch (error) {
      console.error('Error verificando estado de IA:', error);
      setAiStatus({ status: 'unhealthy' });
    }
  };

  // Función para instalar modelos directamente en Ollama (opcional)
  const installModel = async () => {};

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
      if (useStreaming) {
        await sendStreamingMessage(inputMessage);
      } else {
        await sendRegularMessage(inputMessage);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendRegularMessage = async (message) => {
    try {
      console.log('Enviando mensaje:', { message, model: selectedModel });
      
      const response = await fetch('http://localhost:8008/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          user_id: 'user',
          workflow: 'diagnosis',
          model: selectedModel,
          context: {}
        }),
      });

      console.log('Respuesta de ai-langgraph:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Datos de respuesta de IA:', data);

      if (data.response) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
          model: data.model_used || selectedModel,
          confidence: data.confidence ?? 0.8
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('No se recibió respuesta válida:', data);
        throw new Error('No se recibió respuesta de IA');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      // Mostrar mensaje de error en el chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: `Lo siento, no pude procesar tu consulta. Error: ${error instanceof Error ? error.message : 'Error desconocido'}. Intenta con una consulta más simple.`,
        isUser: false,
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMessage]);
      
      throw error;
    }
  };

  const sendStreamingMessage = async (message) => {
    try {
      console.log('Enviando mensaje streaming:', { message, model: selectedModel });
      
      const response = await fetch('http://localhost:8008/ai/query/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          user_id: 'user',
          workflow: 'diagnosis',
          model: selectedModel,
          context: {}
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = {
        id: (Date.now() + 1).toString(),
        content: '',
        isUser: false,
        timestamp: new Date(),
        model: selectedModel,
        confidence: 0.8
      };
      
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                aiMessage.content += data.chunk;
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMessage.id ? { ...aiMessage } : msg
                ));
              }
            } catch (e) {
              console.warn('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error enviando mensaje streaming:', error);
      throw error;
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getModelStatus = (modelName) => {
    if (!aiStatus?.installed_models) return 'unknown';
    
    // Asegurar que installed_models sea un array
    const installedModels = Array.isArray(aiStatus.installed_models) 
      ? aiStatus.installed_models 
      : [];
    
    // Verificar si el modelo está instalado (comparar nombres completos o parciales)
    const isInstalled = installedModels.some(installedModel => 
      installedModel === modelName || 
      installedModel.includes(modelName) ||
      modelName.includes(installedModel.split(':')[0])
    );
    
    return isInstalled ? 'installed' : 'not_installed';
  };

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">🤖 IA Médica SMD VITAL</Heading>
            <HStack spacing={2}>
              <Badge colorScheme={aiStatus?.status === 'healthy' ? 'green' : 'red'}>
                {aiStatus?.status === 'healthy' ? 'Conectado' : 'Desconectado'}
              </Badge>
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
                    {model.name} {getModelStatus(model.name) === 'installed' ? '✓' : '⚠'}
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

            {/* Instalación de modelos no aplica para OpenAI */}

            <Button
              onClick={loadAvailableModels}
              size="sm"
              variant="outline"
            >
              Actualizar
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Alertas */}
      {null}

      {/* Chat Messages */}
      <Box flex="1" overflowY="auto" p={4} bg="gray.50">
        <VStack spacing={4} align="stretch">
          {messages.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" fontSize="lg">
                ¡Hola! Soy tu asistente médico de IA.
              </Text>
              <Text color="gray.400" fontSize="sm" mt={2}>
                Puedes hacerme cualquier pregunta y tendremos una conversación natural.
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
                      {message.confidence && (
                        <Badge size="sm" variant="subtle">
                          {Math.round(message.confidence * 100)}%
                        </Badge>
                      )}
                    </HStack>
                  </CardBody>
                </Card>
              </Box>
            ))
          )}
          {(isLoading || isStreaming) && (
            <Box alignSelf="flex-start">
              <Card>
                <CardBody>
                  <HStack>
                    <Spinner size="sm" />
                    <Text fontSize="sm">
                      {isStreaming ? 'Escribiendo...' : 'Pensando...'}
                    </Text>
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
            placeholder="Escribe tu mensaje aquí... Puedes preguntar cualquier cosa..."
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

export default RealAIChat;
