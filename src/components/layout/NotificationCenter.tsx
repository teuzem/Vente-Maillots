import React from 'react';
import { Bell, X, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    removeNotification, 
    markNotificationAsRead, 
    clearAllNotifications 
  } = useStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleRemove = (id: string) => {
    removeNotification(id);
  };

  if (notifications.length === 0) {
    return (
      <div className="w-80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-center text-gray-500 py-8">
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune notification</p>
          <p className="text-sm">Vous êtes à jour !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="text-sm"
          >
            Effacer tout
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-80">
        <div className="p-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative p-3 rounded-lg mb-2 transition-colors cursor-pointer ${
                notification.read
                  ? 'bg-gray-50 dark:bg-gray-800/50'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
              }`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {notification.actionUrl && (
                <div className="mt-2 ml-7">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = notification.actionUrl!;
                    }}
                  >
                    Voir détails
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {unreadCount > 0 && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              notifications.forEach(n => {
                if (!n.read) markNotificationAsRead(n.id);
              });
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Marquer tout comme lu
          </Button>
        </div>
      )}
    </div>
  );
};
