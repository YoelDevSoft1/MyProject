/**
 * SMD VITAL - Medical Consultation Modal
 * Modal para realizar consultas médicas y crear registros
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Textarea,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  Divider,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { MdAdd, MdRemove, MdSave, MdClose } from 'react-icons/md';

const MedicalConsultationModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onSuccess 
}) => {
  // Estados del tema - TODOS los hooks deben ir al inicio
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
  const buttonBg = useColorModeValue('blue.500', 'blue.600');
  const buttonHover = useColorModeValue('blue.600', 'blue.700');
  const successColor = useColorModeValue('green.500', 'green.400');
  const errorColor = useColorModeValue('red.500', 'red.400');
  const patientInfoBg = useColorModeValue('gray.50', 'gray.700');
  const medicationBg = useColorModeValue('gray.50', 'gray.600');
  const followUpBg = useColorModeValue('blue.50', 'blue.900');

  // Estados del formulario
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    historyPresentIllness: '',
    physicalExamination: {
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: ''
      },
      generalAppearance: '',
      systemsReview: ''
    },
    assessment: '',
    plan: '',
    prescriptions: [],
    followUp: {
      recommended: false,
      timeline: '',
      reason: ''
    }
  });

  const toast = useToast();

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        chiefComplaint: '',
        historyPresentIllness: '',
        physicalExamination: {
          vitalSigns: {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            respiratoryRate: ''
          },
          generalAppearance: '',
          systemsReview: ''
        },
        assessment: '',
        plan: '',
        prescriptions: [],
        followUp: {
          recommended: false,
          timeline: '',
          reason: ''
        }
      });
      setErrors({});
    }
  }, [isOpen]);

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 1) {
        newData[field] = value;
      } else if (fieldParts.length === 2) {
        newData[fieldParts[0]] = {
          ...newData[fieldParts[0]],
          [fieldParts[1]]: value
        };
      } else if (fieldParts.length === 3) {
        newData[fieldParts[0]][fieldParts[1]] = {
          ...newData[fieldParts[0]][fieldParts[1]],
          [fieldParts[2]]: value
        };
      }
      
      return newData;
    });

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Agregar medicamento
  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          quantity: 1
        }
      ]
    }));
  };

  // Remover medicamento
  const removePrescription = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  // Actualizar medicamento
  const updatePrescription = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.chiefComplaint.trim()) {
      newErrors.chiefComplaint = 'El motivo de consulta es requerido';
    }

    if (!formData.historyPresentIllness.trim()) {
      newErrors.historyPresentIllness = 'La historia de la enfermedad es requerida';
    }

    if (!formData.assessment.trim()) {
      newErrors.assessment = 'La evaluación es requerida';
    }

    if (!formData.plan.trim()) {
      newErrors.plan = 'El plan de tratamiento es requerido';
    }

    // Validar medicamentos si existen
    formData.prescriptions.forEach((med, index) => {
      if (med.name && (!med.dosage || !med.frequency)) {
        newErrors[`prescription_${index}`] = 'Dosis y frecuencia son requeridas';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar consulta
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor corrige los errores en el formulario',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para envío
      const consultationData = {
        chief_complaint: formData.chiefComplaint,
        history_present_illness: formData.historyPresentIllness,
        physical_examination: formData.physicalExamination,
        assessment: formData.assessment,
        plan: formData.plan,
        prescriptions: formData.prescriptions.filter(med => med.name.trim()),
        follow_up: formData.followUp
      };

      // Simular llamada a la API
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smd_vital_token')}`
        },
        body: JSON.stringify({
          appointment_id: appointment?.id,
          consultation_data: consultationData
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: 'Consulta registrada',
          description: 'La consulta médica se ha registrado exitosamente',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        onSuccess?.(result);
        onClose();
      } else {
        throw new Error('Error al registrar la consulta');
      }

    } catch (error) {
      console.error('Error submitting consultation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar la consulta. Inténtalo de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} maxH="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={3}>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Consulta Médica
            </Text>
            {appointment && (
              <Badge colorScheme="blue" variant="subtle">
                Cita #{appointment.id?.slice(-8)}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Información del Paciente */}
            {appointment && (
              <Box p={4} bg={patientInfoBg} borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" color={textColorSecondary} mb={2}>
                  Paciente
                </Text>
                <Text color={textColor}>
                  {appointment.patient_name || 'Nombre del paciente'}
                </Text>
              </Box>
            )}

            {/* Motivo de Consulta */}
            <FormControl isInvalid={errors.chiefComplaint}>
              <FormLabel color={textColor}>Motivo de Consulta *</FormLabel>
              <Textarea
                value={formData.chiefComplaint}
                onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                placeholder="Describa el motivo principal de la consulta..."
                bg={inputBg}
                borderColor={inputBorder}
                _focus={{ borderColor: buttonBg }}
                rows={3}
              />
              <FormErrorMessage>{errors.chiefComplaint}</FormErrorMessage>
            </FormControl>

            {/* Historia de la Enfermedad Actual */}
            <FormControl isInvalid={errors.historyPresentIllness}>
              <FormLabel color={textColor}>Historia de la Enfermedad Actual *</FormLabel>
              <Textarea
                value={formData.historyPresentIllness}
                onChange={(e) => handleInputChange('historyPresentIllness', e.target.value)}
                placeholder="Describa la evolución de la enfermedad actual..."
                bg={inputBg}
                borderColor={inputBorder}
                _focus={{ borderColor: buttonBg }}
                rows={4}
              />
              <FormErrorMessage>{errors.historyPresentIllness}</FormErrorMessage>
            </FormControl>

            {/* Examen Físico */}
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" color={textColor}>
                      Examen Físico
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    {/* Signos Vitales */}
                    <Box>
                      <Text fontWeight="semibold" color={textColor} mb={3}>
                        Signos Vitales
                      </Text>
                      <HStack spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="sm" color={textColorSecondary}>
                            Presión Arterial
                          </FormLabel>
                          <Input
                            value={formData.physicalExamination.vitalSigns.bloodPressure}
                            onChange={(e) => handleInputChange('physicalExamination.vitalSigns.bloodPressure', e.target.value)}
                            placeholder="120/80"
                            bg={inputBg}
                            borderColor={inputBorder}
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm" color={textColorSecondary}>
                            Frecuencia Cardíaca
                          </FormLabel>
                          <Input
                            value={formData.physicalExamination.vitalSigns.heartRate}
                            onChange={(e) => handleInputChange('physicalExamination.vitalSigns.heartRate', e.target.value)}
                            placeholder="72"
                            bg={inputBg}
                            borderColor={inputBorder}
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm" color={textColorSecondary}>
                            Temperatura
                          </FormLabel>
                          <Input
                            value={formData.physicalExamination.vitalSigns.temperature}
                            onChange={(e) => handleInputChange('physicalExamination.vitalSigns.temperature', e.target.value)}
                            placeholder="36.5°C"
                            bg={inputBg}
                            borderColor={inputBorder}
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm" color={textColorSecondary}>
                            Frecuencia Respiratoria
                          </FormLabel>
                          <Input
                            value={formData.physicalExamination.vitalSigns.respiratoryRate}
                            onChange={(e) => handleInputChange('physicalExamination.vitalSigns.respiratoryRate', e.target.value)}
                            placeholder="16"
                            bg={inputBg}
                            borderColor={inputBorder}
                            size="sm"
                          />
                        </FormControl>
                      </HStack>
                    </Box>

                    {/* Apariencia General */}
                    <FormControl>
                      <FormLabel fontSize="sm" color={textColorSecondary}>
                        Apariencia General
                      </FormLabel>
                      <Textarea
                        value={formData.physicalExamination.generalAppearance}
                        onChange={(e) => handleInputChange('physicalExamination.generalAppearance', e.target.value)}
                        placeholder="Describa la apariencia general del paciente..."
                        bg={inputBg}
                        borderColor={inputBorder}
                        size="sm"
                        rows={2}
                      />
                    </FormControl>

                    {/* Revisión por Sistemas */}
                    <FormControl>
                      <FormLabel fontSize="sm" color={textColorSecondary}>
                        Revisión por Sistemas
                      </FormLabel>
                      <Textarea
                        value={formData.physicalExamination.systemsReview}
                        onChange={(e) => handleInputChange('physicalExamination.systemsReview', e.target.value)}
                        placeholder="Describa la revisión por sistemas..."
                        bg={inputBg}
                        borderColor={inputBorder}
                        size="sm"
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {/* Evaluación */}
            <FormControl isInvalid={errors.assessment}>
              <FormLabel color={textColor}>Evaluación/Diagnóstico *</FormLabel>
              <Textarea
                value={formData.assessment}
                onChange={(e) => handleInputChange('assessment', e.target.value)}
                placeholder="Describa su evaluación y diagnóstico..."
                bg={inputBg}
                borderColor={inputBorder}
                _focus={{ borderColor: buttonBg }}
                rows={3}
              />
              <FormErrorMessage>{errors.assessment}</FormErrorMessage>
            </FormControl>

            {/* Plan de Tratamiento */}
            <FormControl isInvalid={errors.plan}>
              <FormLabel color={textColor}>Plan de Tratamiento *</FormLabel>
              <Textarea
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                placeholder="Describa el plan de tratamiento..."
                bg={inputBg}
                borderColor={inputBorder}
                _focus={{ borderColor: buttonBg }}
                rows={3}
              />
              <FormErrorMessage>{errors.plan}</FormErrorMessage>
            </FormControl>

            {/* Medicamentos */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontWeight="bold" color={textColor}>
                  Medicamentos Recetados
                </Text>
                <Button
                  leftIcon={<MdAdd />}
                  onClick={addPrescription}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                >
                  Agregar Medicamento
                </Button>
              </HStack>

              {formData.prescriptions.map((med, index) => (
                <Box
                  key={index}
                  p={4}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  mb={3}
                >
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" color={textColor}>
                      Medicamento {index + 1}
                    </Text>
                    <IconButton
                      icon={<MdRemove />}
                      onClick={() => removePrescription(index)}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                    />
                  </HStack>

                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3}>
                      <FormControl flex={2}>
                        <FormLabel fontSize="sm" color={textColorSecondary}>
                          Nombre del Medicamento
                        </FormLabel>
                        <Input
                          value={med.name}
                          onChange={(e) => updatePrescription(index, 'name', e.target.value)}
                          placeholder="Ej: Ibuprofeno"
                          bg={inputBg}
                          borderColor={inputBorder}
                          size="sm"
                        />
                      </FormControl>
                      <FormControl flex={1}>
                        <FormLabel fontSize="sm" color={textColorSecondary}>
                          Dosis
                        </FormLabel>
                        <Input
                          value={med.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                          placeholder="400mg"
                          bg={inputBg}
                          borderColor={inputBorder}
                          size="sm"
                        />
                      </FormControl>
                    </HStack>

                    <HStack spacing={3}>
                      <FormControl flex={1}>
                        <FormLabel fontSize="sm" color={textColorSecondary}>
                          Frecuencia
                        </FormLabel>
                        <Input
                          value={med.frequency}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                          placeholder="Cada 8 horas"
                          bg={inputBg}
                          borderColor={inputBorder}
                          size="sm"
                        />
                      </FormControl>
                      <FormControl flex={1}>
                        <FormLabel fontSize="sm" color={textColorSecondary}>
                          Duración
                        </FormLabel>
                        <Input
                          value={med.duration}
                          onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                          placeholder="5 días"
                          bg={inputBg}
                          borderColor={inputBorder}
                          size="sm"
                        />
                      </FormControl>
                      <FormControl flex={1}>
                        <FormLabel fontSize="sm" color={textColorSecondary}>
                          Cantidad
                        </FormLabel>
                        <NumberInput
                          value={med.quantity}
                          onChange={(value) => updatePrescription(index, 'quantity', parseInt(value) || 1)}
                          min={1}
                          size="sm"
                        >
                          <NumberInputField bg={inputBg} borderColor={inputBorder} />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel fontSize="sm" color={textColorSecondary}>
                        Instrucciones Especiales
                      </FormLabel>
                      <Textarea
                        value={med.instructions}
                        onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                        placeholder="Con alimentos, antes de dormir, etc."
                        bg={inputBg}
                        borderColor={inputBorder}
                        size="sm"
                        rows={2}
                      />
                    </FormControl>
                  </VStack>
                </Box>
              ))}
            </Box>

            {/* Seguimiento */}
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" color={textColor}>
                      Seguimiento Recomendado
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm" color={textColorSecondary}>
                        ¿Recomienda seguimiento?
                      </FormLabel>
                      <Select
                        value={formData.followUp.recommended ? 'yes' : 'no'}
                        onChange={(e) => handleInputChange('followUp.recommended', e.target.value === 'yes')}
                        bg={inputBg}
                        borderColor={inputBorder}
                        size="sm"
                      >
                        <option value="no">No</option>
                        <option value="yes">Sí</option>
                      </Select>
                    </FormControl>

                    {formData.followUp.recommended && (
                      <>
                        <FormControl>
                          <FormLabel fontSize="sm" color={textColorSecondary}>
                            Tiempo de Seguimiento
                          </FormLabel>
                          <Input
                            value={formData.followUp.timeline}
                            onChange={(e) => handleInputChange('followUp.timeline', e.target.value)}
                            placeholder="1 semana, 1 mes, etc."
                            bg={inputBg}
                            borderColor={inputBorder}
                            size="sm"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color={textColorSecondary}>
                            Razón del Seguimiento
                          </FormLabel>
                          <Textarea
                            value={formData.followUp.reason}
                            onChange={(e) => handleInputChange('followUp.reason', e.target.value)}
                            placeholder="Describa por qué recomienda el seguimiento..."
                            bg={inputBg}
                            borderColor={inputBorder}
                            size="sm"
                            rows={2}
                          />
                        </FormControl>
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              onClick={onClose}
              variant="outline"
              leftIcon={<MdClose />}
              isDisabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              colorScheme="blue"
              leftIcon={<MdSave />}
              isLoading={isLoading}
              loadingText="Guardando..."
            >
              Finalizar Consulta
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MedicalConsultationModal;
