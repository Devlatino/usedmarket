import React, { useRef, useEffect } from 'react';
import { useNotifications } from '@/lib/context/NotificationContext';
import { getRelativeTime } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NotificationsPanel: React.FC = () => {
  const { 
    notifications, 
    isNotificationsPanelOpen, 
    toggleNotificationsPanel,
    markAsRead,
    markAllAsRead
  } = useNotifications();
  
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNotificationsPanelOpen && 
          panelRef.current && 
          !panelRef.current.contains(event.target as Node) &&
          !(event.target as Element).closest('button')?.classList.contains('p-2')) {
        toggleNotificationsPanel();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsPanelOpen, toggleNotificationsPanel]);
  
  // Add overflow hidden to body when panel is open
  useEffect(() => {
    if (isNotificationsPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNotificationsPanelOpen]);
  
  if (!isNotificationsPanelOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40">
      <div 
        ref={panelRef}
        className={cn(
          "fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl z-50 transform transition-all duration-300",
          isNotificationsPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium">Notifiche</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleNotificationsPanel}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <i className="fas fa-bell-slash text-4xl mb-4"></i>
                <p>Nessuna notifica</p>
                <p className="text-sm mt-2">Salva una ricerca per ricevere notifiche su nuovi annunci</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "mb-4 p-3 rounded-lg border-l-4",
                    notification.read 
                      ? "bg-gray-50 border-gray-300" 
                      : "bg-blue-50 border-primary-500"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={cn(
                      "font-medium",
                      notification.read ? "text-gray-800" : "text-primary-800"
                    )}>
                      {notification.type === "new_listing" ? "Nuovo annuncio trovato" : "Avviso di riduzione prezzo"}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {getRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <a 
                      href="#" 
                      className="text-sm text-primary-600 hover:text-primary-800"
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real app, this would navigate to the specific listing
                        markAsRead(notification.id);
                      }}
                    >
                      Vedi dettagli
                    </a>
                    {!notification.read && (
                      <button 
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Chiudi
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-4 border-t">
              <Button 
                variant="outline"
                className="w-full"
                onClick={markAllAsRead}
              >
                Cancella tutte le notifiche
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
