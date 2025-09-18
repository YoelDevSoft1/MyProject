// SMD VITAL - Dashboard Service
// Servicio para gestión de dashboards contextuales basado en detección de usuarios

import apiService from './apiService';
import userDetectionService from './userDetectionService';

class DashboardService {
  constructor() {
    this.apiService = apiService;
    this.userDetectionService = userDetectionService;
  }

  /**
   * Obtener datos del dashboard contextual basado en el tipo de usuario
   * @param {string} token - Token de autenticación
   * @param {Object} userDetection - Datos de detección del usuario
   * @param {Object} context - Contexto adicional (fecha, filtros, etc.)
   * @returns {Promise<Object>} Datos del dashboard
   */
  async getContextualDashboard(token, userDetection, context = {}) {
    try {
      const detectedType = userDetection?.detection?.detected_type || 'patient';
      const userId = userDetection?.user_id;
      
      if (!userId) {
        throw new Error('User ID no disponible para el dashboard');
      }

      // Obtener datos base según el tipo de usuario
      const dashboardData = await this._getBaseDashboardData(token, detectedType, userId, context);
      
      // Aplicar personalización según detección
      const personalizedData = await this._personalizeDashboardData(
        dashboardData, 
        userDetection, 
        context
      );

      return {
        success: true,
        data: personalizedData
      };
    } catch (error) {
      console.error('Error getting contextual dashboard:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener datos del dashboard'
      };
    }
  }

  /**
   * Obtener datos base del dashboard según el tipo de usuario
   */
  async _getBaseDashboardData(token, userType, userId, context) {
    const baseData = {
      user_id: userId,
      user_type: userType,
      timestamp: new Date().toISOString(),
      widgets: [],
      stats: {},
      appointments: [],
      notifications: [],
      quick_actions: []
    };

    try {
      // Obtener citas según el tipo de usuario
      const appointmentsParams = this._getAppointmentsParams(userType, userId, context);
      const appointmentsResponse = await apiService.getAppointments(token, appointmentsParams);
      
      if (appointmentsResponse.success) {
        baseData.appointments = appointmentsResponse.data.appointments || [];
      }

      // Obtener estadísticas
      const statsResponse = await apiService.getAppointmentStats(token);
      if (statsResponse.success) {
        baseData.stats = statsResponse.data;
      }

      // Obtener notificaciones
      const notificationsResponse = await apiService.getUserNotifications(token);
      if (notificationsResponse.success) {
        baseData.notifications = notificationsResponse.data.notifications || [];
      }

      // Configurar widgets y acciones según el tipo de usuario
      baseData.widgets = this._getWidgetsForUserType(userType, baseData);
      baseData.quick_actions = this._getQuickActionsForUserType(userType);

    } catch (error) {
      console.error('Error getting base dashboard data:', error);
      // Continuar con datos por defecto en caso de error
    }

    return baseData;
  }

  /**
   * Personalizar datos del dashboard según la detección del usuario
   */
  async _personalizeDashboardData(baseData, userDetection, context) {
    const detectedType = userDetection?.detection?.detected_type;
    const specialty = userDetection?.specialty;
    const confidence = userDetection?.detection?.confidence || 0;

    // Aplicar personalización por especialidad si es doctor
    if (detectedType === 'doctor' && specialty) {
      baseData = this._applySpecialtyPersonalization(baseData, specialty);
    }

    // Aplicar personalización por confianza de detección
    if (confidence < 0.7) {
      baseData.show_detection_warning = true;
      baseData.detection_confidence = confidence;
    }

    // Aplicar configuración de tema
    const themeConfig = userDetectionService.getThemeConfig(userDetection);
    baseData.theme = themeConfig;

    // Aplicar configuración de dashboard
    const dashboardConfig = userDetectionService.getUserDashboardConfig(
      detectedType, 
      specialty
    );
    baseData.dashboard_config = dashboardConfig;

    return baseData;
  }

  /**
   * Obtener parámetros de citas según el tipo de usuario
   */
  _getAppointmentsParams(userType, userId, context) {
    const baseParams = {
      limit: 20,
      skip: 0
    };

    switch (userType) {
      case 'patient':
        return {
          ...baseParams,
          patient_id: userId,
          status: 'CONFIRMED,PENDING',
          start_date: new Date().toISOString().split('T')[0] // Hoy en adelante
        };
      
      case 'doctor':
        return {
          ...baseParams,
          professional_id: userId,
          status: 'CONFIRMED,PENDING,IN_PROGRESS',
          start_date: new Date().toISOString().split('T')[0]
        };
      
      case 'nurse':
        return {
          ...baseParams,
          professional_id: userId,
          status: 'CONFIRMED,PENDING,IN_PROGRESS',
          start_date: new Date().toISOString().split('T')[0]
        };
      
      case 'admin':
        return {
          ...baseParams,
          status: 'PENDING,CONFIRMED',
          start_date: new Date().toISOString().split('T')[0]
        };
      
      default:
        return baseParams;
    }
  }

