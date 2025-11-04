// SMD VITAL - AppointmentFilters Component (Optimized)
import React, { memo, useCallback, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  HStack,
  VStack,
  Heading,
  Button,
  Grid,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Icon,
  Collapse,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Tooltip,
  Badge,
  Text,
  Divider
} from '@chakra-ui/react';
import {
  MdClear,
  MdSearch,
  MdSort,
  MdRefresh,
  MdExpandMore,
  MdExpandLess
} from 'react-icons/md';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'No Asistió' },
  { value: 'RESCHEDULED', label: 'Reprogramada' }
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' }
];

const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'emergency', label: 'Emergencia' },
  { value: 'checkup', label: 'Chequeo' },
  { value: 'surgery', label: 'Cirugía' },
  { value: 'therapy', label: 'Terapia' }
];

const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Fecha (Ascendente)', sortBy: 'date', sortOrder: 'asc' },
  { value: 'date_desc', label: 'Fecha (Descendente)', sortBy: 'date', sortOrder: 'desc' },
  { value: 'status_asc', label: 'Estado (A-Z)', sortBy: 'status', sortOrder: 'asc' },
  { value: 'priority_desc', label: 'Prioridad (Alta-Baja)', sortBy: 'priority', sortOrder: 'desc' },
  { value: 'patient_asc', label: 'Paciente (A-Z)', sortBy: 'patient', sortOrder: 'asc' },
  { value: 'doctor_asc', label: 'Doctor (A-Z)', sortBy: 'doctor', sortOrder: 'asc' }
];

export const AppointmentFilters = memo(({
  filters = {},
  activeFilters = [],
  updateFilter,
  clearFilter,
  clearAllFilters,
  onApplyFilters,
  sortBy = 'date',
  sortOrder = 'asc',
  onSortChange,
  loading = false
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Handlers
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleSortChange = useCallback((option) => {
    onSortChange?.(option.sortBy, option.sortOrder);
  }, [onSortChange]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <Card bg={cardBg} borderColor={borderColor} shadow="sm" borderRadius="xl">
      <CardHeader pb={hasActiveFilters ? 3 : undefined}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Heading size="md" color={textColor} fontWeight="600">
              Filtros
            </Heading>
            
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={showFilters ? MdExpandLess : MdExpandMore} />}
              onClick={handleToggleFilters}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
            
            {hasActiveFilters && (
              <>
                <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={1} borderRadius="full">
                  {activeFilters.length} activo{activeFilters.length !== 1 ? 's' : ''}
                </Badge>
                
                <Tooltip label="Limpiar todos los filtros">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Icon as={MdClear} />}
                    onClick={clearAllFilters}
                    colorScheme="red"
                  >
                    Limpiar
                  </Button>
                </Tooltip>
              </>
            )}
          </HStack>

          <HStack spacing={2}>
            <Menu>
              <MenuButton 
                as={Button} 
                size="sm" 
                variant="outline" 
                leftIcon={<Icon as={MdSort} />}
                rightIcon={<Icon as={MdExpandMore} />}
              >
                Ordenar
              </MenuButton>
              <MenuList>
                {SORT_OPTIONS.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option)}
                    bg={sortBy === option.sortBy && sortOrder === option.sortOrder ? 'blue.50' : 'transparent'}
                    fontWeight={sortBy === option.sortBy && sortOrder === option.sortOrder ? '600' : 'normal'}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Tooltip label="Aplicar filtros y recargar">
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Icon as={MdRefresh} />}
                onClick={onApplyFilters}
                isLoading={loading}
              >
                Aplicar
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </CardHeader>

      {/* Active filters as tags */}
      {hasActiveFilters && (
        <CardBody pt={0} pb={showFilters ? 4 : undefined}>
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" fontWeight="600" color={textColor}>
              Filtros Activos:
            </Text>
            <Wrap spacing={2}>
              {activeFilters.map((filter, index) => (
                <WrapItem key={`active-filter-${filter.key}-${filter.value}-${index}`}>
                  <Tag
                    colorScheme="blue"
                    size="md"
                    variant="subtle"
                    borderRadius="full"
                  >
                    <TagLabel fontSize="xs">{filter.label}</TagLabel>
                    <TagCloseButton 
                      onClick={() => clearFilter(filter.key)}
                    />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </CardBody>
      )}

      {/* Collapsible filters panel */}
      <Collapse in={showFilters} animateOpacity>
        <CardBody pt={hasActiveFilters ? 0 : undefined}>
          <VStack align="stretch" spacing={6}>
            {hasActiveFilters && <Divider />}
            
            {/* Filters grid */}
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                md: "repeat(2, 1fr)", 
                lg: "repeat(3, 1fr)" 
              }} 
              gap={4}
            >
              {/* General search */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Búsqueda General
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar por paciente, doctor..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    size="sm"
                  />
                </InputGroup>
              </FormControl>

              {/* Status */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Estado
                </FormLabel>
                <Select
                  placeholder="Todos los estados"
                  value={filters.status || ''}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  size="sm"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Priority */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Prioridad
                </FormLabel>
                <Select
                  placeholder="Todas las prioridades"
                  value={filters.priority || ''}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  size="sm"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Date from */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Fecha Desde
                </FormLabel>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Date to */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Fecha Hasta
                </FormLabel>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Appointment type */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Tipo de Cita
                </FormLabel>
                <Select
                  placeholder="Todos los tipos"
                  value={filters.appointmentType || ''}
                  onChange={(e) => updateFilter('appointmentType', e.target.value)}
                  size="sm"
                >
                  {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Doctor */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Profesional
                </FormLabel>
                <Input
                  placeholder="Buscar doctor..."
                  value={filters.doctor || ''}
                  onChange={(e) => updateFilter('doctor', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Patient */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Paciente
                </FormLabel>
                <Input
                  placeholder="Buscar paciente..."
                  value={filters.patient || ''}
                  onChange={(e) => updateFilter('patient', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Modality */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500">
                  Modalidad
                </FormLabel>
                <Select
                  placeholder="Todas las modalidades"
                  value={filters.isTelemedicine === null ? '' : filters.isTelemedicine.toString()}
                  onChange={(e) => updateFilter('isTelemedicine', 
                    e.target.value === '' ? null : e.target.value === 'true'
                  )}
                  size="sm"
                >
                  <option value="false">Presencial</option>
                  <option value="true">Telemedicina</option>
                </Select>
              </FormControl>
            </Grid>

            <Divider />

            {/* Filter actions */}
            <Flex justify="flex-end" gap={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllFilters}
                leftIcon={<Icon as={MdClear} />}
                isDisabled={!hasActiveFilters}
              >
                Limpiar Todo
              </Button>
              
              <Button
                size="sm"
                colorScheme="blue"
                onClick={onApplyFilters}
                leftIcon={<Icon as={MdRefresh} />}
                isLoading={loading}
                loadingText="Aplicando..."
              >
                Aplicar Filtros
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Collapse>
    </Card>
  );
});

AppointmentFilters.displayName = 'AppointmentFilters';

export default AppointmentFilters;