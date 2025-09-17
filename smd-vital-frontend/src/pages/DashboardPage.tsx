import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRolePermissions } from '../hooks/useRolePermissions';
import { PatientDashboard } from '../components/dashboard/PatientDashboard';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';
import { NurseDashboard } from '../components/dashboard/NurseDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();

  // Debug: Log user data
  console.log('DashboardPage - User data:', user);
  
  // Show error if user data is incorrect
  if (user && (user.first_name === 'Usuario' && user.last_name === 'Temporal')) {
    console.error('❌ Backend está devolviendo datos incorrectos para usuarios registrados');
  }

  // Renderizar dashboard específico según el rol
  if (isPatient) {
    return <PatientDashboard />;
  }

  if (isDoctor) {
    return <DoctorDashboard />;
  }

  if (isNurse) {
    return <NurseDashboard />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Fallback para roles no reconocidos
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {user?.first_name || 'Usuario'}. Tu rol ({user?.role}) no tiene un dashboard específico configurado.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Nota:</strong> Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};