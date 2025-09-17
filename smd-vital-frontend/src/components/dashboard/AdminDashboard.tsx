import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { useDashboard, useSystemAlerts, useNotifications } from '../../hooks';
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
  Database,
  Loader2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    canManageUsers, 
    canViewReports, 
    canManageSystem,
    canViewAllAppointments,
    canViewAllMedicalRecords,
    canViewAllPayments
  } = useRolePermissions();

  // Hooks para datos reales
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboard('month');
  const { data: systemAlertsData, loading: alertsLoading } = useSystemAlerts();
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
        <AlertTriangle className="w-8 h-8 text-red-500" />
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
      title: 'Usuarios Totales',
      value: dashboardData.stats.total_users?.toString() || '0',
      subtitle: `+${dashboardData.stats.user_growth_rate || 0}% este mes`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up',
    },
    {
      title: 'Citas del Mes',
      value: dashboardData.stats.total_appointments?.toString() || '0',
      subtitle: `+${dashboardData.stats.appointment_growth_rate || 0}% vs mes anterior`,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up',
    },
    {
      title: 'Ingresos Totales',
      value: `$${dashboardData.stats.total_revenue || 0}`,
      subtitle: `+${dashboardData.stats.revenue_growth_rate || 0}% este mes`,
      icon: CreditCard,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: 'up',
    },
    {
      title: 'Expedientes',
      value: dashboardData.stats.total_medical_records?.toString() || '0',
      subtitle: `${dashboardData.stats.pending_medical_records || 0} pendientes`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'stable',
    },
  ] : [];

  // Usar datos reales de alertas del sistema
  const systemAlerts = systemAlertsData || [];

  // Usar datos reales de usuarios recientes
  const recentUsers = dashboardData?.stats.recent_users || [];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'doctor':
        return 'Doctor';
      case 'nurse':
        return 'Enfermera';
      case 'patient':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Panel de Administración - {user?.first_name || 'Administrador'}
        </h1>
        <p className="text-purple-100">
          Gestiona el sistema completo, usuarios, reportes y configuraciones.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
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
              {stat.trend === 'up' && (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h2>
            <p className="text-sm text-gray-600">Monitoreo en tiempo real</p>
          </div>
          <div className="p-6">
            {systemAlerts.length > 0 ? (
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className={`flex items-start p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                    <div className="flex-shrink-0 mr-3">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay alertas del sistema</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios Recientes</h2>
            <p className="text-sm text-gray-600">Actividad de usuarios del sistema</p>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">{getRoleText(user.role)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{user.lastLogin}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay usuarios recientes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Acciones de Administración</h2>
          <p className="text-sm text-gray-600">Herramientas de gestión del sistema</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {canManageUsers && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Gestionar Usuarios</span>
              </button>
            )}
            {canViewReports && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                <BarChart3 className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Reportes</span>
              </button>
            )}
            {canManageSystem && (
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <Settings className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Configuración</span>
              </button>
            )}
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
              <Database className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Base de Datos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
