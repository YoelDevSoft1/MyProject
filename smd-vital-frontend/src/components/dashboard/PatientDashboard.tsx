import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { useDashboard, useUpcomingAppointments, useNotifications } from '../../hooks';
import { Calendar, FileText, CreditCard, Bell, User, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { canViewAppointments, canViewMedicalRecords, canViewPayments, canViewNotifications } = useRolePermissions();

  // Hooks para datos reales
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboard('month');
  const { data: upcomingAppointments, loading: appointmentsLoading } = useUpcomingAppointments(3);
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
      title: 'Próxima Cita',
      value: dashboardData.stats.next_appointment?.date || 'Sin citas',
      subtitle: dashboardData.stats.next_appointment?.doctor_name || 'No programada',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Expedientes',
      value: dashboardData.stats.total_medical_records?.toString() || '0',
      subtitle: 'Expedientes médicos',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pagos Pendientes',
      value: `$${dashboardData.stats.pending_payments || 0}`,
      subtitle: dashboardData.stats.pending_payments > 0 ? 'Pendientes' : 'Todo al día',
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Notificaciones',
      value: notifications?.filter(n => !n.is_read).length?.toString() || '0',
      subtitle: 'Sin leer',
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ] : [];

  // Usar datos reales de citas próximas
  const recentAppointments = upcomingAppointments || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {user?.first_name || 'Usuario'}!
        </h1>
        <p className="text-blue-100">
          Aquí tienes un resumen de tu información médica y próximas citas.
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

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
          <p className="text-sm text-gray-600">Tus citas médicas programadas</p>
        </div>
        <div className="p-6">
          {recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.date} a las {appointment.time}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.doctor} - {appointment.specialty}
                      </p>
                      <p className="text-xs text-gray-500">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tienes citas programadas</p>
            </div>
          )}
        </div>
      </div>

      {/* Notificaciones Recientes */}
      {canViewNotifications && notifications && notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones Recientes</h2>
            <p className="text-sm text-gray-600">Tus últimas notificaciones</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {notifications.slice(0, 3).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start p-4 rounded-lg border ${
                    notification.is_read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <Bell className={`w-5 h-5 mt-0.5 ${
                    notification.is_read ? 'text-gray-400' : 'text-blue-600'
                  }`} />
                  <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${
                      notification.is_read ? 'text-gray-900' : 'text-blue-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm ${
                      notification.is_read ? 'text-gray-600' : 'text-blue-700'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
          <p className="text-sm text-gray-600">Accede a las funciones más utilizadas</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {canViewAppointments && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Nueva Cita</span>
              </button>
            )}
            {canViewMedicalRecords && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                <FileText className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Ver Expedientes</span>
              </button>
            )}
            {canViewPayments && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors">
                <CreditCard className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Pagos</span>
              </button>
            )}
            {canViewNotifications && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <Bell className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Notificaciones</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
