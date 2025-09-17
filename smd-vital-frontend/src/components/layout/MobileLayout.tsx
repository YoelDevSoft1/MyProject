import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MobileHeader } from '../mobile/MobileHeader';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showBack = false,
  onBackClick
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="lg:hidden min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader
        title={title}
        onMenuClick={handleMenuClick}
        showBack={showBack}
        onBackClick={onBackClick}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">SMD Vital</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              {user && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                </div>
              )}

              <nav className="space-y-2">
                <a
                  href="/dashboard"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-lg">📊</span>
                  <span>Dashboard</span>
                </a>
                <a
                  href="/appointments"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-lg">📅</span>
                  <span>Citas</span>
                </a>
                <a
                  href="/medical-records"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-lg">📋</span>
                  <span>Expedientes</span>
                </a>
                {(user?.role === 'doctor' || user?.role === 'nurse') && (
                  <>
                    <a
                      href="/medical-advanced"
                      className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <span className="text-lg">🏥</span>
                      <span>Funcionalidades Avanzadas</span>
                    </a>
                    <a
                      href="/ai"
                      className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <span className="text-lg">🤖</span>
                      <span>Inteligencia Artificial</span>
                    </a>
                  </>
                )}
                <a
                  href="/notifications"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-lg">🔔</span>
                  <span>Notificaciones</span>
                </a>
                <a
                  href="/profile"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-lg">👤</span>
                  <span>Perfil</span>
                </a>
                {user?.role === 'admin' && (
                  <a
                    href="/admin"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="text-lg">⚙️</span>
                    <span>Administración</span>
                  </a>
                )}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <span className="text-lg">🚪</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};
