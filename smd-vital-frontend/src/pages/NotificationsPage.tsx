import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  category: 'appointment' | 'payment' | 'medical' | 'system' | 'reminder';
}

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Datos de ejemplo
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nueva cita programada',
      message: 'Tienes una cita con el Dr. Juan Médico mañana a las 10:00 AM',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      category: 'appointment'
    },
    {
      id: '2',
      title: 'Pago confirmado',
      message: 'Tu pago de $150.000 ha sido procesado exitosamente',
      type: 'success',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      category: 'payment'
    },
    {
      id: '3',
      title: 'Recordatorio de medicamento',
      message: 'No olvides tomar tu medicamento a las 8:00 PM',
      type: 'warning',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      category: 'reminder'
    },
    {
      id: '4',
      title: 'Expediente actualizado',
      message: 'Tu expediente médico ha sido actualizado con los nuevos resultados',
      type: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      category: 'medical'
    },
    {
      id: '5',
      title: 'Mantenimiento programado',
      message: 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      category: 'system'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment': return '📅';
      case 'payment': return '💳';
      case 'medical': return '🏥';
      case 'system': return '⚙️';
      case 'reminder': return '⏰';
      default: return '📢';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'appointment': return 'Citas';
      case 'payment': return 'Pagos';
      case 'medical': return 'Médico';
      case 'system': return 'Sistema';
      case 'reminder': return 'Recordatorios';
      default: return category;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} día${days > 1 ? 's' : ''} atrás`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else {
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);
    
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
              : 'No tienes notificaciones pendientes'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'unread', label: 'No leídas' },
              { value: 'read', label: 'Leídas' }
            ].map(filterOption => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === filterOption.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Todas las categorías' },
              { value: 'appointment', label: 'Citas' },
              { value: 'payment', label: 'Pagos' },
              { value: 'medical', label: 'Médico' },
              { value: 'system', label: 'Sistema' },
              { value: 'reminder', label: 'Recordatorios' }
            ].map(categoryOption => (
              <button
                key={categoryOption.value}
                onClick={() => setCategoryFilter(categoryOption.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  categoryFilter === categoryOption.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'No tienes notificaciones sin leer'
                : 'No hay notificaciones que coincidan con los filtros seleccionados'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow border-l-4 p-6 transition-all hover:shadow-lg ${
                !notification.read ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-300'
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`text-lg font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span>{getCategoryIcon(notification.category)}</span>
                        <span>{getCategoryLabel(notification.category)}</span>
                      </span>
                      <span>•</span>
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Marcar como leída
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};