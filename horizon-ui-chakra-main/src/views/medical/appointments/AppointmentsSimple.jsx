// SMD VITAL - AppointmentsSimple Component
// Versión simplificada de la página de citas para evitar bucles de re-render

import React, { memo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  useColorModeValue,
  Icon,
  Badge
} from '@chakra-ui/react';
import { MdArrowBack, MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import SimpleAppointmentsList from '../../../components/simple/SimpleAppointmentsList';
import ConnectionStatus from '../../../components/system/ConnectionStatus';
import CorsDiagnostic from '../../../components/system/CorsDiagnostic';

/**
 * Página simplificada de citas médicas
 * Diseñada para evitar bucles de re-render y problemas de rendimiento
 */
export const AppointmentsSimple = memo(() => {
  const navigate = useNavigate();
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box 
      pt={{ base: "120px", md: "80px" }}
      px={{ base: 4, md: 6, lg: 8 }}
      pb={8}
      minH="100vh"
      bg={pageBg}
    >
      <VStack spacing={6} align="stretch">
        {/* Estado de conexión */}
        <ConnectionStatus />

        {/* Header */}
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={MdArrowBack} />}
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                size="sm"
              >
                Volver
              </Button>
              <Text fontSize="2xl" fontWeight="bold">
                Citas Médicas
              </Text>
              <Badge colorScheme="blue" variant="subtle">
                Modo Simplificado
              </Badge>
            </HStack>
            
            <Button
              leftIcon={<Icon as={MdRefresh} />}
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
            >
              Recargar Página
            </Button>
          </HStack>

          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="sm">
                Modo Simplificado Activado
              </Text>
              <Text fontSize="xs">
                Esta es una versión simplificada de la página de citas para evitar problemas de rendimiento.
                Las funciones avanzadas están temporalmente deshabilitadas.
              </Text>
            </VStack>
          </Alert>
        </VStack>

        {/* Diagnóstico CORS */}
        <CorsDiagnostic />

        {/* Lista de citas */}
        <SimpleAppointmentsList />

        {/* Información adicional */}
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="sm">
              Funciones Temporalmente Deshabilitadas
            </Text>
            <Text fontSize="xs">
              • Dashboard en tiempo real
              • Filtros avanzados
              • Acciones masivas
              • Auto-actualización
            </Text>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Estas funciones se reactivarán una vez solucionados los problemas de conectividad.
            </Text>
          </VStack>
        </Alert>
      </VStack>
    </Box>
  );
});

AppointmentsSimple.displayName = 'AppointmentsSimple';

export default AppointmentsSimple;
