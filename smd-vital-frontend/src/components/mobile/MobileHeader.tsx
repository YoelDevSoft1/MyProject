import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  showBack?: boolean;
  onBackClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuClick,
  showBack = false,
  onBackClick
}) => {
  const { user } = useAuth();

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        {showBack && (
          <button
            onClick={onBackClick}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {user && (
            <p className="text-xs text-gray-500">
              {user.first_name} {user.last_name} • {user.role}
            </p>
          )}
        </div>
      </div>
      
      <button
        onClick={onMenuClick}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
};
