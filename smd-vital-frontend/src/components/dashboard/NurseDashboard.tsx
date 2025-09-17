import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { useDashboard, useTodayAppointments, useNotifications } from '../../hooks';
import { 
  Calendar, 
  FileText, 
  Users, 
  Stethoscope, 
  Brain, 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Heart,
  Thermometer,
  Syringe,
  Loader2
} from 'lucide-react';

export const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    canViewAppointments, 
    canViewMedicalRecords, 
    canViewAITools, 
    canViewNotifications,
    canEditMedicalRecords
  } = useRolePermissions();

  // Hooks para datos reales
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboard('month');
  const { data: todayAppointmentsData, loading: appointmentsLoading } = useTodayAppointments();
  const { data: notifications, loading: notificationsLoading, markAsRead } = useNotifications(5);

  // Mostrar loading si están cargando los datos principales
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  // Mostrar error si hay un problema
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div className="ml-2">
          <p className="text-red-600 font-medium">Error al cargar dashboard</p>
          <p className="text-gray-600 text-sm">{dashboardError}</p>
          <button 
            onClick={refreshDashboard}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Datos del dashboard
  const stats = dashboardData ? [
    {
      title: 'Citas Asignadas',
      value: dashboardData.stats.today_tasks?.length?.toString() || '0',
      subtitle: `${dashboardData.stats.completed_tasks || 0} completadas hoy`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pacientes Atendidos',
      value: dashboardData.stats.total_patients?.toString() || '0',
      subtitle: 'Últimos 7 días',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Expedientes Actualizados',
      value: dashboardData.stats.pending_medical_records?.toString() || '0',
      subtitle: 'Pendientes de revisión',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Signos Vitales',
      value: dashboardData.stats.vital_signs_recorded?.toString() || '0',
      subtitle: 'Registrados hoy',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ] : [];

  // Usar datos reales de tareas de hoy
  const todayTasks = dashboardData?.stats.today_tasks || [];

  // Usar datos reales de signos vitales
  const vitalSigns = dashboardData?.stats.vital_signs || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En Progreso';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVitalStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVitalStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Atención';
      case 'critical':
        return 'Crítico';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Panel de Enfermería - {user?.first_name || 'Enfermera'}
        </h1>
        <p className="text-pink-100">
          Gestiona las tareas de enfermería, signos vitales y atención a pacientes.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tareas de Hoy</h2>
            <p className="text-sm text-gray-600">Lista de tareas asignadas</p>
          </div>
          <div className="p-6">
            {todayTasks.length > 0 ? (
              <div className="space-y-4">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(task.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {task.time} - {task.patient}
                        </p>
                        <p className="text-sm text-gray-600">
                          {task.age} años - {task.task}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'urgent' ? 'Urgente' : 
                         task.priority === 'high' ? 'Alta' : 'Normal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay tareas asignadas para hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Signos Vitales</h2>
            <p className="text-sm text-gray-600">Últimos registros de signos vitales</p>
          </div>
          <div className="p-6">
            {vitalSigns.length > 0 ? (
              <div className="space-y-4">
                {vitalSigns.map((vital) => (
                  <div key={vital.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{vital.patient}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVitalStatusColor(vital.status)}`}>
                        {getVitalStatusText(vital.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Thermometer className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-gray-600">Temp: {vital.temperature}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-gray-600">FC: {vital.heartRate}</span>
                      </div>
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600">PA: {vital.bloodPressure}</span>
                      </div>
                      <div className="flex items-center">
                        <Syringe className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-gray-600">O2: {vital.oxygen}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{vital.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay signos vitales registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Acciones de Enfermería</h2>
          <p className="text-sm text-gray-600">Herramientas y funcionalidades de enfermería</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {canViewAppointments && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Ver Citas</span>
              </button>
            )}
            {canEditMedicalRecords && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                <FileText className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Actualizar Expedientes</span>
              </button>
            )}
            {canViewAITools && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <Brain className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">IA Médica</span>
              </button>
            )}
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
              <Stethoscope className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Funciones Avanzadas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
