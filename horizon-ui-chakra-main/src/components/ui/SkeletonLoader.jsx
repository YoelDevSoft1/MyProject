// SMD VITAL - SkeletonLoader Component
// Componentes de skeleton loader reutilizables

import React, { memo } from 'react';
import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SimpleGrid,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';

/**
 * Skeleton loader para tarjeta de cita
 */
export const AppointmentCardSkeleton = memo(({ count = 1 }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`skeleton-card-${index}`} bg={cardBg}>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {/* Header */}
              <Flex justify="space-between" align="start">
                <SkeletonCircle size="4" />
                <Skeleton height="20px" width="60px" />
              </Flex>
              
              {/* Información principal */}
              <VStack align="stretch" spacing={2}>
                <Skeleton height="20px" width="80%" />
                <Skeleton height="16px" width="60%" />
              </VStack>
              
              {/* Fecha y hora */}
              <HStack spacing={2}>
                <SkeletonCircle size="4" />
                <VStack align="start" spacing={1}>
                  <Skeleton height="16px" width="80px" />
                  <Skeleton height="14px" width="60px" />
                </VStack>
              </HStack>
              
              {/* Badges */}
              <HStack spacing={2}>
                <Skeleton height="24px" width="70px" borderRadius="full" />
                <Skeleton height="24px" width="50px" borderRadius="full" />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </>
  );
});

/**
 * Skeleton loader para fila de tabla
 */
export const TableRowSkeleton = memo(({ columns = 7, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <td key={colIndex} style={{ padding: '12px' }}>
            <Skeleton height="20px" />
          </td>
        ))}
      </tr>
    ))}
  </>
));

/**
 * Skeleton loader para dashboard de estadísticas
 */
export const StatsDashboardSkeleton = memo(() => (
  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={`stats-skeleton-${index}`}>
        <CardBody>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <SkeletonCircle size="8" />
              <VStack align="end" spacing={1}>
                <Skeleton height="24px" width="60px" />
                <Skeleton height="16px" width="40px" />
              </VStack>
            </HStack>
            <Skeleton height="14px" width="80%" />
          </VStack>
        </CardBody>
      </Card>
    ))}
  </SimpleGrid>
));

/**
 * Skeleton loader para filtros
 */
export const FiltersSkeleton = memo(() => (
  <Card>
    <CardBody>
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between">
          <Skeleton height="24px" width="150px" />
          <HStack spacing={2}>
            <Skeleton height="32px" width="100px" />
            <Skeleton height="32px" width="80px" />
          </HStack>
        </HStack>
        
        {/* Grid de filtros */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <VStack key={`filter-skeleton-${index}`} align="stretch" spacing={2}>
              <Skeleton height="16px" width="60%" />
              <Skeleton height="40px" />
            </VStack>
          ))}
        </SimpleGrid>
        
        {/* Botones de acción */}
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Skeleton height="32px" width="100px" />
            <Skeleton height="32px" width="120px" />
          </HStack>
          <Skeleton height="32px" width="100px" />
        </HStack>
      </VStack>
    </CardBody>
  </Card>
));

/**
 * Skeleton loader para calendario
 */
