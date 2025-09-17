import React, { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'appointment' | 'medication' | 'test_result' | 'system' | 'patient';
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: Date;
}

interface AlertSystemProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onAction: (alertId: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  alerts,
  onMarkAsRead,
  onDismiss,
  onAction
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'action_required'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority'>('timestamp');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment': return '📅';
      case 'medication': return '💊';
      case 'test_result': return '🧪';
      case 'system': return '⚙️';
      case 'patient': return '👤';
      default: return '📢';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread': return !alert.isRead;
      case 'critical': return alert.priority === 'critical';
      case 'action_required': return alert.actionRequired;
      default: return true;
    }
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.priority === 'critical').length;
  const actionRequiredCount = alerts.filter(alert => alert.actionRequired).length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sistema de Alertas</h2>
          <div className="flex space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {criticalCount} Críticas
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {unreadCount} No leídas
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {actionRequiredCount} Requieren acción
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No leídas
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'critical' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Críticas
            </button>
            <button
              onClick={() => setFilter('action_required')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'action_required' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Requieren acción
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'priority')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="timestamp">Fecha</option>
              <option value="priority">Prioridad</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🔔</div>
            <p className="text-gray-500">No hay alertas para mostrar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.isRead ? 'bg-gray-50' : 'bg-white'
                } ${
                  alert.priority === 'critical' ? 'border-red-200' :
                  alert.priority === 'high' ? 'border-orange-200' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">
                      {getTypeIcon(alert.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-medium ${
                          alert.isRead ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {alert.title}
                        </h3>
                        <span className="text-lg">
                          {getCategoryIcon(alert.category)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                        {alert.actionRequired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ACCIÓN REQUERIDA
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className={`mt-1 text-sm ${
                      alert.isRead ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {alert.message}
                    </p>

                    {alert.expiresAt && (
                      <p className="mt-1 text-xs text-gray-500">
                        Expira: {new Date(alert.expiresAt).toLocaleString()}
                      </p>
                    )}

                    <div className="mt-3 flex space-x-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Marcar como leída
                        </button>
                      )}
                      {alert.actionRequired && alert.actionUrl && (
                        <button
                          onClick={() => onAction(alert.id)}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          Ver detalles
                        </button>
                      )}
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
