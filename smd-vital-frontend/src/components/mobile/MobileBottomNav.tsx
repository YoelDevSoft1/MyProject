import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRolePermissions } from '../../hooks/useRolePermissions';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getNavigation } = useRolePermissions();

  // Obtener navegación filtrada por permisos
  const navigationItems = getNavigation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // Limitar a 5 elementos para la navegación móvil
  const limitedItems = navigationItems.slice(0, 5);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className={`grid h-16 ${limitedItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
        {limitedItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.href)}
            className={`flex flex-col items-center justify-center space-y-1 ${
              isActive(item.href)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
