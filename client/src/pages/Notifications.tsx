import React from 'react';
import { useLocation } from 'wouter';
import TabNavigation from '@/components/ui/TabNavigation';
import { useNotifications } from '@/lib/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getRelativeTime } from '@/lib/types';
import { cn } from '@/lib/utils';

const Notifications: React.FC = () => {
  const [, setLocation] = useLocation();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Notifications</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TabNavigation />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Le tue notifiche</h2>
        {notifications.length > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <i className="fas fa-check-double mr-2"></i>
            Segna tutte come lette
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
            <i className="fas fa-bell-slash text-2xl"></i>
          </div>
          <h3 className="text-xl font-medium mb-2">Nessuna notifica</h3>
          <p className="text-gray-500 mb-6">Salva una ricerca per ricevere notifiche quando sono disponibili nuovi annunci</p>
          <Button onClick={() => setLocation('/')}>
            Inizia a cercare
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                notification.read ? "bg-white" : "bg-blue-50 border-l-4 border-primary-500"
              )}
            >
              <CardContent className="p-6">
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
                <p className="text-sm text-gray-600 mt-2 mb-4">{notification.message}</p>
                <div className="flex justify-between items-center">
                  <Button 
                    variant="link" 
                    className="px-0 h-auto text-primary-600 hover:text-primary-800"
                    onClick={() => {
                      markAsRead(notification.id);
                      // In a real app, we would navigate to the specific listing
                      // For now, just navigate to results
                      setLocation('/results');
                    }}
                  >
                    Vedi dettagli
                  </Button>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Chiudi
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default Notifications;