  /**
   * Obtener widgets recomendados según el tipo de usuario
   */
  _getWidgetsForUserType(userType, data) {
    const widgetConfigs = {
      patient: [
        {
          id: 'upcoming_appointments',
          title: 'Próximas Citas',
          type: 'appointments_list',
          data: data.appointments.filter(apt => 
            new Date(apt.scheduled_date) >= new Date() && 
            ['CONFIRMED', 'PENDING'].includes(apt.status)
          ),
          priority: 1
        },
        {
          id: 'quick_book',
          title: 'Agendar Cita',
          type: 'action_card',
          action: 'book_appointment',
          priority: 2
        },
        {
          id: 'recent_medical_records',
          title: 'Últimos Expedientes',
          type: 'medical_records_preview',
          data: [],
          priority: 3
        }
      ],
      doctor: [
        {
          id: 'today_schedule',
          title: 'Agenda de Hoy',
          type: 'appointments_timeline',
          data: data.appointments.filter(apt => {
            const aptDate = new Date(apt.scheduled_date);
            const today = new Date();
            return aptDate.toDateString() === today.toDateString();
          }),
          priority: 1
        },
        {
          id: 'patient_queue',
          title: 'Cola de Pacientes',
          type: 'patient_queue',
          data: data.appointments.filter(apt => apt.status === 'IN_PROGRESS'),
          priority: 2
        },
        {
          id: 'appointment_stats',
          title: 'Estadísticas del Día',
          type: 'stats_cards',
          data: data.stats,
          priority: 3
        }
      ],
      nurse: [
        {
          id: 'assigned_patients',
          title: 'Pacientes Asignados',
          type: 'patient_list',
          data: data.appointments,
          priority: 1
        },
        {
          id: 'vital_signs_tasks',
          title: 'Tareas de Signos Vitales',
          type: 'task_list',
          data: [],
          priority: 2
        }
      ],
      admin: [
        {
          id: 'system_overview',
          title: 'Resumen del Sistema',
          type: 'system_stats',
          data: data.stats,
          priority: 1
        },
        {
          id: 'pending_approvals',
          title: 'Aprobaciones Pendientes',
          type: 'approval_queue',
          data: [],
          priority: 2
        },
        {
          id: 'recent_appointments',
          title: 'Citas Recientes',
          type: 'appointments_table',
          data: data.appointments,
          priority: 3
        }
      ]
    };

    return widgetConfigs[userType] || widgetConfigs.patient;
  }

  /**
   * Obtener acciones rápidas según el tipo de usuario
   */
  _getQuickActionsForUserType(userType) {
    const actions = {
      patient: [
        { id: 'book_appointment', label: 'Agendar Cita', icon: 'MdAdd', color: 'blue' },
        { id: 'view_medical_records', label: 'Ver Expedientes', icon: 'MdFileCopy', color: 'green' },
        { id: 'view_prescriptions', label: 'Ver Recetas', icon: 'MdLocalPharmacy', color: 'purple' }
      ],
      doctor: [
        { id: 'start_appointment', label: 'Iniciar Cita', icon: 'MdPlayArrow', color: 'green' },
        { id: 'view_patients', label: 'Ver Pacientes', icon: 'MdPeople', color: 'blue' },
        { id: 'create_prescription', label: 'Crear Receta', icon: 'MdLocalPharmacy', color: 'purple' }
      ],
      nurse: [
        { id: 'take_vitals', label: 'Tomar Signos Vitales', icon: 'MdFavorite', color: 'red' },
        { id: 'update_patient', label: 'Actualizar Paciente', icon: 'MdEdit', color: 'blue' },
        { id: 'assist_doctor', label: 'Asistir Doctor', icon: 'MdSupport', color: 'green' }
      ],
      admin: [
        { id: 'manage_users', label: 'Gestionar Usuarios', icon: 'MdPeople', color: 'blue' },
        { id: 'view_reports', label: 'Ver Reportes', icon: 'MdBarChart', color: 'green' },
        { id: 'system_settings', label: 'Configuración', icon: 'MdSettings', color: 'gray' }
      ]
    };

    return actions[userType] || actions.patient;
  }

  /**
   * Aplicar personalización por especialidad médica
   */
  _applySpecialtyPersonalization(data, specialty) {
    const specialtyLower = specialty.toLowerCase();
    
    // Widgets adicionales por especialidad
    const specialtyWidgets = {
      'cardiologia': [
        {
          id: 'ecg_monitor',
          title: 'Monitor ECG',
          type: 'ecg_widget',
          data: [],
          priority: 2
        },
        {
          id: 'heart_rate_trends',
          title: 'Tendencias Cardíacas',
          type: 'chart_widget',
          data: [],
          priority: 3
        }
      ],
      'pediatria': [
        {
          id: 'growth_charts',
          title: 'Gráficos de Crecimiento',
          type: 'growth_chart',
          data: [],
          priority: 2
        },
        {
          id: 'vaccination_schedule',
          title: 'Cronograma de Vacunas',
          type: 'vaccination_widget',
          data: [],
          priority: 3
        }
      ],
      'neurologia': [
        {
          id: 'neurological_assessments',
          title: 'Evaluaciones Neurológicas',
          type: 'assessment_widget',
          data: [],
          priority: 2
        }
      ]
    };

    const additionalWidgets = specialtyWidgets[specialtyLower] || [];
    data.widgets = [...data.widgets, ...additionalWidgets];

    return data;
  }

  /**
   * Invalidar caché del dashboard
   */
  async invalidateDashboardCache(userId, userType) {
    try {
      // Aquí se implementaría la lógica de invalidación de caché
      // Por ahora, simplemente logueamos la acción
      console.log(`Invalidating dashboard cache for user ${userId} (${userType})`);
      return { success: true };
    } catch (error) {
      console.error('Error invalidating dashboard cache:', error);
      return { success: false, error: error.message };
    }
  }
}

// Crear instancia singleton
const dashboardService = new DashboardService();

export default dashboardService;
