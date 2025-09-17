import React, { useState } from 'react';

interface Appointment {
  id: string;
  title: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  patient?: string;
  doctor?: string;
}

interface CalendarDay {
  date: Date;
  appointments: Appointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const AppointmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Datos de ejemplo de citas
  const appointments: Appointment[] = [
    {
      id: '1',
      title: 'Consulta General',
      time: '09:00',
      type: 'Consulta',
      status: 'confirmed',
      patient: 'María González',
      doctor: 'Dr. Juan Médico'
    },
    {
      id: '2',
      title: 'Seguimiento',
      time: '10:30',
      type: 'Seguimiento',
      status: 'pending',
      patient: 'Carlos López',
      doctor: 'Dra. Ana Cardióloga'
    },
    {
      id: '3',
      title: 'Revisión',
      time: '14:00',
      type: 'Revisión',
      status: 'confirmed',
      patient: 'Ana Martínez',
      doctor: 'Dr. Carlos Dermatólogo'
    },
    {
      id: '4',
      title: 'Toma de Signos',
      time: '11:15',
      type: 'Procedimiento',
      status: 'completed',
      patient: 'José Rodríguez',
      doctor: 'Enf. Laura Pérez'
    }
  ];

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date();
        // Simulamos que las citas están en diferentes días
        appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 7));
        return appointmentDate.toDateString() === currentDay.toDateString();
      });

      days.push({
        date: currentDay,
        appointments: dayAppointments,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString()
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  const days = getDaysInMonth(currentDate);
  const selectedDayAppointments = selectedDate 
    ? appointments.filter(appointment => {
        const appointmentDate = new Date();
        appointmentDate.setDate(selectedDate.getDate());
        return appointmentDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Calendario de Citas</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {formatDate(currentDate)}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`p-2 min-h-[80px] border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${day.isToday ? 'bg-blue-50 border-blue-300' : ''} ${
                selectedDate?.toDateString() === day.date.toDateString() 
                  ? 'bg-blue-100 border-blue-400' 
                  : ''
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {day.appointments.slice(0, 2).map(appointment => (
                  <div
                    key={appointment.id}
                    className={`text-xs px-2 py-1 rounded truncate ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.time} - {appointment.title}
                  </div>
                ))}
                {day.appointments.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{day.appointments.length - 2} más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Date Appointments */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Citas del {selectedDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            {selectedDayAppointments.length === 0 ? (
              <p className="text-gray-500">No hay citas programadas para este día</p>
            ) : (
              <div className="space-y-3">
                {selectedDayAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.time} - {appointment.patient || appointment.doctor}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' :
                       appointment.status === 'pending' ? 'Pendiente' :
                       appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
