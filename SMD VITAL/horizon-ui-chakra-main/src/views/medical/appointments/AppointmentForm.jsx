import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Switch,
  useColorModeValue,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";

const AppointmentForm = ({ isOpen, onClose, appointment = null, onSuccess }) => {
  const { token } = useAuth();
  const toast = useToast();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicalServices, setMedicalServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    professional_id: "",
    medical_service_id: "",
    appointment_type: "CONSULTATION",
    priority: "NORMAL",
    scheduled_date: "",
    estimated_duration_minutes: 30,
    chief_complaint: "",
    symptoms: "",
    notes: "",
    special_instructions: "",
    is_telemedicine: false,
    telemedicine_link: "",
    insurance_covered: true,
    follow_up_required: false,
    follow_up_date: "",
  });

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Load medical services and users
  useEffect(() => {
    if (isOpen) {
      loadMedicalServices();
      loadUsers();
    }
  }, [isOpen]);

  // Load appointment data if editing
  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        patient_id: appointment.patient_id || "",
        professional_id: appointment.professional_id || "",
        medical_service_id: appointment.medical_service_id || "",
        appointment_type: appointment.appointment_type || "CONSULTATION",
        priority: appointment.priority || "NORMAL",
        scheduled_date: appointment.scheduled_date ? new Date(appointment.scheduled_date).toISOString().slice(0, 16) : "",
        estimated_duration_minutes: appointment.estimated_duration_minutes || 30,
        chief_complaint: appointment.chief_complaint || "",
        symptoms: appointment.symptoms || "",
        notes: appointment.notes || "",
        special_instructions: appointment.special_instructions || "",
        is_telemedicine: appointment.is_telemedicine || false,
        telemedicine_link: appointment.telemedicine_link || "",
        insurance_covered: appointment.insurance_covered !== undefined ? appointment.insurance_covered : true,
        follow_up_required: appointment.follow_up_required || false,
        follow_up_date: appointment.follow_up_date ? new Date(appointment.follow_up_date).toISOString().slice(0, 16) : "",
      });
    } else if (isOpen) {
      // Reset form for new appointment
      setFormData({
        patient_id: "",
        professional_id: "",
        medical_service_id: "",
        appointment_type: "CONSULTATION",
        priority: "NORMAL",
        scheduled_date: "",
        estimated_duration_minutes: 30,
        chief_complaint: "",
        symptoms: "",
        notes: "",
        special_instructions: "",
        is_telemedicine: false,
        telemedicine_link: "",
        insurance_covered: true,
        follow_up_required: false,
        follow_up_date: "",
      });
    }
  }, [appointment, isOpen]);

  const loadMedicalServices = async () => {
    try {
      // TODO: Implement getMedicalServices API endpoint
      // For now, we'll use mock data
      setMedicalServices([
        { id: "1", name: "Consulta General", code: "CONS_GEN", base_price: 50000 },
        { id: "2", name: "Consulta Cardiológica", code: "CONS_CARD", base_price: 80000 },
        { id: "3", name: "Consulta Pediátrica", code: "CONS_PED", base_price: 40000 },
        { id: "4", name: "Consulta de Emergencia", code: "EMERG_CONSULT", base_price: 100000 },
        { id: "5", name: "Telemedicina General", code: "TELE_GEN", base_price: 35000 },
      ]);
    } catch (error) {
      console.error('Error loading medical services:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers(token);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null,
        estimated_cost: medicalServices.find(s => s.id === formData.medical_service_id)?.base_price || 0,
      };

      let response;
      if (appointment) {
        // Update existing appointment
        response = await apiService.updateAppointment(token, appointment.id, submitData);
      } else {
        // Create new appointment
        response = await apiService.createAppointment(token, submitData);
      }

      if (response.success) {
        toast({
          title: appointment ? "Cita actualizada" : "Cita creada",
          description: appointment ? "La cita se ha actualizado correctamente" : "La cita se ha creado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
        onClose();
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError('Error al guardar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          {appointment ? "Editar Cita Médica" : "Nueva Cita Médica"}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Error Alert */}
              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Basic Information */}
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Información Básica
              </Text>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    value={formData.patient_id}
                    onChange={(e) => handleInputChange('patient_id', e.target.value)}
                    placeholder="Seleccionar paciente"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Profesional Asignado</FormLabel>
                  <Select
                    value={formData.professional_id}
                    onChange={(e) => handleInputChange('professional_id', e.target.value)}
                    placeholder="Seleccionar profesional"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Servicio Médico</FormLabel>
                  <Select
                    value={formData.medical_service_id}
                    onChange={(e) => handleInputChange('medical_service_id', e.target.value)}
                    placeholder="Seleccionar servicio"
                  >
                    {medicalServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ${service.base_price?.toLocaleString()}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Tipo de Cita</FormLabel>
                  <Select
                    value={formData.appointment_type}
                    onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                  >
                    <option value="CONSULTATION">Consulta</option>
                    <option value="FOLLOW_UP">Seguimiento</option>
                    <option value="EMERGENCY">Emergencia</option>
                    <option value="PROCEDURE">Procedimiento</option>
                    <option value="PREVENTIVE">Preventivo</option>
                    <option value="SPECIALIST">Especialista</option>
                    <option value="TELEMEDICINE">Telemedicina</option>
                  </Select>
                </FormControl>
              </Grid>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Fecha y Hora</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Prioridad</FormLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="LOW">Baja</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                    <option value="EMERGENCY">Emergencia</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <Input
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) => handleInputChange('estimated_duration_minutes', parseInt(e.target.value))}
                    min="15"
                    max="240"
                  />
                </FormControl>
              </Grid>

              {/* Medical Information */}
              <Text fontSize="lg" fontWeight="bold" color={textColor} mt={4}>
                Información Médica
              </Text>

              <FormControl>
                <FormLabel>Motivo de Consulta</FormLabel>
                <Textarea
                  value={formData.chief_complaint}
                  onChange={(e) => handleInputChange('chief_complaint', e.target.value)}
                  placeholder="Describa el motivo de la consulta..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Síntomas</FormLabel>
                <Textarea
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  placeholder="Describa los síntomas del paciente..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notas Adicionales</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notas adicionales sobre la cita..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Instrucciones Especiales</FormLabel>
                <Textarea
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  placeholder="Instrucciones especiales para el paciente..."
                  rows={2}
                />
              </FormControl>

              {/* Options */}
              <Text fontSize="lg" fontWeight="bold" color={textColor} mt={4}>
                Opciones
              </Text>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl>
                  <FormLabel>Telemedicina</FormLabel>
                  <HStack>
                    <Switch
                      isChecked={formData.is_telemedicine}
                      onChange={(e) => handleInputChange('is_telemedicine', e.target.checked)}
                    />
                    <Text fontSize="sm" color={textColorSecondary}>
                      {formData.is_telemedicine ? "Sí" : "No"}
                    </Text>
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Cobertura de Seguro</FormLabel>
                  <HStack>
                    <Switch
                      isChecked={formData.insurance_covered}
                      onChange={(e) => handleInputChange('insurance_covered', e.target.checked)}
                    />
                    <Text fontSize="sm" color={textColorSecondary}>
                      {formData.insurance_covered ? "Sí" : "No"}
                    </Text>
                  </HStack>
                </FormControl>
              </Grid>

              {formData.is_telemedicine && (
                <FormControl>
                  <FormLabel>Enlace de Telemedicina</FormLabel>
                  <Input
                    value={formData.telemedicine_link}
                    onChange={(e) => handleInputChange('telemedicine_link', e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Seguimiento Requerido</FormLabel>
                <HStack>
                  <Switch
                    isChecked={formData.follow_up_required}
                    onChange={(e) => handleInputChange('follow_up_required', e.target.checked)}
                  />
                  <Text fontSize="sm" color={textColorSecondary}>
                    {formData.follow_up_required ? "Sí" : "No"}
                  </Text>
                </HStack>
              </FormControl>

              {formData.follow_up_required && (
                <FormControl>
                  <FormLabel>Fecha de Seguimiento</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.follow_up_date}
                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                  />
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText={appointment ? "Actualizando..." : "Creando..."}
            >
              {appointment ? "Actualizar Cita" : "Crear Cita"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AppointmentForm;

