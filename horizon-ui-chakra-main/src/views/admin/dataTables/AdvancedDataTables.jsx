/**
 * SMD VITAL - Sistema de Tablas de Datos Avanzadas
 * ================================================
 * 
 * Módulo completo de reportes ejecutivos, analytics en tiempo real,
 * exportación de datos y dashboards personalizables para el sistema médico.
 * 
 * Features:
 * - Reportes ejecutivos con gráficos interactivos
 * - Exportación a Excel/PDF con templates personalizados
 * - Filtros avanzados y búsqueda inteligente
 * - Analytics en tiempo real con métricas KPI
 * - Dashboards personalizables por rol
 * - Integración con IA para insights automáticos
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Tooltip,
  useToast,
  VStack,
  HStack,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Stack,
  useColorModeValue,
  SimpleGrid,
  Heading,
  Container
} from '@chakra-ui/react';

// Icons
import {
  MdSearch,
  MdFilterList,
  MdDownload,
  MdRefresh,
  MdBarChart,
  MdPieChart,
  MdShowChart,
  MdTableChart,
  MdSettings,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdAdd,
  MdFileDownload,
  MdPictureAsPdf,
  MdEmail,
  MdShare,
  MdMoreVert,
  MdTrendingUp,
  MdTrendingDown,
  MdWarning,
  MdInfo,
  MdCheckCircle,
  MdCancel,
  MdSchedule,
  MdPeople,
  MdAttachMoney,
  MdLocalHospital,
  MdCalendarToday,
  MdNotifications,
  MdSecurity,
  MdAnalytics,
  MdDashboard,
  MdViewModule,
  MdTimeline,
  MdCompare,
  MdInsights
} from 'react-icons/md';

// Charts
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';

// Services
import apiService from '../../../services/apiService';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';

// Utils
import { formatCurrency, formatDate, formatNumber } from '../../../utils/formatters';

const AdvancedDataTables = () => {
  // =====================================================
  // STATE MANAGEMENT
  // =====================================================
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [dashboardConfig, setDashboardConfig] = useState({});
  const [exportProgress, setExportProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  
  // Modals
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const { isOpen: isDashboardOpen, onOpen: onDashboardOpen, onClose: onDashboardClose } = useDisclosure();
  const { isOpen: isAIOpen, onOpen: onAIOpen, onClose: onAIClose } = useDisclosure();
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // =====================================================
  // DATA FETCHING & PROCESSING
  // =====================================================

  useEffect(() => {
    loadData();
    loadAnalytics();
    loadDashboardConfig();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, searchTerm, filters, sortField, sortDirection]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/data-tables/medical-data');
      // Extraer datos de la respuesta del API
      const tableData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setData(tableData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await apiService.get('/analytics/medical-kpis');
      // Extraer datos de la respuesta del API - Puede ser objeto o array
      const analyticsData = response.data?.data || response.data || {};
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadDashboardConfig = async () => {
    try {
      const response = await apiService.get('/dashboard/config');
      // Extraer datos de la respuesta del API - Es un objeto de configuración
      const configData = response.data?.data || response.data || {};
      setDashboardConfig(configData);
    } catch (error) {
      console.error('Error loading dashboard config:', error);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      }
    });

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    setFilteredData(filtered);
  }, [data, searchTerm, filters, sortField, sortDirection]);

  // =====================================================
  // EXPORT FUNCTIONS
  // =====================================================

  const exportToExcel = async () => {
    setExportProgress(0);
    try {
      const response = await apiService.post('/export/excel', {
        data: selectedRows.length > 0 ? selectedRows : filteredData,
        template: 'medical-report',
        includeCharts: true
      });

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Download file
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SMD_VITAL_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Éxito',
        description: 'Reporte exportado a Excel exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Error',
        description: 'Error al exportar a Excel',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const exportToPDF = async () => {
    setExportProgress(0);
    try {
      const response = await apiService.post('/export/pdf', {
        data: selectedRows.length > 0 ? selectedRows : filteredData,
        template: 'medical-report',
        includeCharts: true,
        includeAnalytics: true
      });

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Download file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SMD_VITAL_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Éxito',
        description: 'Reporte exportado a PDF exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: 'Error',
        description: 'Error al exportar a PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // AI INSIGHTS
  // =====================================================

  const generateAIInsights = async () => {
    try {
      const response = await apiService.post('/ai/insights', {
        data: filteredData,
        type: 'medical_analytics',
        includeRecommendations: true
      });
      // Extraer datos de la respuesta del API
      const insights = response.data?.data?.insights || response.data?.insights || [];
      setAiInsights(insights);
      onAIOpen();
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: 'Error',
        description: 'Error al generar insights de IA',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // CHART DATA PREPARATION
  // =====================================================

  const chartData = useMemo(() => {
    const monthlyData = {};
    filteredData.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          appointments: 0,
          revenue: 0,
          patients: 0,
          consultations: 0
        };
      }
      monthlyData[month].appointments += 1;
      monthlyData[month].revenue += item.amount || 0;
      monthlyData[month].patients += 1;
      monthlyData[month].consultations += 1;
    });
    return Object.values(monthlyData);
  }, [filteredData]);

  const pieChartData = useMemo(() => {
    const specialtyData = {};
    filteredData.forEach(item => {
      const specialty = item.specialty || 'General';
      specialtyData[specialty] = (specialtyData[specialty] || 0) + 1;
    });
    return Object.entries(specialtyData).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // =====================================================
  // RENDER FUNCTIONS
  // =====================================================

  const renderKPICards = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>Total Citas</StatLabel>
            <StatNumber>{analytics.totalAppointments || 0}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {analytics.appointmentGrowth || 0}% vs mes anterior
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
      
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>Ingresos Totales</StatLabel>
            <StatNumber>{formatCurrency(analytics.totalRevenue || 0)}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {analytics.revenueGrowth || 0}% vs mes anterior
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
      
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>Pacientes Activos</StatLabel>
            <StatNumber>{analytics.activePatients || 0}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {analytics.patientGrowth || 0}% vs mes anterior
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
      
      <Card>
        <CardBody>
          <Stat>
            <StatLabel>Tasa de Satisfacción</StatLabel>
            <StatNumber>{(analytics.satisfactionRate || 0).toFixed(1)}%</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {analytics.satisfactionGrowth || 0}% vs mes anterior
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );

  const renderCharts = () => (
    <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
      <Card>
        <CardHeader>
          <Heading size="md">Tendencias Mensuales</Heading>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="appointments" fill="#3182CE" name="Citas" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#38A169" name="Ingresos" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <Heading size="md">Distribución por Especialidad</Heading>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 137.5}, 70%, 50%)`} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </Grid>
  );

  const renderDataTable = () => (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Heading size="md">Datos Médicos</Heading>
          <HStack>
            <Button
              leftIcon={<MdAnalytics />}
              colorScheme="purple"
              variant="outline"
              onClick={generateAIInsights}
            >
              IA Insights
            </Button>
            <Button
              leftIcon={<MdDownload />}
              colorScheme="blue"
              onClick={onExportOpen}
            >
              Exportar
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  isChecked={selectedRows.length === filteredData.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(filteredData);
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </Th>
              <Th cursor="pointer" onClick={() => setSortField('date')}>
                Fecha
                {sortField === 'date' && (
                  <Text as="span" ml={2}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </Text>
                )}
              </Th>
              <Th>Paciente</Th>
              <Th>Profesional</Th>
              <Th>Especialidad</Th>
              <Th>Estado</Th>
              <Th>Monto</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Checkbox
                      isChecked={selectedRows.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, item]);
                        } else {
                          setSelectedRows(selectedRows.filter(row => row !== item));
                        }
                      }}
                    />
                  </Td>
                  <Td>{formatDate(item.date)}</Td>
                  <Td>{item.patient_name}</Td>
                  <Td>{item.professional_name}</Td>
                  <Td>{item.specialty}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        item.status === 'completed' ? 'green' :
                        item.status === 'pending' ? 'yellow' :
                        item.status === 'cancelled' ? 'red' : 'blue'
                      }
                    >
                      {item.status}
                    </Badge>
                  </Td>
                  <Td>{formatCurrency(item.amount)}</Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<MdMoreVert />} variant="ghost" />
                      <MenuList>
                        <MenuItem icon={<MdVisibility />}>Ver</MenuItem>
                        <MenuItem icon={<MdEdit />}>Editar</MenuItem>
                        <MenuItem icon={<MdDelete />}>Eliminar</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
        
        <Flex justify="space-between" align="center" mt={4}>
          <Text fontSize="sm" color="gray.500">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} registros
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              isDisabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Text fontSize="sm">
              Página {currentPage} de {Math.ceil(filteredData.length / itemsPerPage)}
            </Text>
            <Button
              size="sm"
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredData.length / itemsPerPage), currentPage + 1))}
              isDisabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
            >
              Siguiente
            </Button>
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="blue.600">
              Tablas de Datos SMD VITAL
            </Heading>
            <Text color="gray.600">
              Sistema avanzado de reportes y analytics médicos
            </Text>
          </VStack>
          <HStack>
            <Button
              leftIcon={<MdRefresh />}
              onClick={loadData}
              isLoading={loading}
            >
              Actualizar
            </Button>
            <Button
              leftIcon={<MdSettings />}
              onClick={onDashboardOpen}
            >
              Configurar Dashboard
            </Button>
          </HStack>
        </Flex>

        {/* Search and Filters */}
        <Card>
          <CardBody>
            <Flex gap={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <MdSearch />
                </InputLeftElement>
                <Input
                  placeholder="Buscar en todos los campos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Button
                leftIcon={<MdFilterList />}
                onClick={onFilterOpen}
                variant="outline"
              >
                Filtros Avanzados
              </Button>
              
              <Select
                placeholder="Elementos por página"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                maxW="200px"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </Select>
            </Flex>
          </CardBody>
        </Card>

        {/* KPI Cards */}
        {renderKPICards()}

        {/* Charts */}
        {renderCharts()}

        {/* Data Table */}
        {renderDataTable()}
      </VStack>

      {/* Export Modal */}
      <Modal isOpen={isExportOpen} onClose={onExportClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exportar Datos</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text>Seleccione el formato de exportación:</Text>
              <HStack spacing={4}>
                <Button
                  leftIcon={<MdFileDownload />}
                  colorScheme="green"
                  onClick={exportToExcel}
                  isLoading={exportProgress > 0 && exportProgress < 100}
                >
                  Excel
                </Button>
                <Button
                  leftIcon={<MdPictureAsPdf />}
                  colorScheme="red"
                  onClick={exportToPDF}
                  isLoading={exportProgress > 0 && exportProgress < 100}
                >
                  PDF
                </Button>
              </HStack>
              {exportProgress > 0 && exportProgress < 100 && (
                <Box w="100%">
                  <Progress value={exportProgress} />
                  <Text fontSize="sm" mt={2}>
                    Exportando... {exportProgress}%
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* AI Insights Modal */}
      <Modal isOpen={isAIOpen} onClose={onAIClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Insights de IA</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {aiInsights.map((insight, index) => (
                <Alert key={index} status={insight.type} variant="left-accent">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{insight.title}</AlertTitle>
                    <AlertDescription>{insight.description}</AlertDescription>
                  </Box>
                </Alert>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedDataTables;
