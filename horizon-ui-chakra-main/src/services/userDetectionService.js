// SMD VITAL - User Detection Service
// Servicio para manejar la detección inteligente de tipos de usuario

import apiService from './apiService';

class UserDetectionService {
  constructor() {
    this.apiService = apiService;
  }

  /**
   * Obtener información de detección del usuario actual
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Información de detección del usuario
   */
  async getUserDetectionInfo(token) {
    try {
      const response = await this.apiService.request('/api/auth/me/detection', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        return {
          success: true,
          data: this.transformDetectionData(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error getting user detection info:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener información de detección'
      };
    }
  }

  /**
   * Transformar datos de detección para consistencia
   * @param {Object} detectionData - Datos de detección del backend
   * @returns {Object} Datos transformados
   */
  transformDetectionData(detectionData) {
    if (!detectionData) return null;

    return {
      user_id: detectionData.user_id,
      email: detectionData.email,
      detection: {
        detected_type: detectionData.detection?.detected_type || 'patient',
        confidence: detectionData.detection?.confidence || 0.0,
        reasons: detectionData.detection?.reasons || [],
        category: detectionData.detection?.category || 'patients',
        suggested_interface: detectionData.detection?.suggested_interface || 'patient',
        permissions: detectionData.detection?.permissions || []
      },
      dashboard_config: {
        title: detectionData.dashboard_config?.title || 'Mi Panel',
        widgets: detectionData.dashboard_config?.widgets || [],
        primary_color: detectionData.dashboard_config?.primary_color || '#27AE60',
        icon: detectionData.dashboard_config?.icon || 'user'
      },
      original_role: detectionData.original_role || 'patient',
      specialty: detectionData.specialty || '',
      detection_timestamp: detectionData.detection_timestamp
    };
  }

  /**
   * Obtener configuración de ruta basada en el tipo detectado
   * @param {Object} detectionData - Datos de detección
   * @returns {Object} Configuración de ruta
   */
  getRouteConfig(detectionData) {
    const detectedType = detectionData?.detection?.detected_type || 'patient';
    const confidence = detectionData?.detection?.confidence || 0.0;
    
    const routeConfigs = {
      doctor: {
        primaryRoute: '/admin/doctor-dashboard',
        fallbackRoute: '/admin/dashboard',
        name: 'Panel del Doctor',
        icon: 'stethoscope',
        color: '#2D5A87'
      },
      nurse: {
        primaryRoute: '/admin/nurse-dashboard', 
        fallbackRoute: '/admin/dashboard',
        name: 'Panel de Enfermería',
        icon: 'heart',
        color: '#4A90E2'
      },
      admin: {
        primaryRoute: '/admin/dashboard',
        fallbackRoute: '/admin/dashboard',
        name: 'Panel de Administración',
        icon: 'settings',
        color: '#E74C3C'
      },
      receptionist: {
        primaryRoute: '/admin/reception-dashboard',
        fallbackRoute: '/admin/dashboard',
        name: 'Panel de Recepción',
        icon: 'calendar',
        color: '#F39C12'
      },
      technician: {
        primaryRoute: '/admin/technician-dashboard',
        fallbackRoute: '/admin/dashboard',
        name: 'Panel del Técnico',
        icon: 'tools',
        color: '#9B59B6'
      },
      pharmacist: {
        primaryRoute: '/admin/pharmacy-dashboard',
        fallbackRoute: '/admin/dashboard',
        name: 'Panel de Farmacia',
        icon: 'pills',
        color: '#E67E22'
      },
      patient: {
        primaryRoute: '/admin/patient-dashboard',
        fallbackRoute: '/admin/dashboard',
        name: 'Mi Panel de Salud',
        icon: 'user',
        color: '#27AE60'
      }
    };

    const config = routeConfigs[detectedType] || routeConfigs.patient;
    
    return {
      ...config,
      detectedType,
      confidence,
      shouldRedirect: confidence > 0.5, // Solo redirigir si la confianza es alta
      isHighConfidence: confidence > 0.8,
      isMediumConfidence: confidence > 0.5 && confidence <= 0.8,
      isLowConfidence: confidence <= 0.5
    };
  }

  /**
   * Obtener mensaje de bienvenida personalizado
   * @param {Object} detectionData - Datos de detección
   * @returns {Object} Mensaje de bienvenida
   */
  getWelcomeMessage(detectionData) {
    const detectedType = detectionData?.detection?.detected_type || 'patient';
    const specialty = detectionData?.specialty || '';
    const confidence = detectionData?.detection?.confidence || 0.0;
    
    const messages = {
      doctor: {
        title: `¡Bienvenido, Doctor!`,
        subtitle: specialty ? `Especialidad: ${specialty}` : 'Panel médico',
        description: 'Acceda a sus pacientes, citas y registros médicos'
      },
      nurse: {
        title: `¡Bienvenida, Enfermera!`,
        subtitle: 'Panel de enfermería',
        description: 'Gestione los cuidados de los pacientes y asista a los doctores'
      },
      admin: {
        title: `¡Bienvenido, Administrador!`,
        subtitle: 'Panel de administración',
        description: 'Gestione usuarios, citas y configuraciones del sistema'
      },
      receptionist: {
        title: `¡Bienvenida, Recepcionista!`,
        subtitle: 'Panel de recepción',
        description: 'Gestione citas, pacientes y el calendario de la clínica'
      },
      technician: {
        title: `¡Bienvenido, Técnico!`,
        subtitle: 'Panel técnico',
        description: 'Gestione equipos médicos y resultados de exámenes'
      },
      pharmacist: {
        title: `¡Bienvenido, Farmacéutico!`,
        subtitle: 'Panel de farmacia',
        description: 'Gestione medicamentos, recetas e inventario'
      },
      patient: {
        title: `¡Bienvenido!`,
        subtitle: 'Mi panel de salud',
        description: 'Acceda a sus citas, historial médico y prescripciones'
      }
    };

    const message = messages[detectedType] || messages.patient;
    
    return {
      ...message,
      confidence,
      showConfidenceWarning: confidence < 0.5,
      confidenceMessage: confidence < 0.5 ? 
        'El sistema detectó su tipo de usuario con baja confianza. Puede cambiar la interfaz manualmente.' : 
        null
    };
  }

  /**
   * Validar si el usuario tiene permisos para una acción
   * @param {Object} detectionData - Datos de detección
   * @param {string} action - Acción a validar
   * @returns {boolean} Si tiene permisos
   */
  hasPermission(detectionData, action) {
    const permissions = detectionData?.detection?.permissions || [];
    return permissions.includes(action);
  }

  /**
   * Obtener widgets recomendados para el dashboard
   * @param {Object} detectionData - Datos de detección
   * @returns {Array} Lista de widgets recomendados
   */
  getRecommendedWidgets(detectionData) {
    const widgets = detectionData?.dashboard_config?.widgets || [];
    const detectedType = detectionData?.detection?.detected_type || 'patient';
    
    // Widgets adicionales basados en especialidad para doctores
    if (detectedType === 'doctor' && detectionData?.specialty) {
      const specialty = detectionData.specialty.toLowerCase();
      
      if (specialty.includes('cardiologia')) {
        widgets.push('ecg_monitor', 'heart_rate_trends');
      } else if (specialty.includes('pediatria')) {
        widgets.push('growth_charts', 'vaccination_schedule');
      } else if (specialty.includes('neurologia')) {
        widgets.push('neurological_assessments', 'brain_imaging');
      }
    }
    
    return widgets;
  }

  /**
   * Obtener configuración de tema basada en el tipo de usuario
   * @param {Object} detectionData - Datos de detección
   * @returns {Object} Configuración de tema
   */
  getThemeConfig(detectionData) {
    const detectedType = detectionData?.detection?.detected_type || 'patient';
    const primaryColor = detectionData?.dashboard_config?.primary_color || '#27AE60';
    
    const themeConfigs = {
      doctor: {
        primaryColor,
        secondaryColor: '#5DADE2',
        backgroundColor: '#F8F9FA',
        textColor: '#2C3E50',
        accentColor: '#E74C3C'
      },
      nurse: {
        primaryColor,
        secondaryColor: '#85C1E9',
        backgroundColor: '#F0F8FF',
        textColor: '#2C3E50',
        accentColor: '#4A90E2'
      },
      admin: {
        primaryColor,
        secondaryColor: '#F1948A',
        backgroundColor: '#FDF2F8',
        textColor: '#2C3E50',
        accentColor: '#E74C3C'
      },
      receptionist: {
        primaryColor,
        secondaryColor: '#F7DC6F',
        backgroundColor: '#FFF8DC',
        textColor: '#2C3E50',
        accentColor: '#F39C12'
      },
      patient: {
        primaryColor,
        secondaryColor: '#82E0AA',
        backgroundColor: '#F0FFF0',
        textColor: '#2C3E50',
        accentColor: '#27AE60'
      }
    };

    return themeConfigs[detectedType] || themeConfigs.patient;
  }
}

// Crear instancia singleton
const userDetectionService = new UserDetectionService();

export default userDetectionService;
