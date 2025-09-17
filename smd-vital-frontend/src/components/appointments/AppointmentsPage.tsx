import React, { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { appointmentsService } from '../../services/appointments.service';
import type { Appointment, AppointmentCreate } from '../../types/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import AppointmentCard from './AppointmentCard';
import AppointmentForm from './AppointmentForm';
import AppointmentFilters from './AppointmentFilters';
import AppointmentCalendar from './AppointmentCalendar';

interface AppointmentsPageProps {
  viewMode?: 'list' | 'calendar';
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ viewMode = 'list' }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    appointment_type: '',
    date_from: '',
    date_to: '',
  });
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>(viewMode);

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: 1,
        limit: 50,
        status: filters.status || undefined,
        appointment_type: filters.appointment_type || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      };

      // Si es paciente, solo mostrar sus citas
      if (user?.role === 'patient') {
        params.patient_id = user.id;
      }
      // Si es doctor, solo mostrar sus citas
      if (user?.role === 'doctor') {
        params.professional_id = user.id;
      }

      const response = await appointmentsService.getAppointments(params);
      setAppointments(response.data);
    } catch (err) {
      setError('Error al cargar las citas');
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (data: AppointmentCreate) => {
    try {
      const newAppointment = await appointmentsService.createAppointment(data);
      setAppointments(prev => [newAppointment, ...prev]);
      setShowForm(false);
      toast.success('Cita creada exitosamente');
    } catch (err) {
      toast.error('Error al crear la cita');
    }
  };

  const handleUpdateAppointment = async (id: string, data: Partial<AppointmentCreate>) => {
    try {
      const updatedAppointment = await appointmentsService.updateAppointment(id, data);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      setEditingAppointment(null);
      toast.success('Cita actualizada exitosamente');
    } catch (err) {
      toast.error('Error al actualizar la cita');
    }
  };

  const handleCancelAppointment = async (id: string, reason?: string) => {
    try {
      const cancelledAppointment = await appointmentsService.cancelAppointment(id, reason);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? cancelledAppointment : apt)
      );
      toast.success('Cita cancelada exitosamente');
    } catch (err) {
      toast.error('Error al cancelar la cita');
    }
  };

  const handleConfirmAppointment = async (id: string) => {
    try {
      const confirmedAppointment = await appointmentsService.confirmAppointment(id);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? confirmedAppointment : apt)
      );
      toast.success('Cita confirmada exitosamente');
    } catch (err) {
      toast.error('Error al confirmar la cita');
    }
  };

  const handleCompleteAppointment = async (id: string, notes?: string) => {
    try {
      const completedAppointment = await appointmentsService.completeAppointment(id, notes);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? completedAppointment : apt)
      );
      toast.success('Cita completada exitosamente');
    } catch (err) {
      toast.error('Error al completar la cita');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;
    
    try {
      await appointmentsService.deleteAppointment(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      toast.success('Cita eliminada exitosamente');
    } catch (err) {
      toast.error('Error al eliminar la cita');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra y programa citas médicas
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setCurrentView(currentView === 'list' ? 'calendar' : 'list')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {currentView === 'list' ? 'Vista Calendario' : 'Vista Lista'}
          </button>
          
          {(user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'admin') && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <AppointmentFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Citas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Programadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(apt => apt.status === 'scheduled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Confirmadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(apt => apt.status === 'confirmed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Canceladas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(apt => apt.status === 'cancelled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'list' ? (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.role === 'patient' 
                  ? 'No tienes citas programadas.' 
                  : 'No hay citas programadas.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={setEditingAppointment}
                  onCancel={handleCancelAppointment}
                  onConfirm={handleConfirmAppointment}
                  onComplete={handleCompleteAppointment}
                  onDelete={handleDeleteAppointment}
                  userRole={user?.role}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          onAppointmentClick={setEditingAppointment}
        />
      )}

      {/* Forms */}
      {showForm && (
        <AppointmentForm
          appointment={null}
          onSave={handleCreateAppointment}
          onCancel={() => setShowForm(false)}
          userRole={user?.role}
        />
      )}

      {editingAppointment && (
        <AppointmentForm
          appointment={editingAppointment}
          onSave={(data) => handleUpdateAppointment(editingAppointment.id, data)}
          onCancel={() => setEditingAppointment(null)}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
