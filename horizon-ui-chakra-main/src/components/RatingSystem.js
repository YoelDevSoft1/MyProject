/**
 * SMD VITAL - Rating System
 * Componente para calificar doctores y mostrar calificaciones
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Progress,
  Tooltip,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react';
import { 
  MdStar, 
  MdStarBorder, 
  MdThumbUp, 
  MdThumbDown,
  MdSend,
  MdClose,
  MdRefresh,
  MdTrendingUp,
  MdPeople,
  MdRateReview
} from 'react-icons/md';

const RatingSystem = ({ 
  doctorId, 
  appointmentId,
  onRatingSubmitted,
  showStats = false,
  readOnly = false 
}) => {
  // Estados del tema - TODOS los hooks deben ir al inicio
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');
  const starColor = useColorModeValue('yellow.400', 'yellow.300');
  const hoverColor = useColorModeValue('yellow.300', 'yellow.200');
  const textareaBg = useColorModeValue('white', 'gray.700');

  // Estados del componente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    punctuality: 0,
    communication: 0,
    treatment: 0,
    professionalism: 0
  });
  const [doctorStats, setDoctorStats] = useState(null);
  const [recentRatings, setRecentRatings] = useState([]);

  const toast = useToast();

  // Cargar estadísticas del doctor
  useEffect(() => {
    if (doctorId && showStats) {
      loadDoctorStats();
    }
  }, [doctorId, showStats]);

  const loadDoctorStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ratings/doctor/${doctorId}/aggregate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('smd_vital_token')}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setDoctorStats(stats);
      }
    } catch (error) {
      console.error('Error loading doctor stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentRatings = async () => {
    try {
      const response = await fetch(`/api/ratings/doctor/${doctorId}?limit=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('smd_vital_token')}`
        }
      });

      if (response.ok) {
        const ratings = await response.json();
        setRecentRatings(ratings);
      }
    } catch (error) {
      console.error('Error loading recent ratings:', error);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleCategoryChange = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: 'Calificación requerida',
        description: 'Por favor selecciona una calificación',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smd_vital_token')}`
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          appointment_id: appointmentId,
          rating: rating,
          comment: comment,
          categories: categories
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: 'Calificación enviada',
          description: 'Gracias por tu calificación',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Recargar estadísticas
        if (showStats) {
          loadDoctorStats();
          loadRecentRatings();
        }

        // Notificar al componente padre
        onRatingSubmitted?.(result);

        // Cerrar modal y resetear
        setIsModalOpen(false);
        setRating(0);
        setComment('');
        setCategories({
          punctuality: 0,
          communication: 0,
          treatment: 0,
          professionalism: 0
        });
      } else {
        throw new Error('Error al enviar calificación');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la calificación. Inténtalo de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating, onRatingChange, isInteractive = true) => {
    return (
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={star <= currentRating ? MdStar : MdStarBorder}
            boxSize={6}
            color={star <= currentRating ? starColor : 'gray.300'}
            cursor={isInteractive ? 'pointer' : 'default'}
            _hover={isInteractive ? { color: hoverColor } : {}}
            onClick={isInteractive ? () => onRatingChange(star) : undefined}
            onMouseEnter={isInteractive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={isInteractive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </HStack>
    );
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return '';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'yellow';
    return 'red';
  };

  if (readOnly && !showStats) {
    return null;
  }

  return (
    <Box>
      {/* Botón para abrir modal de calificación */}
      {!readOnly && (
        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<MdRateReview />}
          colorScheme="blue"
          variant="outline"
          size="sm"
        >
          Calificar Doctor
        </Button>
      )}

      {/* Estadísticas del Doctor */}
      {showStats && doctorStats && (
        <Card bg={cardBg} mt={4}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Calificaciones del Doctor
              </Text>
              <Button
                leftIcon={<MdRefresh />}
                onClick={loadDoctorStats}
                size="sm"
                variant="ghost"
                isLoading={isLoading}
              >
                Actualizar
              </Button>
            </HStack>
          </CardHeader>
          
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
              {/* Calificación Promedio */}
              <GridItem>
                <Stat textAlign="center">
                  <StatLabel color={textColorSecondary}>Calificación Promedio</StatLabel>
                  <StatNumber fontSize="3xl" color={textColor}>
                    {doctorStats.average_rating.toFixed(1)}
                  </StatNumber>
                  <HStack justify="center" mt={2}>
                    {renderStars(Math.round(doctorStats.average_rating), () => {}, false)}
                  </HStack>
                  <StatHelpText color={textColorSecondary}>
                    {doctorStats.total_ratings} calificaciones
                  </StatHelpText>
                </Stat>
              </GridItem>

              {/* Confianza */}
              <GridItem>
                <Stat textAlign="center">
                  <StatLabel color={textColorSecondary}>Nivel de Confianza</StatLabel>
                  <StatNumber fontSize="2xl" color={textColor}>
                    {(doctorStats.confidence_score * 100).toFixed(0)}%
                  </StatNumber>
                  <Progress
                    value={doctorStats.confidence_score * 100}
                    colorScheme={getConfidenceColor(doctorStats.confidence_score)}
                    size="sm"
                    mt={2}
                  />
                  <StatHelpText color={textColorSecondary}>
                    Basado en {doctorStats.total_ratings} calificaciones
                  </StatHelpText>
                </Stat>
              </GridItem>

              {/* Distribución */}
              <GridItem>
                <Stat textAlign="center">
                  <StatLabel color={textColorSecondary}>Distribución</StatLabel>
                  <VStack spacing={1} mt={2}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = doctorStats.rating_distribution[star] || 0;
                      const percentage = doctorStats.total_ratings > 0 
                        ? (count / doctorStats.total_ratings) * 100 
                        : 0;
                      
                      return (
                        <HStack key={star} w="full" spacing={2}>
                          <Text fontSize="sm" color={textColor} w={4}>
                            {star}
                          </Text>
                          <Icon as={MdStar} color={starColor} boxSize={3} />
                          <Progress
                            value={percentage}
                            colorScheme="blue"
                            size="sm"
                            flex={1}
                          />
                          <Text fontSize="sm" color={textColorSecondary} w={8}>
                            {count}
                          </Text>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Stat>
              </GridItem>
            </Grid>

            {/* Calificaciones por Categoría */}
            {Object.keys(doctorStats.category_averages).length > 0 && (
              <Box mt={6}>
                <Text fontSize="md" fontWeight="semibold" color={textColor} mb={3}>
                  Calificaciones por Categoría
                </Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  {Object.entries(doctorStats.category_averages).map(([category, average]) => (
                    <Box key={category} p={3} bg={headerBg} borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="semibold" color={textColor} textTransform="capitalize">
                          {category.replace('_', ' ')}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {average.toFixed(1)}
                        </Text>
                      </HStack>
                      <HStack>
                        {renderStars(Math.round(average), () => {}, false)}
                      </HStack>
                    </Box>
                  ))}
                </Grid>
              </Box>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modal de Calificación */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>
            <Text color={textColor}>Calificar Doctor</Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Calificación General */}
              <FormControl>
                <FormLabel color={textColor}>Calificación General *</FormLabel>
                <VStack spacing={2}>
                  {renderStars(hoveredRating || rating, handleRatingChange)}
                  <Text fontSize="sm" color={textColorSecondary}>
                    {getRatingText(hoveredRating || rating)}
                  </Text>
                </VStack>
              </FormControl>

              {/* Calificaciones por Categoría */}
              <FormControl>
                <FormLabel color={textColor}>Calificaciones por Categoría</FormLabel>
                <VStack spacing={4} align="stretch">
                  {[
                    { key: 'punctuality', label: 'Puntualidad' },
                    { key: 'communication', label: 'Comunicación' },
                    { key: 'treatment', label: 'Tratamiento' },
                    { key: 'professionalism', label: 'Profesionalismo' }
                  ].map(({ key, label }) => (
                    <Box key={key}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color={textColor}>
                          {label}
                        </Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {categories[key] > 0 ? getRatingText(categories[key]) : 'No calificado'}
                        </Text>
                      </HStack>
                      {renderStars(categories[key], (value) => handleCategoryChange(key, value))}
                    </Box>
                  ))}
                </VStack>
              </FormControl>

              {/* Comentario */}
              <FormControl>
                <FormLabel color={textColor}>Comentario (Opcional)</FormLabel>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia con este doctor..."
                  bg={textareaBg}
                  borderColor={borderColor}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                leftIcon={<MdClose />}
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitRating}
                colorScheme="blue"
                leftIcon={<MdSend />}
                isLoading={isSubmitting}
                loadingText="Enviando..."
                isDisabled={rating === 0}
              >
                Enviar Calificación
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RatingSystem;
