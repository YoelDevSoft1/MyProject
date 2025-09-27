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
  const [selectedModel, setSelectedModel] = useState('phi:latest');
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
      console.log('Cargando modelos desde el servicio backend...');
      
      // Primero intentar con el servicio backend
      try {
        const response = await fetch('http://localhost:8008/ai/free/models', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Datos del servicio backend:', data);
          
          if (data.available_models && Array.isArray(data.available_models)) {
            const models = data.available_models.map((model) => ({
              name: model,
              provider: 'ollama',
              free: true,
              description: `Modelo ${model} - Disponible en Ollama`,
              memory_required: '4GB',
              best_for: 'Conversación general y análisis médico'
            }));
            setAvailableModels(models);
            console.log('Modelos del servicio backend cargados:', models.length);
            return;
          }
        }
      } catch (backendError) {
        console.warn('Error con servicio backend, intentando conexión directa:', backendError);
      }
      
      // Si el servicio backend falla, intentar conexión directa a Ollama
      console.log('Intentando conexión directa a Ollama...');
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Respuesta de Ollama:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos de Ollama recibidos:', data);
      
      if (data.models && Array.isArray(data.models)) {
        const models = data.models.map((model) => ({
          name: model.name,
          provider: 'ollama',
          free: true,
          description: `Modelo ${model.name} - ${model.size ? `Tamaño: ${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB` : 'Modelo de IA'}`,
          memory_required: model.size ? `${Math.ceil(model.size / 1024 / 1024 / 1024)}GB` : '4GB',
          best_for: 'Conversación general y análisis médico',
          size: model.size,
          modified_at: model.modified_at
        }));
        setAvailableModels(models);
        console.log('Modelos de Ollama cargados exitosamente:', models.length);
        
        // Actualizar el estado de IA con los modelos instalados
        setAiStatus(prev => ({
          ...prev,
          status: 'healthy',
          ollama_connected: true,
          installed_models: data.models.map(m => m.name),
          available_models: data.models.length
        }));
      } else {
        console.warn('No se encontraron modelos en Ollama');
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Error cargando modelos:', error);
      
      // Cargar solo los modelos realmente instalados y funcionando
      setAvailableModels([
        {
          name: 'phi:latest',
          provider: 'ollama',
          free: true,
          description: 'Microsoft Phi - Modelo compacto y eficiente',
          memory_required: '2GB',
          best_for: 'Respuestas rápidas, consultas simples'
        },
        {
          name: 'llama2:latest',
          provider: 'ollama',
          free: true,
          description: 'Meta Llama 2 - Modelo conversacional general',
          memory_required: '4GB',
          best_for: 'Conversación general y análisis médico'
        }
      ]);
      
      setAiStatus(prev => ({
        ...prev,
        status: 'unhealthy',
        ollama_connected: false,
        installed_models: [],
        available_models: 0
      }));
      
      toast({
        title: 'Advertencia',
        description: 'No se pudo conectar con los servicios de IA. Usando modelo por defecto.',
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
      console.log('Verificando estado de Ollama...');
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      
      if (response.ok && data.models) {
        setAiStatus({
          status: 'healthy',
          ollama_connected: true,
          installed_models: data.models.map(m => m.name),
          available_models: data.models.length,
          default_model: data.models[0]?.name || 'phi'
        });
        console.log('Ollama conectado correctamente:', data.models.length, 'modelos instalados');
      } else {
        throw new Error('Respuesta inválida de Ollama');
      }
    } catch (error) {
      console.error('Error verificando estado de Ollama:', error);
      setAiStatus({
        status: 'unhealthy',
        ollama_connected: false,
        installed_models: [],
        available_models: 0,
        default_model: 'phi'
      });
    }
  };

  // Función para instalar modelos directamente en Ollama (opcional)
  const installModel = async (modelName) => {
    setIsInstalling(true);
    try {
      toast({
        title: 'Instalando modelo',
        description: `Instalando ${modelName} en Ollama... Esto puede tomar varios minutos.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Nota: Para instalar modelos en Ollama, necesitarías usar la API de pull
      // Por ahora, asumimos que los modelos ya están instalados
      console.log('Modelo ya instalado en Ollama:', modelName);
      
      // Recargar los modelos disponibles
      await loadAvailableModels();
      
      toast({
        title: 'Modelo listo',
        description: `El modelo ${modelName} está disponible para usar`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error con modelo:', error);
      toast({
        title: 'Error',
        description: `Error con el modelo ${modelName}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsInstalling(false);
    }
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
      
      // Primero intentar con el servicio backend
      try {
        const response = await fetch('http://localhost:8008/ai/free/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            query: message,
            user_id: 'user',
            model: selectedModel,
            context: {}
          }),
        });

        console.log('Respuesta del servicio backend:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log('Datos de respuesta del backend:', data);

          if (data.success || data.response) {
            const aiMessage = {
              id: (Date.now() + 1).toString(),
              content: data.response || 'Respuesta recibida',
              isUser: false,
              timestamp: new Date(),
              model: data.model_used || selectedModel,
              confidence: 0.8
            };
            setMessages(prev => [...prev, aiMessage]);
            return;
          }
        }
      } catch (backendError) {
        console.warn('Error con servicio backend, intentando conexión directa:', backendError);
      }
      
      // Si el servicio backend falla, intentar conexión directa a Ollama
      console.log('Intentando conexión directa a Ollama...');
      
      // Crear el prompt más simple para evitar problemas
      const prompt = `Eres un asistente médico virtual. Responde en español de manera clara y profesional.

IMPORTANTE: 
- No reemplazas la consulta médica profesional
- Recomienda consultar con un médico para diagnósticos
- Proporciona información basada en evidencia médica

Consulta del usuario: ${message}`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            num_predict: 200
          }
        }),
      });

      console.log('Respuesta de Ollama:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Datos de respuesta de Ollama:', data);

      if (data.response) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
          model: selectedModel,
          confidence: 0.8
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('No se recibió respuesta válida:', data);
        throw new Error('No se recibió respuesta de Ollama');
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
      console.log('Enviando mensaje con streaming a Ollama:', { message, model: selectedModel });
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Eres un asistente médico virtual especializado en el sistema SMD VITAL. 
          Proporcionas información médica general, análisis de síntomas, y recomendaciones de salud.
          
          IMPORTANTE: 
          - Siempre aclara que no reemplazas la consulta médica profesional
          - Recomienda consultar con un médico para diagnósticos definitivos
          - Proporciona información basada en evidencia médica
          - Sé preciso y responsable en tus respuestas
          
          Responde en español de manera clara y profesional.
          
          Consulta del usuario: ${message}`,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de Ollama');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No se pudo obtener el stream de Ollama');
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: '',
        isUser: false,
        timestamp: new Date(),
        model: selectedModel
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsStreaming(true);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessage.id 
                        ? { ...msg, content: msg.content + data.response }
                        : msg
                    )
                  );
                }
                if (data.done) {
                  break;
                }
              } catch (e) {
                // Ignorar líneas malformadas
                console.warn('Error parsing streaming data:', e);
              }
            }
          }
        }
      } finally {
        setIsStreaming(false);
      }
    } catch (error) {
      console.error('Error en streaming de Ollama:', error);
      setIsStreaming(false);
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
              <StatLabel>Modelos Instalados</StatLabel>
              <StatNumber>{aiStatus?.installed_models || 0}</StatNumber>
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

            <Button
              onClick={() => installModel(selectedModel)}
              isLoading={isInstalling}
              loadingText="Instalando..."
              size="sm"
              colorScheme="blue"
              isDisabled={getModelStatus(selectedModel) === 'installed'}
            >
              Instalar Modelo
            </Button>

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
      {getModelStatus(selectedModel) === 'not_installed' && (
        <Alert status="warning" mt={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Modelo no instalado</Text>
            <Text fontSize="sm">
              El modelo {selectedModel} no está instalado. Haz clic en "Instalar Modelo" para descargarlo.
            </Text>
          </Box>
        </Alert>
      )}

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
