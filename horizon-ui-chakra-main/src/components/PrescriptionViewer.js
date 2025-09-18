/**
 * SMD VITAL - Prescription Viewer
 * Componente para visualizar y descargar recetas médicas
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { 
  MdDownload, 
  MdVisibility, 
  MdPrint, 
  MdRefresh,
  MdWarning,
  MdCheckCircle,
  MdSchedule
} from 'react-icons/md';

const PrescriptionViewer = ({ 
  patientId, 
  showAll = false,
  limit = 10 
}) => {
  // Estados del tema - TODOS los hooks deben ir al inicio
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');
  const instructionBg = useColorModeValue('gray.50', 'gray.600');
  const noteBg = useColorModeValue('blue.50', 'blue.900');

  // Estados del componente
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const toast = useToast();

  // Cargar recetas
  useEffect(() => {
    if (patientId) {
      loadPrescriptions();
    }
  }, [patientId]);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prescriptions/patient/${patientId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('smd_vital_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      } else {
        throw new Error('Error al cargar recetas');
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las recetas',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleDownloadPrescription = async (prescription) => {
    if (!prescription.pdf_url) {
      toast({
        title: 'PDF no disponible',
        description: 'La receta no tiene PDF generado',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsDownloading(true);
    try {
      // Si es una URL de data, descargar directamente
      if (prescription.pdf_url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = prescription.pdf_url;
        link.download = `receta_${prescription.id.slice(-8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Si es una URL externa, abrir en nueva pestaña
        window.open(prescription.pdf_url, '_blank');
      }

      toast({
        title: 'Descarga iniciada',
        description: 'La receta se está descargando',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar la receta',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <MdCheckCircle />;
      case 'expired':
        return <MdWarning />;
      case 'cancelled':
        return <MdSchedule />;
      default:
        return <MdSchedule />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando recetas...
        </Text>
      </Box>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>No hay recetas</AlertTitle>
          <AlertDescription>
            No se encontraron recetas médicas para este paciente.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex align="center" mb={6}>
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          Recetas Médicas
        </Text>
        <Spacer />
        <Button
          leftIcon={<MdRefresh />}
          onClick={loadPrescriptions}
          size="sm"
          variant="outline"
          isLoading={isLoading}
        >
          Actualizar
        </Button>
      </Flex>

      {/* Lista de Recetas */}
      <VStack spacing={4} align="stretch">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} bg={cardBg} borderColor={borderColor}>
            <CardHeader pb={2}>
              <Flex align="center" justify="space-between">
                <HStack spacing={3}>
                  <Text fontWeight="bold" color={textColor}>
                    Receta #{prescription.id.slice(-8)}
                  </Text>
                  <Badge
                    colorScheme={getStatusColor(prescription.status)}
                    leftIcon={getStatusIcon(prescription.status)}
                  >
                    {prescription.status === 'active' ? 'Activa' : 
                     prescription.status === 'expired' ? 'Expirada' : 'Cancelada'}
                  </Badge>
                </HStack>
                <HStack spacing={2}>
                  <Tooltip label="Ver detalles">
                    <IconButton
                      icon={<MdVisibility />}
                      onClick={() => handleViewPrescription(prescription)}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                    />
                  </Tooltip>
                  <Tooltip label="Descargar PDF">
                    <IconButton
                      icon={<MdDownload />}
                      onClick={() => handleDownloadPrescription(prescription)}
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      isLoading={isDownloading}
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            </CardHeader>

            <CardBody pt={0}>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color={textColorSecondary}>
                    Fecha de emisión
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    {formatDate(prescription.created_at)}
                  </Text>
                </HStack>

                {prescription.expires_at && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={textColorSecondary}>
                      Válida hasta
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      {formatDate(prescription.expires_at)}
                    </Text>
                  </HStack>
                )}

                <Divider />

                <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                  Medicamentos ({prescription.prescription_data?.medications?.length || 0})
                </Text>

                {prescription.prescription_data?.medications?.slice(0, 2).map((med, index) => (
                  <HStack key={index} justify="space-between">
                    <Text fontSize="sm" color={textColor}>
                      {med.name}
                    </Text>
                    <Text fontSize="sm" color={textColorSecondary}>
                      {med.dosage} - {med.frequency}
                    </Text>
                  </HStack>
                ))}

                {prescription.prescription_data?.medications?.length > 2 && (
                  <Text fontSize="sm" color={textColorSecondary}>
                    +{prescription.prescription_data.medications.length - 2} medicamentos más
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* Modal de Detalles de Receta */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="4xl">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>
            <HStack spacing={3}>
              <Text color={textColor}>
                Detalles de Receta #{selectedPrescription?.id?.slice(-8)}
              </Text>
              {selectedPrescription && (
                <Badge
                  colorScheme={getStatusColor(selectedPrescription.status)}
                  leftIcon={getStatusIcon(selectedPrescription.status)}
                >
                  {selectedPrescription.status === 'active' ? 'Activa' : 
                   selectedPrescription.status === 'expired' ? 'Expirada' : 'Cancelada'}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            {selectedPrescription && (
              <VStack spacing={6} align="stretch">
                {/* Información General */}
                <Box p={4} bg={headerBg} borderRadius="md">
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={textColorSecondary}>
                        Fecha de emisión
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        {formatDate(selectedPrescription.created_at)}
                      </Text>
                    </HStack>
                    
                    {selectedPrescription.expires_at && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textColorSecondary}>
                          Válida hasta
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {formatDate(selectedPrescription.expires_at)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                {/* Medicamentos */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                    Medicamentos Recetados
                  </Text>
                  
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color={textColorSecondary}>Medicamento</Th>
                        <Th color={textColorSecondary}>Dosis</Th>
                        <Th color={textColorSecondary}>Frecuencia</Th>
                        <Th color={textColorSecondary}>Duración</Th>
                        <Th color={textColorSecondary}>Cantidad</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedPrescription.prescription_data?.medications?.map((med, index) => (
                        <Tr key={index}>
                          <Td color={textColor}>{med.name}</Td>
                          <Td color={textColor}>{med.dosage}</Td>
                          <Td color={textColor}>{med.frequency}</Td>
                          <Td color={textColor}>{med.duration}</Td>
                          <Td color={textColor}>{med.quantity || 'N/A'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  {/* Instrucciones */}
                  {selectedPrescription.prescription_data?.medications?.some(med => med.instructions) && (
                    <Box mt={4}>
                      <Text fontSize="md" fontWeight="semibold" color={textColor} mb={2}>
                        Instrucciones Especiales
                      </Text>
                      {selectedPrescription.prescription_data.medications
                        .filter(med => med.instructions)
                        .map((med, index) => (
                          <Box key={index} mb={2} p={3} bg={instructionBg} borderRadius="md">
                            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                              {med.name}:
                            </Text>
                            <Text fontSize="sm" color={textColorSecondary}>
                              {med.instructions}
                            </Text>
                          </Box>
                        ))}
                    </Box>
                  )}
                </Box>

                {/* Notas del Doctor */}
                {selectedPrescription.prescription_data?.doctor_notes && (
                  <Box>
                    <Text fontSize="md" fontWeight="semibold" color={textColor} mb={2}>
                      Notas del Doctor
                    </Text>
                    <Box p={3} bg={noteBg} borderRadius="md">
                      <Text fontSize="sm" color={textColor}>
                        {selectedPrescription.prescription_data.doctor_notes}
                      </Text>
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PrescriptionViewer;
