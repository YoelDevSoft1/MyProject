// SMD VITAL - RealtimeDashboard Component
// Dashboard en tiempo real con métricas de citas médicas

import React, { memo } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  HStack,
  VStack,
  Heading,
  Text,
  Switch,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
  Tooltip,
  ScaleFade,
  Skeleton,
  Divider
} from '@chakra-ui/react';
import {
  MdRefresh,
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdSpeed,
  MdAccessTime,
  MdMonitorHeart,
  MdWarning,
  MdSchedule,
  MdNotifications,
  MdCheckCircle,
  MdCancel,
  MdVideoCall,
  MdPeople,
  MdLocalHospital
} from 'react-icons/md';
import useRealtimeStats from '../../hooks/useRealtimeStats';
import DataDebugger from '../debug/DataDebugger';

/**
 * Componente de dashboard en tiempo real
 * 
 * @param {Object} props - Props del componente
 * @param {boolean} props.enabled - Si el dashboard está habilitado
 * @param {Function} props.onToggle - Función para toggle del tiempo real
 * @param {number} props.refreshInterval - Intervalo de actualización en ms
 * @param {boolean} props.showAlerts - Si mostrar alertas
 * @param {boolean} props.showTrends - Si mostrar tendencias
 */
export const RealtimeDashboard = memo(({
  enabled = true,
  onToggle,
  refreshInterval = 30000,
  showAlerts = true,
  showTrends = true
}) => {
  // Hook de estadísticas en tiempo real
  const {
    stats,
    alerts,
    loading,
    error,
    isRealTimeEnabled,
    completionRate,
    urgencyRate,
    telemedicineRate,
    hasUrgentAlerts,
    alertCount,
    isHealthy,
    refreshStats,
    toggleRealTime,
    dismissAlert,
    clearAllAlerts,
    formatCurrency,
    formatPercentage
  } = useRealtimeStats({
    enabled,
    refreshInterval,
    includeAlerts: showAlerts,
    includeTrends: showTrends
  });

  // Colores del tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const successBg = useColorModeValue('green.50', 'green.900');
  const warningBg = useColorModeValue('yellow.50', 'yellow.900');
  const errorBg = useColorModeValue('red.50', 'red.900');

  // Handler para toggle
  const handleToggle = (isEnabled) => {
    toggleRealTime(isEnabled);
    onToggle?.(isEnabled);
  };

  // Renderizar métrica principal
  const renderMainMetric = (title, value, icon, colorScheme, trend = null, subtitle = null) => (
    <Card bg={`${colorScheme}.50`} borderColor={`${colorScheme}.200`}>
      <CardBody>
        <Stat>
          <StatLabel fontSize="sm" color={`${colorScheme}.600`}>
            {title}
          </StatLabel>
          <HStack spacing={3}>
            <Icon as={icon} boxSize={8} color={`${colorScheme}.500`} />
            <VStack align="start" spacing={0}>
              <StatNumber fontSize="2xl" color={`${colorScheme}.700`}>
                {value}
              </StatNumber>
              {subtitle && (
                <Text fontSize="xs" color={`${colorScheme}.600`}>
                  {subtitle}
                </Text>
              )}
            </VStack>
          </HStack>
          {trend && (
            <StatHelpText>
              <StatArrow 
                type={trend.direction === 'up' ? 'increase' : 'decrease'} 
                color={trend.direction === 'up' ? 'green.500' : 'red.500'}
              />
              {Math.abs(trend.change)}% vs ayer
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );

  // Renderizar métrica de rendimiento
  const renderPerformanceMetric = (title, value, icon, colorScheme, trend = null, isPercentage = false) => (
    <Card>
      <CardBody>
        <HStack justify="space-between" mb={2}>
          <Icon as={icon} color={`${colorScheme}.500`} boxSize={6} />
          <Text fontSize="sm" color={textColorSecondary}>{title}</Text>
        </HStack>
        
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          {isPercentage ? formatPercentage(value) : value}
        </Text>
        
        {trend && (
          <HStack mt={2}>
            <Icon 
              as={trend.direction === 'up' ? MdTrendingUp : MdTrendingDown} 
              color={trend.direction === 'up' ? 'green.500' : 'red.500'}
              boxSize={4}
            />
            <Text fontSize="sm" color={textColorSecondary}>
              {Math.abs(trend.change)}% vs ayer
            </Text>
          </HStack>
        )}
      </CardBody>
    </Card>
  );

  // Renderizar alerta
  const renderAlert = (alert) => (
    <ScaleFade key={alert.id} in={true} initialScale={0.9}>
      <Alert 
        status={alert.type} 
        borderRadius="md"
        variant="left-accent"
      >
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="sm">{alert.title}</AlertTitle>
          <AlertDescription fontSize="sm">
            {alert.message}
          </AlertDescription>
        </Box>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => dismissAlert(alert.id)}
          aria-label={`Descartar alerta: ${alert.title}`}
        >
          ×
        </Button>
      </Alert>
    </ScaleFade>
  );

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Error al cargar estadísticas</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Card bg={cardBg} borderColor={borderColor}>
      <CardHeader>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Heading size="md" color={textColor}>
              Dashboard en Tiempo Real
            </Heading>
            
            <HStack spacing={2}>
              <Switch
                isChecked={isRealTimeEnabled}
                onChange={(e) => handleToggle(e.target.checked)}
                size="sm"
                colorScheme="blue"
                id="realtime-toggle"
              />
              <Text fontSize="sm" color={textColorSecondary}>
                Tiempo Real
              </Text>
            </HStack>

            {isHealthy ? (
              <Badge colorScheme="green" variant="subtle">
                Sistema Saludable
              </Badge>
            ) : (
              <Badge colorScheme="red" variant="subtle">
                Requiere Atención
              </Badge>
            )}
          </HStack>

          <HStack spacing={2}>
            <Text fontSize="xs" color={textColorSecondary}>
              Última actualización: {stats.lastUpdated ? 
                stats.lastUpdated.toLocaleTimeString('es-CO') : 'N/A'}
            </Text>
            
            <Tooltip label="Actualizar ahora">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Icon as={MdRefresh} />}
                onClick={refreshStats}
                isLoading={loading}
                aria-label="Actualizar estadísticas"
              >
                Actualizar
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Métricas principales */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            {renderMainMetric(
              'Total Citas',
              stats.totalAppointments,
              MdLocalHospital,
              'blue',
              stats.trends.appointments
            )}
            
            {renderMainMetric(
              'Citas Hoy',
              stats.todayAppointments,
              MdSchedule,
              'green',
              null,
              `${stats.completedToday} completadas`
            )}
            
            {renderMainMetric(
              'Urgentes',
              stats.urgentAppointments,
              MdWarning,
              'red',
              null,
              'Requieren atención'
            )}
            
            {renderMainMetric(
              'Telemedicina',
              stats.telemedicineCount,
              MdVideoCall,
              'purple',
              null,
              'Consultas virtuales'
            )}
          </SimpleGrid>

          {/* Métricas de rendimiento */}
          <Box>
            <Heading size="sm" mb={4} color={textColor}>
              Métricas de Rendimiento
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
              {renderPerformanceMetric(
                'Ingresos',
                formatCurrency(stats.revenue),
                MdAttachMoney,
                'green',
                stats.trends.revenue
              )}
              
              {renderPerformanceMetric(
                'Eficiencia',
                stats.trends.efficiency.value,
                MdSpeed,
                'blue',
                stats.trends.efficiency,
                true
              )}
              
              {renderPerformanceMetric(
                'Tiempo Promedio',
                `${stats.averageWaitTime} min`,
                MdAccessTime,
                'orange'
              )}
              
              {renderPerformanceMetric(
                'Satisfacción',
                stats.trends.satisfaction.value,
                MdMonitorHeart,
                'pink',
                stats.trends.satisfaction,
                true
              )}
            </SimpleGrid>
          </Box>

          {/* Indicadores de progreso */}
          <Box>
            <Heading size="sm" mb={4} color={textColor}>
              Indicadores de Progreso
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  Tasa de Completación
                </Text>
                <CircularProgress 
                  value={completionRate} 
                  color="green.400"
                  size="120px"
                  thickness="12px"
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="bold">
                    {formatPercentage(completionRate)}
                  </CircularProgressLabel>
                </CircularProgress>
                <Text fontSize="xs" color={textColorSecondary} textAlign="center">
                  Citas completadas hoy
                </Text>
              </VStack>

              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  Tasa de Urgencia
                </Text>
                <CircularProgress 
                  value={urgencyRate} 
                  color={urgencyRate > 20 ? "red.400" : "yellow.400"}
                  size="120px"
                  thickness="12px"
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="bold">
                    {formatPercentage(urgencyRate)}
                  </CircularProgressLabel>
                </CircularProgress>
                <Text fontSize="xs" color={textColorSecondary} textAlign="center">
                  Citas urgentes del total
                </Text>
              </VStack>

              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  Telemedicina
                </Text>
                <CircularProgress 
                  value={telemedicineRate} 
                  color="purple.400"
                  size="120px"
                  thickness="12px"
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="bold">
                    {formatPercentage(telemedicineRate)}
                  </CircularProgressLabel>
                </CircularProgress>
                <Text fontSize="xs" color={textColorSecondary} textAlign="center">
                  Consultas virtuales
                </Text>
              </VStack>
            </SimpleGrid>
          </Box>

          {/* Alertas del sistema */}
          {showAlerts && alerts.length > 0 && (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={3}>
                  <Heading size="sm" color={textColor}>
                    Alertas del Sistema
                  </Heading>
                  <Badge 
                    colorScheme={hasUrgentAlerts ? "red" : "yellow"} 
                    variant="subtle"
                  >
                    {alertCount} alerta{alertCount !== 1 ? 's' : ''}
                  </Badge>
                </HStack>
                
                {alertCount > 1 && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={clearAllAlerts}
                    colorScheme="gray"
                  >
                    Limpiar Todo
                  </Button>
                )}
              </Flex>
              
              <VStack spacing={3} align="stretch">
                {alerts.slice(0, 5).map(renderAlert)}
                
                {alerts.length > 5 && (
                  <Text fontSize="sm" color={textColorSecondary} textAlign="center">
                    +{alerts.length - 5} alertas más
                  </Text>
                )}
              </VStack>
            </Box>
          )}

          {/* Estado de carga */}
          {loading && (
            <Box>
              <Progress size="xs" isIndeterminate colorScheme="blue" />
              <Text fontSize="xs" color={textColorSecondary} mt={2} textAlign="center">
                Actualizando estadísticas...
              </Text>
            </Box>
          )}

          {/* Debug en modo desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <DataDebugger 
              data={{
                stats,
                alerts,
                loading,
                error,
                isRealTimeEnabled,
                completionRate,
                urgencyRate,
                telemedicineRate
              }}
              title="Dashboard Stats Debug"
            />
          )}
        </VStack>
      </CardBody>
    </Card>
  );
});

RealtimeDashboard.displayName = 'RealtimeDashboard';

export default RealtimeDashboard;