export const CalendarSkeleton = memo(() => (
  <Box>
    {/* Header del calendario */}
    <HStack justify="space-between" mb={4}>
      <HStack spacing={2}>
        <Skeleton height="32px" width="80px" />
        <Skeleton height="24px" width="120px" />
        <Skeleton height="32px" width="80px" />
      </HStack>
      <Skeleton height="32px" width="60px" />
    </HStack>
    
    {/* Grid del calendario */}
    <SimpleGrid columns={7} gap={1}>
      {/* Días de la semana */}
      {Array.from({ length: 7 }).map((_, index) => (
        <Box key={`weekday-skeleton-${index}`} p={2} textAlign="center">
          <Skeleton height="20px" />
        </Box>
      ))}
      
      {/* Días del mes */}
      {Array.from({ length: 35 }).map((_, index) => (
        <Box key={`day-skeleton-${index}`} minH="120px" p={2} border="1px solid" borderColor="gray.200">
          <VStack align="stretch" spacing={1}>
            <Skeleton height="16px" width="20px" />
            <Skeleton height="12px" />
            <Skeleton height="12px" width="80%" />
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  </Box>
));

/**
 * Skeleton loader para lista de alertas
 */
export const AlertsSkeleton = memo(({ count = 3 }) => (
  <VStack spacing={3} align="stretch">
    {Array.from({ length: count }).map((_, index) => (
      <Box key={`alert-skeleton-${index}`} p={4} borderRadius="md" border="1px solid" borderColor="gray.200">
        <HStack spacing={3}>
          <SkeletonCircle size="6" />
          <VStack align="start" spacing={2} flex="1">
            <Skeleton height="16px" width="40%" />
            <Skeleton height="14px" width="80%" />
          </VStack>
          <Skeleton height="24px" width="24px" />
        </HStack>
      </Box>
    ))}
  </VStack>
));

/**
 * Skeleton loader para métricas de rendimiento
 */
export const PerformanceMetricsSkeleton = memo(() => (
  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={`performance-skeleton-${index}`}>
        <CardBody>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <SkeletonCircle size="6" />
              <Skeleton height="14px" width="60px" />
            </HStack>
            <Skeleton height="24px" width="50%" />
            <HStack spacing={2}>
              <SkeletonCircle size="4" />
              <Skeleton height="14px" width="70%" />
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    ))}
  </SimpleGrid>
));

/**
 * Skeleton loader para indicadores circulares
 */
export const CircularIndicatorsSkeleton = memo(() => (
  <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
    {Array.from({ length: 3 }).map((_, index) => (
      <VStack key={`circular-skeleton-${index}`} spacing={3}>
        <Skeleton height="16px" width="120px" />
        <SkeletonCircle size="120px" />
        <Skeleton height="14px" width="100px" />
      </VStack>
    ))}
  </SimpleGrid>
));

/**
 * Skeleton loader genérico para contenido
 */
export const ContentSkeleton = memo(({ 
  lines = 3, 
  spacing = 4, 
  lastLineWidth = "60%" 
}) => (
  <VStack align="stretch" spacing={spacing}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={`text-skeleton-${index}`}
        height="20px"
        width={index === lines - 1 ? lastLineWidth : "100%"}
      />
    ))}
  </VStack>
));

/**
 * Skeleton loader para página completa
 */
export const PageSkeleton = memo(() => (
  <VStack align="stretch" spacing={6}>
    {/* Header */}
    <HStack justify="space-between">
      <VStack align="start" spacing={2}>
        <Skeleton height="32px" width="300px" />
        <Skeleton height="16px" width="400px" />
      </VStack>
      <Skeleton height="40px" width="120px" />
    </HStack>
    
    {/* Filtros */}
    <FiltersSkeleton />
    
    {/* Dashboard */}
    <StatsDashboardSkeleton />
    
    {/* Contenido principal */}
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Skeleton height="24px" width="150px" />
            <HStack spacing={2}>
              <Skeleton height="32px" width="40px" />
              <Skeleton height="32px" width="40px" />
              <Skeleton height="32px" width="40px" />
            </HStack>
          </HStack>
          
          {/* Tabla skeleton */}
          <Box>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <th key={`table-header-skeleton-${index}`} style={{ padding: '12px' }}>
                      <Skeleton height="20px" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton />
              </tbody>
            </table>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  </VStack>
));

// Establecer display names
AppointmentCardSkeleton.displayName = 'AppointmentCardSkeleton';
TableRowSkeleton.displayName = 'TableRowSkeleton';
StatsDashboardSkeleton.displayName = 'StatsDashboardSkeleton';
FiltersSkeleton.displayName = 'FiltersSkeleton';
CalendarSkeleton.displayName = 'CalendarSkeleton';
AlertsSkeleton.displayName = 'AlertsSkeleton';
PerformanceMetricsSkeleton.displayName = 'PerformanceMetricsSkeleton';
CircularIndicatorsSkeleton.displayName = 'CircularIndicatorsSkeleton';
ContentSkeleton.displayName = 'ContentSkeleton';
PageSkeleton.displayName = 'PageSkeleton';
