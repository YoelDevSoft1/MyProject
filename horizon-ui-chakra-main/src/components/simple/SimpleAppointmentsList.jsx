// SMD VITAL - SimpleAppointmentsList Component
// Componente simplificado para evitar bucles de re-render

import React, { useState, useEffect, memo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import apiServiceCors from '../../services/apiServiceCors';

/**
 * Componente simplificado de lista de citas
 * Diseñado para evitar bucles de re-render
 */
export const SimpleAppointmentsList = memo(() => {
  const { token, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');

  // Función simple para cargar citas
  const loadAppointments = async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiServiceCors.getAppointments(token, { limit: 50 });
      
      if (response.success) {
        let appointmentsArray = [];
        if (Array.isArray(response.data?.appointments)) {
          appointmentsArray = response.data.appointments;
        } else if (Array.isArray(response.data)) {
          appointmentsArray = response.data;
        }
        setAppointments(appointmentsArray.slice(0, 20)); // Máximo 20 para evitar lag
      } else {
        setError('No se pudieron cargar las citas');
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Efecto simple - solo carga inicial
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAppointments();
    }
  }, [isAuthenticated, token]); // Solo depende de autenticación

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'green';
      case 'PENDING': return 'yellow';
      case 'CANCELLED': return 'red';
      case 'COMPLETED': return 'blue';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Spinner size="lg" color="blue.500" />
          <Text>Cargando citas...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">Error al cargar las citas</Text>
          <Text fontSize="sm">{error}</Text>
          <Button size="sm" onClick={loadAppointments}>
            Reintentar
          </Button>
        </VStack>
      </Alert>
    );
  }

  if (appointments.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">No hay citas disponibles</Text>
          <Text fontSize="sm">No se encontraron citas médicas en el sistema.</Text>
          <Button size="sm" onClick={loadAppointments}>
            Actualizar
          </Button>
        </VStack>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Citas Médicas ({appointments.length})
          </Text>
          <Button size="sm" onClick={loadAppointments} isLoading={loading}>
            Actualizar
          </Button>
        </HStack>

        <VStack spacing={3} align="stretch">
          {appointments.map((appointment) => (
            <Card key={appointment.id || appointment.uuid} bg={cardBg} size="sm">
              <CardBody>
                <VStack spacing={2} align="start">
                  <HStack justify="space-between" width="100%">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="sm">
                        {appointment.patient_name || 'Paciente no especificado'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        ID: {appointment.id || appointment.uuid || 'N/A'}
                      </Text>
                    </VStack>
                    <Badge colorScheme={getStatusColor(appointment.status)} size="sm">
                      {appointment.status || 'UNKNOWN'}
                    </Badge>
                  </HStack>
                  
                  <HStack spacing={4} fontSize="xs" color="gray.600">
                    <Text>
                      📅 {formatDate(appointment.scheduled_date)}
                    </Text>
                    {appointment.doctor_name && (
                      <Text>
                        👨‍⚕️ {appointment.doctor_name}
                      </Text>
                    )}
                    {appointment.service_type && (
                      <Text>
                        🏥 {appointment.service_type}
                      </Text>
                    )}
                  </HStack>

                  {appointment.notes && (
                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                      📝 {appointment.notes}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
});

SimpleAppointmentsList.displayName = 'SimpleAppointmentsList';

export default SimpleAppointmentsList;
