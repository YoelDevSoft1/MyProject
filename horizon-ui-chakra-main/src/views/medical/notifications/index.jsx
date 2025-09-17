// Chakra imports
import {
  Box,
  Flex,
  Grid,
  useColorModeValue,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import React, { useState } from "react";
// Assets
import { MdAdd, MdDelete, MdVisibility, MdMarkAsUnread, MdDone, MdSettings, MdWarning, MdInfo } from "react-icons/md";
import { FaBell, FaExclamationTriangle, FaCheck } from "react-icons/fa";

export default function Notifications() {
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const notificationBgUnread = useColorModeValue("brand.50", "brand.900");
  const notificationBgRead = useColorModeValue("gray.50", "gray.700");
  const notificationBorderUnread = useColorModeValue("brand.200", "brand.600");
  const notificationBorderRead = useColorModeValue("gray.200", "gray.600");
  const messageBg = useColorModeValue("gray.50", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Datos simulados de notificaciones SMD VITAL
  const notifications = [
    {
      id: 1,
      title: "Nueva cita SMD VITAL programada",
      message: "María González tiene una cita SMD VITAL programada para mañana a las 14:00",
      type: "appointment",
      priority: "high",
      status: "unread",
      timestamp: "2024-01-20 10:30",
      sender: "Sistema SMD VITAL",
      category: "citas"
    },
    {
      id: 2,
      title: "Recordatorio SMD VITAL de medicación",
      message: "Recordatorio SMD VITAL: Juan Pérez debe tomar su medicamento a las 8:00 AM",
      type: "reminder",
      priority: "medium",
      status: "unread",
      timestamp: "2024-01-20 08:00",
      sender: "Sistema SMD VITAL",
      category: "medicamentos"
    },
    {
      id: 3,
      title: "Expediente SMD VITAL actualizado",
      message: "El expediente SMD VITAL de Laura Rodríguez ha sido actualizado con nuevos exámenes",
      type: "update",
      priority: "low",
      status: "read",
      timestamp: "2024-01-19 16:45",
      sender: "Dr. Carlos López - SMD VITAL",
      category: "expedientes"
    },
    {
      id: 4,
      title: "Pago SMD VITAL recibido",
      message: "Se ha recibido el pago SMD VITAL de $180,000 de Pedro Sánchez",
      type: "payment",
      priority: "medium",
      status: "read",
      timestamp: "2024-01-19 14:20",
      sender: "Sistema de Pagos SMD VITAL",
      category: "pagos"
    },
    {
      id: 5,
      title: "Alerta SMD VITAL de medicamento",
      message: "Advertencia SMD VITAL: El medicamento prescrito puede causar interacción con alergias conocidas",
      type: "alert",
      priority: "urgent",
      status: "unread",
      timestamp: "2024-01-19 11:15",
      sender: "Sistema de IA SMD VITAL",
      category: "medicamentos"
    },
    {
      id: 6,
      title: "Mantenimiento SMD VITAL programado",
      message: "El sistema SMD VITAL estará en mantenimiento el domingo de 2:00 AM a 4:00 AM",
      type: "system",
      priority: "low",
      status: "read",
      timestamp: "2024-01-18 17:30",
      sender: "Administrador SMD VITAL",
      category: "sistema"
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case "appointment": return FaBell;
      case "reminder": return MdWarning;
      case "update": return MdInfo;
      case "payment": return FaCheck;
      case "alert": return FaExclamationTriangle;
      case "system": return MdSettings;
      default: return FaBell;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "appointment": return "blue";
      case "reminder": return "yellow";
      case "update": return "green";
      case "payment": return "green";
      case "alert": return "red";
      case "system": return "gray";
      default: return "gray";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "red";
      case "high": return "orange";
      case "medium": return "yellow";
      case "low": return "green";
      default: return "gray";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "urgent": return "Urgente";
      case "high": return "Alta";
      case "medium": return "Media";
      case "low": return "Baja";
      default: return priority;
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    onOpen();
  };

  const markAsRead = (id) => {
    // Aquí se marcaría como leída en el estado
    console.log("Marcando como leída:", id);
  };

  const markAsUnread = (id) => {
    // Aquí se marcaría como no leída en el estado
    console.log("Marcando como no leída:", id);
  };

  const deleteNotification = (id) => {
    // Aquí se eliminaría la notificación
    console.log("Eliminando notificación:", id);
  };

  // Estadísticas de notificaciones
  const unreadCount = notifications.filter(n => n.status === "unread").length;
  const urgentCount = notifications.filter(n => n.priority === "urgent" && n.status === "unread").length;
  const todayCount = notifications.filter(n => n.timestamp.includes("2024-01-20")).length;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Header */}
      <Flex 
        direction={{ base: "column", lg: "row" }} 
        justify="space-between" 
        align={{ base: "stretch", lg: "center" }} 
        mb="20px"
        gap={4}
      >
        <Box textAlign={{ base: "center", lg: "left" }}>
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            fontWeight="700" 
            color={textColor}
          >
            Notificaciones SMD VITAL
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color={textColorSecondary}
          >
            Gestiona las notificaciones y alertas del sistema SMD VITAL
          </Text>
        </Box>
        <HStack 
          spacing={{ base: "5px", md: "10px" }}
          justify={{ base: "center", lg: "flex-end" }}
          wrap="wrap"
        >
          <Button
            leftIcon={<Icon as={MdDone} />}
            colorScheme="blue"
            variant="outline"
            size={{ base: "sm", md: "lg" }}
            width={{ base: "full", sm: "auto" }}
          >
            <Text display={{ base: "none", sm: "block" }}>
              Marcar Todas como Leídas SMD VITAL
            </Text>
            <Text display={{ base: "block", sm: "none" }}>
              Marcar Leídas
            </Text>
          </Button>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="brand"
            size={{ base: "sm", md: "lg" }}
            onClick={onOpen}
            width={{ base: "full", sm: "auto" }}
          >
            <Text display={{ base: "none", sm: "block" }}>
              Nueva Notificación SMD VITAL
            </Text>
            <Text display={{ base: "block", sm: "none" }}>
              Nueva Notificación
            </Text>
          </Button>
        </HStack>
      </Flex>

      {/* Estadísticas de Notificaciones */}
      <Grid 
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} 
        gap={{ base: "15px", md: "20px" }} 
        mb="20px"
      >
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              No Leídas
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {unreadCount}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              12.5%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Urgentes
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {urgentCount}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              8.2%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Hoy
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {todayCount}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              3.1%
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={useColorModeValue("white", "navy.800")}
          borderRadius="20px"
          p={{ base: "15px", md: "20px" }}
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          <Stat>
            <StatLabel 
              fontSize={{ base: "xs", md: "sm" }} 
              color={textColorSecondary} 
              fontWeight="700"
            >
              Total
            </StatLabel>
            <StatNumber 
              fontSize={{ base: "lg", md: "2xl" }} 
              fontWeight="700" 
              color={textColor}
            >
              {notifications.length}
            </StatNumber>
            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
              <StatArrow type="increase" />
              15.3%
            </StatHelpText>
          </Stat>
        </Box>
      </Grid>

      {/* Filtros */}
      <Box
        bg={useColorModeValue("white", "navy.800")}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        mb="20px"
      >
        <Grid 
          templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }} 
          gap={{ base: "15px", md: "20px" }}
        >
          <Select 
            placeholder="Filtrar por tipo"
            size={{ base: "sm", md: "md" }}
          >
            <option value="appointment">Citas</option>
            <option value="reminder">Recordatorios</option>
            <option value="update">Actualizaciones</option>
            <option value="payment">Pagos</option>
            <option value="alert">Alertas</option>
            <option value="system">Sistema</option>
          </Select>
          <Select 
            placeholder="Filtrar por prioridad"
            size={{ base: "sm", md: "md" }}
          >
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </Select>
          <Select 
            placeholder="Filtrar por estado"
            size={{ base: "sm", md: "md" }}
          >
            <option value="unread">No leídas</option>
            <option value="read">Leídas</option>
          </Select>
        </Grid>
      </Box>

      {/* Lista de Notificaciones */}
      <Box
        bg={useColorModeValue("white", "navy.800")}
        borderRadius="20px"
        p={{ base: "15px", md: "20px" }}
        boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      >
        <VStack spacing={{ base: "10px", md: "15px" }} align="stretch">
          {notifications.map((notification) => (
            <Box
              key={notification.id}
              p={{ base: "15px", md: "20px" }}
              bg={notification.status === "unread" ? notificationBgUnread : notificationBgRead}
              borderRadius="12px"
              border={notification.status === "unread" ? "2px solid" : "1px solid"}
              borderColor={notification.status === "unread" ? notificationBorderUnread : notificationBorderRead}
              cursor="pointer"
              onClick={() => handleViewNotification(notification)}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              <HStack 
                justify="space-between" 
                mb={{ base: "8px", md: "10px" }}
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                spacing={2}
                wrap="wrap"
              >
                <HStack 
                  spacing={{ base: "10px", md: "15px" }} 
                  flex="1" 
                  minW="0"
                  maxW={{ base: "100%", sm: "calc(100% - 120px)", md: "calc(100% - 150px)" }}
                >
                  <Icon
                    as={getTypeIcon(notification.type)}
                    w={{ base: "20px", md: "24px" }}
                    h={{ base: "20px", md: "24px" }}
                    color={`${getTypeColor(notification.type)}.500`}
                    flexShrink={0}
                  />
                  <VStack align="start" spacing="2px" flex="1" minW="0">
                    <Text 
                      fontWeight={notification.status === "unread" ? "700" : "600"} 
                      color={textColor}
                      fontSize={{ base: "sm", md: "md" }}
                      isTruncated
                      maxW="100%"
                    >
                      {notification.title}
                    </Text>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      color={textColorSecondary}
                      noOfLines={{ base: 1, sm: 2 }}
                      isTruncated
                      maxW="100%"
                    >
                      {notification.message}
                    </Text>
                  </VStack>
                </HStack>
                <HStack 
                  spacing={{ base: "5px", md: "10px" }}
                  justify={{ base: "center", sm: "flex-end" }}
                  wrap="wrap"
                  flexShrink={0}
                >
                  <Badge 
                    colorScheme={getPriorityColor(notification.priority)} 
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                  >
                    {getPriorityText(notification.priority)}
                  </Badge>
                  {notification.status === "unread" && (
                    <Box 
                      w={{ base: "6px", md: "8px" }} 
                      h={{ base: "6px", md: "8px" }} 
                      bg="brand.500" 
                      borderRadius="50%" 
                    />
                  )}
                </HStack>
              </HStack>
              <HStack 
                justify="space-between"
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                spacing={2}
                wrap="wrap"
              >
                <Text 
                  fontSize={{ base: "xs", md: "sm" }} 
                  color={textColorSecondary}
                  textAlign={{ base: "center", sm: "left" }}
                  isTruncated
                  maxW={{ base: "100%", sm: "calc(100% - 200px)", md: "calc(100% - 250px)" }}
                  flex="1"
                  minW="0"
                >
                  {notification.timestamp} • {notification.sender}
                </Text>
                <HStack 
                  spacing={{ base: "2px", md: "3px" }}
                  justify={{ base: "center", sm: "flex-end" }}
                  wrap="wrap"
                  maxW={{ base: "100%", sm: "200px", md: "250px" }}
                  flexShrink={0}
                >
                  <Button
                    size={{ base: "xs", md: "sm" }}
                    leftIcon={<Icon as={MdVisibility} />}
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewNotification(notification);
                    }}
                    minW="auto"
                    px={{ base: 2, md: 3 }}
                  >
                    <Text display={{ base: "none", sm: "block" }}>Ver</Text>
                  </Button>
                  {notification.status === "unread" ? (
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdDone} />}
                      variant="ghost"
                      colorScheme="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      minW="auto"
                      px={{ base: 2, md: 3 }}
                    >
                      <Text display={{ base: "none", sm: "block" }}>Leída</Text>
                    </Button>
                  ) : (
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={MdMarkAsUnread} />}
                      variant="ghost"
                      colorScheme="yellow"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsUnread(notification.id);
                      }}
                      minW="auto"
                      px={{ base: 2, md: 3 }}
                    >
                      <Text display={{ base: "none", sm: "block" }}>No Leída</Text>
                    </Button>
                  )}
                  <Button
                    size={{ base: "xs", md: "sm" }}
                    leftIcon={<Icon as={MdDelete} />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    minW="auto"
                    px={{ base: 2, md: 3 }}
                  >
                    <Text display={{ base: "none", sm: "block" }}>Eliminar</Text>
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Modal de Detalles de Notificación */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "xl", lg: "2xl" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader 
            fontSize={{ base: "lg", md: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            Detalles de la Notificación
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            {selectedNotification && (
              <VStack spacing={{ base: "15px", md: "20px" }} align="stretch">
                <HStack 
                  justify="space-between"
                  direction={{ base: "column", sm: "row" }}
                  align={{ base: "stretch", sm: "center" }}
                  spacing={2}
                >
                  <HStack spacing={{ base: "10px", md: "15px" }}>
                    <Icon
                      as={getTypeIcon(selectedNotification.type)}
                      w={{ base: "24px", md: "32px" }}
                      h={{ base: "24px", md: "32px" }}
                      color={`${getTypeColor(selectedNotification.type)}.500`}
                    />
                    <VStack align="start" spacing="5px">
                      <Text 
                        fontSize={{ base: "lg", md: "xl" }} 
                        fontWeight="700" 
                        color={textColor}
                        isTruncated
                        maxW="300px"
                      >
                        {selectedNotification.title}
                      </Text>
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }} 
                        color={textColorSecondary}
                      >
                        {selectedNotification.timestamp} • {selectedNotification.sender}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge 
                    colorScheme={getPriorityColor(selectedNotification.priority)} 
                    variant="solid" 
                    size={{ base: "md", md: "lg" }}
                  >
                    {getPriorityText(selectedNotification.priority)}
                  </Badge>
                </HStack>
                
                <Divider />
                
                <Box>
                  <Text 
                    fontWeight="600" 
                    color={textColor} 
                    mb={{ base: "8px", md: "10px" }}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    Mensaje
                  </Text>
                  <Text 
                    color={textColor} 
                    p={{ base: "10px", md: "15px" }} 
                    bg={messageBg} 
                    borderRadius="8px"
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    {selectedNotification.message}
                  </Text>
                </Box>
                
                <Grid 
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                  gap={{ base: "15px", md: "20px" }}
                >
                  <Box>
                    <Text 
                      fontWeight="600" 
                      color={textColor} 
                      mb="5px"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Tipo
                    </Text>
                    <Text 
                      color={textColorSecondary} 
                      textTransform="capitalize"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {selectedNotification.type}
                    </Text>
                  </Box>
                  <Box>
                    <Text 
                      fontWeight="600" 
                      color={textColor} 
                      mb="5px"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Categoría
                    </Text>
                    <Text 
                      color={textColorSecondary} 
                      textTransform="capitalize"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {selectedNotification.category}
                    </Text>
                  </Box>
                  <Box>
                    <Text 
                      fontWeight="600" 
                      color={textColor} 
                      mb="5px"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Estado
                    </Text>
                    <Badge 
                      colorScheme={selectedNotification.status === "unread" ? "blue" : "green"} 
                      variant="solid"
                      size={{ base: "sm", md: "md" }}
                    >
                      {selectedNotification.status === "unread" ? "No Leída" : "Leída"}
                    </Badge>
                  </Box>
                  <Box>
                    <Text 
                      fontWeight="600" 
                      color={textColor} 
                      mb="5px"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      Prioridad
                    </Text>
                    <Badge 
                      colorScheme={getPriorityColor(selectedNotification.priority)} 
                      variant="outline"
                      size={{ base: "sm", md: "md" }}
                    >
                      {getPriorityText(selectedNotification.priority)}
                    </Badge>
                  </Box>
                </Grid>
                
                <HStack 
                  spacing={{ base: "5px", md: "10px" }} 
                  justify="center"
                  wrap="wrap"
                >
                  {selectedNotification.status === "unread" ? (
                    <Button 
                      colorScheme="blue" 
                      leftIcon={<Icon as={MdDone} />}
                      size={{ base: "sm", md: "md" }}
                      width={{ base: "full", sm: "auto" }}
                    >
                      Marcar como Leída
                    </Button>
                  ) : (
                    <Button 
                      colorScheme="yellow" 
                      leftIcon={<Icon as={MdMarkAsUnread} />}
                      size={{ base: "sm", md: "md" }}
                      width={{ base: "full", sm: "auto" }}
                    >
                      Marcar como No Leída
                    </Button>
                  )}
                  <Button 
                    colorScheme="red" 
                    leftIcon={<Icon as={MdDelete} />}
                    size={{ base: "sm", md: "md" }}
                    width={{ base: "full", sm: "auto" }}
                  >
                    Eliminar
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
