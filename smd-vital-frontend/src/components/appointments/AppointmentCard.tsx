import React from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { Appointment } from '../../types/api';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onCancel: (id: string, reason?: string) => void;
  onConfirm: (id: string) => void;
  onComplete: (id: string, notes?: string) => void;
  onDelete: (id: string) => void;
  userRole?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onCancel,
  onConfirm,
  onComplete,
  onDelete,
  userRole
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'No asistió';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'follow_up': return 'Seguimiento';
      case 'emergency': return 'Emergencia';
      case 'routine': return 'Rutina';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const canEdit = userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin';
  const canCancel = (appointment.status === 'scheduled' || appointment.status === 'confirmed') && (userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin');
  const canConfirm = appointment.status === 'scheduled' && (userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin');
  const canComplete = appointment.status === 'confirmed' && (userRole === 'doctor' || userRole === 'nurse' || userRole === 'admin');

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {getTypeText(appointment.appointment_type)}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(appointment.appointment_date)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formatTime(appointment.appointment_time)} - {appointment.duration_minutes} min
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {appointment.patient_name || 'Paciente'}
                </span>
              </div>

              {appointment.doctor_name && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Dr. {appointment.doctor_name}
                  </span>
                </div>
              )}

              {appointment.location && (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 text-gray-400">📍</div>
                  <span className="text-sm text-gray-600">
                    {appointment.location}
                  </span>
                </div>
              )}
            </div>

            {appointment.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notas:</span> {appointment.notes}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
              
              {appointment.appointment_type === 'emergency' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  Emergencia
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {canEdit && (
              <button
                onClick={() => onEdit(appointment)}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Editar cita"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}

            {canConfirm && (
              <button
                onClick={() => onConfirm(appointment.id)}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                title="Confirmar cita"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            )}

            {canComplete && (
              <button
                onClick={() => {
                  const notes = prompt('Notas de la consulta (opcional):');
                  onComplete(appointment.id, notes || undefined);
                }}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Completar cita"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => {
                  const reason = prompt('Motivo de cancelación (opcional):');
                  onCancel(appointment.id, reason || undefined);
                }}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                title="Cancelar cita"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => onDelete(appointment.id)}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Eliminar cita"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;

