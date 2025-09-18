// SMD VITAL - User Detection Info Component
// Componente para mostrar información de detección de usuario

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Progress,
  Tooltip,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  MdPerson,
  MdLocalHospital,
  MdHealing,
  MdAdminPanelSettings,
  MdEvent,
  MdBuild,
  MdLocalPharmacy,
  MdInfo,
  MdWarning,
  MdCheckCircle
} from 'react-icons/md';

const UserDetectionInfo = ({ userDetection, compact = false }) => {
  // TODOS los hooks deben ir al inicio - colores del tema
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!userDetection) return null;

  const detectedType = userDetection.detection?.detected_type || 'unknown';
  const confidence = userDetection.detection?.confidence || 0;
  const reasons = userDetection.detection?.reasons || [];
  const specialty = userDetection.specialty || '';

  // Iconos por tipo de usuario
  const userIcons = {
    doctor: MdLocalHospital,
    nurse: MdHealing,
    admin: MdAdminPanelSettings,
    receptionist: MdEvent,
    technician: MdBuild,
    pharmacist: MdLocalPharmacy,
    patient: MdPerson,
    unknown: MdPerson
  };

  // Colores por confianza
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'green';
    if (conf >= 0.5) return 'yellow';
    return 'red';
  };

  // Texto de confianza
  const getConfidenceText = (conf) => {
    if (conf >= 0.8) return 'Alta confianza';
    if (conf >= 0.5) return 'Confianza media';
    return 'Baja confianza';
  };

  // Nombre del tipo de usuario
  const getTypeName = (type) => {
    const names = {
      doctor: 'Doctor',
      nurse: 'Enfermero/a',
      admin: 'Administrador',
      receptionist: 'Recepcionista',
      technician: 'Técnico',
      pharmacist: 'Farmacéutico',
      patient: 'Paciente',
      unknown: 'Usuario'
    };
    return names[type] || 'Usuario';
  };

  const UserIcon = userIcons[detectedType];

  if (compact) {
    return (
      <HStack spacing={2}>
        <Icon as={UserIcon} color={`${getConfidenceColor(confidence)}.500`} />
        <Text fontSize="sm" color={textColor}>
          {getTypeName(detectedType)}
        </Text>
        <Badge 
          colorScheme={getConfidenceColor(confidence)} 
          variant="subtle" 
          fontSize="xs"
        >
          {Math.round(confidence * 100)}%
        </Badge>
        {specialty && (
          <Badge colorScheme="blue" variant="outline" fontSize="xs">
            {specialty}
          </Badge>
        )}
      </HStack>
    );
  }

  return (
    <Card bg={cardBg} borderColor={borderColor} size="sm">
      <CardHeader pb={2}>
        <HStack justify="space-between" align="flex-start">
          <HStack spacing={2}>
            <Icon as={UserIcon} color={`${getConfidenceColor(confidence)}.500`} />
            <VStack align="flex-start" spacing={0}>
              <Heading size="sm" color={textColor}>
                {getTypeName(detectedType)}
              </Heading>
              {specialty && (
                <Text fontSize="xs" color="gray.500">
                  {specialty}
                </Text>
              )}
            </VStack>
          </HStack>
          
          <VStack align="flex-end" spacing={1}>
            <Badge 
              colorScheme={getConfidenceColor(confidence)} 
              variant="subtle" 
              fontSize="xs"
            >
              {getConfidenceText(confidence)}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              {Math.round(confidence * 100)}%
            </Text>
          </VStack>
        </HStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack align="stretch" spacing={3}>
          {/* Barra de progreso de confianza */}
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.600">
                Confianza de detección
              </Text>
              <Text fontSize="xs" color="gray.600">
                {Math.round(confidence * 100)}%
              </Text>
            </HStack>
            <Progress 
              value={confidence * 100} 
              size="sm" 
              colorScheme={getConfidenceColor(confidence)}
            />
          </Box>

          {/* Razones de detección */}
          {reasons.length > 0 && (
            <Box>
              <Text fontSize="xs" color="gray.600" mb={2}>
                Razones de detección:
              </Text>
              <Wrap>
                {reasons.slice(0, 3).map((reason, index) => (
                  <WrapItem key={index}>
                    <Badge variant="outline" fontSize="xs">
                      {reason}
                    </Badge>
                  </WrapItem>
                ))}
                {reasons.length > 3 && (
                  <WrapItem>
                    <Badge variant="outline" fontSize="xs">
                      +{reasons.length - 3} más
                    </Badge>
                  </WrapItem>
                )}
              </Wrap>
            </Box>
          )}

          {/* Advertencia si la confianza es baja */}
          {confidence < 0.7 && (
            <Alert status="warning" size="sm" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="xs">Detección con baja confianza</AlertTitle>
                <AlertDescription fontSize="xs">
                  El sistema detectó tu tipo de usuario con {getConfidenceText(confidence).toLowerCase()}. 
                  Puedes cambiar la interfaz manualmente si es necesario.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Información adicional */}
          <HStack justify="space-between" fontSize="xs" color="gray.500">
            <Text>Categoría: {userDetection.detection?.category || 'unknown'}</Text>
            <Text>Interfaz: {userDetection.detection?.suggested_interface || 'default'}</Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default UserDetectionInfo;
