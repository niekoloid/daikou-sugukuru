'use client';

import { User, UserType } from '@/types';

interface HeaderProps {
  user?: User;
  onLogout?: () => void;
}

const getUserTypeLabel = (type: UserType): string => {
  switch (type) {
    case 'customer':
      return 'お客様';
    case 'driver':
      return '代行業者';
    case 'restaurant':
      return '飲食店';
    default:
      return '';
  }
};

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-mobile mx-auto">
        <div className="flex items-center space-x-2 md:space-x-3">
          <h1 className="text-lg md:text-xl font-bold text-primary-600 truncate">
            代行すぐ来る
          </h1>
          {user && (
            <span className="text-xs md:text-sm text-gray-500 hidden xs:inline">
              {getUserTypeLabel(user.type)}
            </span>
          )}
        </div>
        
        {user && (
          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-20 md:max-w-none">
              {user.name}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs md:text-sm text-gray-500 hover:text-gray-700 touch-manipulation px-2 py-1 rounded"
              >
                ログアウト
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}