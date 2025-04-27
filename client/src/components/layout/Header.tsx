import React from 'react';
import { Link, useLocation } from 'wouter';
import { useNotifications } from '@/lib/context/NotificationContext';

const Header: React.FC = () => {
  const { unreadCount, toggleNotificationsPanel } = useNotifications();
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary-500 cursor-pointer">FindUsed</h1>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <div className="relative">
              <button 
                className="p-2 text-gray-500 hover:text-primary-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={toggleNotificationsPanel}
              >
                <i className="fas fa-bell text-xl"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
                <span className="text-sm font-medium text-gray-700">Guest</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <i className="fas fa-user"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
