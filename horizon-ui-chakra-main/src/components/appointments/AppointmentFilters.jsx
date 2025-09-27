// SMD VITAL - AppointmentFilters Component
// Componente de filtros inteligentes para citas médicas

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
  MdFilterList,
  MdClear,
  MdSearch,
  MdSort,
  MdSave,
  MdSettings,
  MdRefresh,
  MdExpandMore,
  MdExpandLess
} from 'react-icons/md';

/**
 * Componente de filtros inteligentes para citas médicas
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.filters - Filtros actuales
 * @param {Array} props.activeFilters - Filtros activos con etiquetas
 * @param {Function} props.updateFilter - Función para actualizar filtro
 * @param {Function} props.clearFilter - Función para limpiar filtro específico
 * @param {Function} props.clearAllFilters - Función para limpiar todos los filtros
 * @param {Function} props.onApplyFilters - Función para aplicar filtros
 * @param {string} props.sortBy - Campo de ordenamiento actual
 * @param {string} props.sortOrder - Orden actual (asc/desc)
 * @param {Function} props.onSortChange - Función para cambiar ordenamiento
 * @param {Array} props.savedFilters - Filtros guardados
 * @param {Function} props.onSaveFilter - Función para guardar filtro
 * @param {Function} props.onLoadFilter - Función para cargar filtro guardado
 * @param {boolean} props.loading - Estado de carga
 */
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
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  loading = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Colores del tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Opciones de filtros
  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'CONFIRMED', label: 'Confirmada' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'NO_SHOW', label: 'No Asistió' },
    { value: 'RESCHEDULED', label: 'Reprogramada' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' }
  ];

  const appointmentTypeOptions = [
    { value: 'consultation', label: 'Consulta' },
    { value: 'follow_up', label: 'Seguimiento' },
    { value: 'emergency', label: 'Emergencia' },
    { value: 'checkup', label: 'Chequeo' },
    { value: 'surgery', label: 'Cirugía' },
    { value: 'therapy', label: 'Terapia' }
  ];

  const sortOptions = [
    { value: 'date_asc', label: 'Fecha (Ascendente)', sortBy: 'date', sortOrder: 'asc' },
    { value: 'date_desc', label: 'Fecha (Descendente)', sortBy: 'date', sortOrder: 'desc' },
    { value: 'status_asc', label: 'Estado (A-Z)', sortBy: 'status', sortOrder: 'asc' },
    { value: 'priority_desc', label: 'Prioridad (Alta-Baja)', sortBy: 'priority', sortOrder: 'desc' },
    { value: 'patient_asc', label: 'Paciente (A-Z)', sortBy: 'patient', sortOrder: 'asc' },
    { value: 'doctor_asc', label: 'Doctor (A-Z)', sortBy: 'doctor', sortOrder: 'asc' }
  ];

  // Handlers
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleSortChange = useCallback((option) => {
    onSortChange?.(option.sortBy, option.sortOrder);
  }, [onSortChange]);

  const handleSaveFilter = useCallback(() => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName.trim());
      setFilterName('');
    }
  }, [filterName, onSaveFilter]);

  const handleKeyPress = useCallback((e, handler) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handler();
    }
  }, []);

  return (
    <Card bg={cardBg} borderColor={borderColor}>
      <CardHeader>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Heading size="md" color={textColor}>
              Filtros Inteligentes
            </Heading>
            
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={showFilters ? MdExpandLess : MdExpandMore} />}
              onClick={handleToggleFilters}
              aria-expanded={showFilters}
              aria-controls="filters-panel"
            >
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
            
            {activeFilters.length > 0 && (
              <Badge colorScheme="blue" variant="subtle">
                {activeFilters.length} activo{activeFilters.length !== 1 ? 's' : ''}
              </Badge>
            )}
            
            {activeFilters.length > 0 && (
              <Tooltip label="Limpiar todos los filtros">
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Icon as={MdClear} />}
                  onClick={clearAllFilters}
                  colorScheme="red"
                  aria-label="Limpiar todos los filtros"
                >
                  Limpiar Todo
                </Button>
              </Tooltip>
            )}
          </HStack>

          {/* Controles de ordenamiento y acciones */}
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
                {sortOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option)}
                    bg={sortBy === option.sortBy && sortOrder === option.sortOrder ? 'blue.50' : 'transparent'}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Tooltip label="Aplicar filtros">
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Icon as={MdRefresh} />}
                onClick={onApplyFilters}
                isLoading={loading}
                aria-label="Aplicar filtros"
              >
                Aplicar
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </CardHeader>

      {/* Filtros activos como tags */}
      {activeFilters.length > 0 && (
        <CardBody pt={0}>
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              Filtros Activos:
            </Text>
            <Wrap spacing={2}>
              {activeFilters.map((filter, index) => (
                <WrapItem key={`${filter.key}-${index}`}>
                  <Tag
                    colorScheme="blue"
                    size="md"
                    variant="subtle"
                    borderRadius="full"
                  >
                    <TagLabel>{filter.label}</TagLabel>
                    <TagCloseButton 
                      onClick={() => clearFilter(filter.key)}
                      aria-label={`Eliminar filtro ${filter.label}`}
                    />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </CardBody>
      )}

      {/* Panel de filtros colapsible */}
      <Collapse in={showFilters} animateOpacity>
        <CardBody pt={activeFilters.length > 0 ? 0 : undefined} id="filters-panel">
          <VStack align="stretch" spacing={6}>
            <Divider />
            
            {/* Grid de filtros */}
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                md: "repeat(2, 1fr)", 
                lg: "repeat(3, 1fr)" 
              }} 
              gap={4}
            >
              {/* Búsqueda general */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Búsqueda General
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={MdSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar por paciente, doctor, número..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    size="sm"
                  />
                </InputGroup>
              </FormControl>

              {/* Estado */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Estado de la Cita
                </FormLabel>
                <Select
                  placeholder="Todos los estados"
                  value={filters.status || ''}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  size="sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Prioridad */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Prioridad
                </FormLabel>
                <Select
                  placeholder="Todas las prioridades"
                  value={filters.priority || ''}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  size="sm"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Fecha desde */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Fecha Desde
                </FormLabel>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Fecha hasta */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Fecha Hasta
                </FormLabel>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Tipo de cita */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Tipo de Cita
                </FormLabel>
                <Select
                  placeholder="Todos los tipos"
                  value={filters.appointmentType || ''}
                  onChange={(e) => updateFilter('appointmentType', e.target.value)}
                  size="sm"
                >
                  {appointmentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Doctor */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Profesional
                </FormLabel>
                <Input
                  placeholder="Buscar por doctor..."
                  value={filters.doctor || ''}
                  onChange={(e) => updateFilter('doctor', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Paciente */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Paciente
                </FormLabel>
                <Input
                  placeholder="Buscar por paciente..."
                  value={filters.patient || ''}
                  onChange={(e) => updateFilter('patient', e.target.value)}
                  size="sm"
                />
              </FormControl>

              {/* Modalidad */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
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

            {/* Acciones de filtros */}
            <Flex 
              justify="space-between" 
              align="center" 
              wrap="wrap" 
              gap={4}
            >
              <HStack spacing={3}>
                <HStack spacing={2}>
                  <Input
                    placeholder="Nombre del filtro..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleSaveFilter)}
                    size="sm"
                    maxW="200px"
                  />
                  <Tooltip label="Guardar configuración actual como filtro">
                    <Button
                      size="sm"
                      leftIcon={<Icon as={MdSave} />}
                      onClick={handleSaveFilter}
                      isDisabled={!filterName.trim()}
                    >
                      Guardar
                    </Button>
                  </Tooltip>
                </HStack>

                {savedFilters.length > 0 && (
                  <Menu>
                    <MenuButton 
                      as={Button} 
                      size="sm" 
                      variant="outline" 
                      leftIcon={<Icon as={MdSettings} />}
                      rightIcon={<Icon as={MdExpandMore} />}
                    >
                      Filtros Guardados
                    </MenuButton>
                    <MenuList maxH="200px" overflowY="auto">
                      {savedFilters.map((filter) => (
                        <MenuItem
                          key={filter.id}
                          onClick={() => onLoadFilter(filter)}
                        >
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {filter.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(filter.createdAt).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
              </HStack>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllFilters}
                  leftIcon={<Icon as={MdClear} />}
                  isDisabled={activeFilters.length === 0}
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
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Collapse>
    </Card>
  );
});

AppointmentFilters.displayName = 'AppointmentFilters';

export default AppointmentFilters;
