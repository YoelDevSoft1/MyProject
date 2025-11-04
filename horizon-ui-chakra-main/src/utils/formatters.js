/**
 * SMD VITAL - Utilidades de Formateo
 * ===================================
 * 
 * Funciones utilitarias para formatear datos en el sistema médico.
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

/**
 * Formatear moneda
 */
export const formatCurrency = (amount, currency = 'COP') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Formatear fecha
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatear hora
 */
export const formatTime = (time, options = {}) => {
  if (!time) return 'N/A';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    const timeObj = new Date(`2000-01-01T${time}`);
    return timeObj.toLocaleTimeString('es-ES', formatOptions);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Hora inválida';
  }
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (dateTime, options = {}) => {
  if (!dateTime) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    const dateObj = new Date(dateTime);
    return dateObj.toLocaleString('es-ES', formatOptions);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Fecha/hora inválida';
  }
};

/**
 * Formatear número
 */
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return 'N/A';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('es-ES', formatOptions).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return 'Número inválido';
  }
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  
  try {
    return `${(value * 100).toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return 'Porcentaje inválido';
  }
};

/**
 * Formatear duración
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  
  return `${mins}m`;
};

/**
 * Formatear edad
 */
export const formatAge = (birthDate) => {
  if (!birthDate) return 'N/A';
  
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} años`;
  } catch (error) {
    console.error('Error formatting age:', error);
    return 'Edad inválida';
  }
};

/**
 * Formatear documento de identidad
 */
export const formatDocument = (document, type = 'CC') => {
  if (!document) return 'N/A';
  
  const docStr = document.toString();
  
  // Formatear según el tipo
  switch (type.toUpperCase()) {
    case 'CC':
    case 'TI':
      return docStr.replace(/(\d{1,3})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3-$4');
    case 'NIT':
      return docStr.replace(/(\d{1,3})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    case 'PASSPORT':
      return docStr.toUpperCase();
    default:
      return docStr;
  }
};

/**
 * Formatear teléfono
 */
export const formatPhone = (phone, country = 'CO') => {
  if (!phone) return 'N/A';
  
  const phoneStr = phone.toString().replace(/\D/g, '');
  
  if (country === 'CO') {
    if (phoneStr.length === 10) {
      return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (phoneStr.length === 11) {
      return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '+57 ($1) $2-$3');
    }
  }
  
  return phoneStr;
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatear estado
 */
export const formatStatus = (status, type = 'general') => {
  if (!status) return 'N/A';
  
  const statusMap = {
    general: {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
      completed: 'Completado',
      cancelled: 'Cancelado',
      failed: 'Fallido'
    },
    appointment: {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
      rescheduled: 'Reprogramada'
    },
    payment: {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    },
    notification: {
      pending: 'Pendiente',
      sent: 'Enviada',
      delivered: 'Entregada',
      failed: 'Fallida',
      cancelled: 'Cancelada'
    }
  };
  
  return statusMap[type]?.[status] || status;
};

/**
 * Formatear texto con truncamiento
 */
export const formatText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return 'N/A';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + suffix;
};

/**
 * Formatear nombre completo
 */
export const formatFullName = (firstName, lastName, middleName = '') => {
  const parts = [firstName, middleName, lastName].filter(Boolean);
  return parts.join(' ');
};

/**
 * Formatear dirección
 */
export const formatAddress = (address) => {
  if (!address) return 'N/A';
  
  const parts = [
    address.street,
    address.number,
    address.apartment,
    address.neighborhood,
    address.city,
    address.state,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Formatear coordenadas
 */
export const formatCoordinates = (lat, lng, precision = 6) => {
  if (!lat || !lng) return 'N/A';
  
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Formatear código de barras
 */
export const formatBarcode = (code, type = 'CODE128') => {
  if (!code) return 'N/A';
  
  // Limpiar el código
  const cleanCode = code.toString().replace(/\D/g, '');
  
  // Agregar checksum si es necesario
  if (type === 'CODE128' && cleanCode.length >= 8) {
    return cleanCode;
  }
  
  return cleanCode;
};

/**
 * Formatear UUID
 */
export const formatUUID = (uuid, short = false) => {
  if (!uuid) return 'N/A';
  
  if (short) {
    return uuid.substring(0, 8) + '...';
  }
  
  return uuid.toUpperCase();
};

/**
 * Formatear tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Hace un momento';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  } else {
    return formatDate(date);
  }
};

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatDuration,
  formatAge,
  formatDocument,
  formatPhone,
  formatFileSize,
  formatStatus,
  formatText,
  formatFullName,
  formatAddress,
  formatCoordinates,
  formatBarcode,
  formatUUID,
  formatRelativeTime
};


