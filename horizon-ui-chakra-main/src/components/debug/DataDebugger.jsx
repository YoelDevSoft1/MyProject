// SMD VITAL - DataDebugger Component
// Componente de debug para identificar problemas con la estructura de datos

import React, { memo } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Button,
  useClipboard
} from '@chakra-ui/react';

/**
 * Componente de debug para datos de la aplicación
 * Solo se muestra en modo desarrollo
 */
export const DataDebugger = memo(({ 
  data, 
  title = "Debug Data", 
  show = process.env.NODE_ENV === 'development' 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const jsonString = JSON.stringify(data, null, 2);
  const { hasCopied, onCopy } = useClipboard(jsonString);

  if (!show) return null;

  const analyzeData = (obj, path = '') => {
    const issues = [];
    
    if (obj === null) {
      issues.push({ type: 'warning', message: `${path} is null` });
    } else if (obj === undefined) {
      issues.push({ type: 'error', message: `${path} is undefined` });
    } else if (Array.isArray(obj)) {
      if (obj.length === 0) {
        issues.push({ type: 'info', message: `${path} is empty array` });
      } else {
        obj.forEach((item, index) => {
          issues.push(...analyzeData(item, `${path}[${index}]`));
        });
      }
    } else if (typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        issues.push(...analyzeData(value, path ? `${path}.${key}` : key));
      });
    }
    
    return issues;
  };

  const issues = analyzeData(data);
  const errorIssues = issues.filter(i => i.type === 'error');
  const warningIssues = issues.filter(i => i.type === 'warning');
  const infoIssues = issues.filter(i => i.type === 'info');

  return (
    <Card bg={cardBg} borderColor={borderColor} border="2px solid" borderStyle="dashed">
      <CardHeader>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Heading size="sm" color="orange.500">
              🐛 {title}
            </Heading>
            <Badge colorScheme="orange" variant="subtle">
              DEBUG MODE
            </Badge>
          </HStack>
          <Button size="xs" onClick={onCopy}>
            {hasCopied ? 'Copiado!' : 'Copiar JSON'}
          </Button>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {/* Resumen de issues */}
          {(errorIssues.length > 0 || warningIssues.length > 0) && (
            <Alert status={errorIssues.length > 0 ? "error" : "warning"} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">
                  {errorIssues.length > 0 ? 'Errores encontrados' : 'Advertencias encontradas'}
                </AlertTitle>
                <AlertDescription fontSize="sm">
                  {errorIssues.length > 0 && `${errorIssues.length} errores, `}
                  {warningIssues.length > 0 && `${warningIssues.length} advertencias, `}
                  {infoIssues.length > 0 && `${infoIssues.length} información`}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Información básica */}
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="bold">Información Básica:</Text>
            <HStack wrap="wrap" spacing={2}>
              <Badge>Tipo: {Array.isArray(data) ? 'Array' : typeof data}</Badge>
              {Array.isArray(data) && (
                <Badge colorScheme="blue">Longitud: {data.length}</Badge>
              )}
              {data && typeof data === 'object' && !Array.isArray(data) && (
                <Badge colorScheme="green">Propiedades: {Object.keys(data).length}</Badge>
              )}
            </HStack>
          </VStack>

          {/* Issues detallados */}
          {issues.length > 0 && (
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontSize="sm" fontWeight="bold">
                      Issues Detectados ({issues.length})
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    {errorIssues.map((issue, index) => (
                      <Alert key={index} status="error" size="sm">
                        <AlertIcon />
                        <Text fontSize="xs">{issue.message}</Text>
                      </Alert>
                    ))}
                    {warningIssues.map((issue, index) => (
                      <Alert key={index} status="warning" size="sm">
                        <AlertIcon />
                        <Text fontSize="xs">{issue.message}</Text>
                      </Alert>
                    ))}
                    {infoIssues.slice(0, 5).map((issue, index) => (
                      <Alert key={index} status="info" size="sm">
                        <AlertIcon />
                        <Text fontSize="xs">{issue.message}</Text>
                      </Alert>
                    ))}
                    {infoIssues.length > 5 && (
                      <Text fontSize="xs" color="gray.500">
                        ... y {infoIssues.length - 5} más
                      </Text>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}

          {/* JSON Raw */}
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontSize="sm" fontWeight="bold">JSON Raw Data</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Box
                  as="pre"
                  fontSize="xs"
                  bg="gray.50"
                  p={3}
                  borderRadius="md"
                  overflow="auto"
                  maxH="300px"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Code colorScheme="gray" fontSize="xs">
                    {jsonString}
                  </Code>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </CardBody>
    </Card>
  );
});

DataDebugger.displayName = 'DataDebugger';

export default DataDebugger;
