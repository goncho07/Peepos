import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X,
  Clock,
  User,
  MessageSquare,
  Calendar,
  FileText
} from 'lucide-react';
import { Widget, NotificationWidgetData, Notification } from '../../types/widgets';
import BaseWidget from './BaseWidget';

interface NotificationWidgetProps {
  widget: Widget;
  data: NotificationWidgetData;
  onRemove?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
  isEditing?: boolean;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationDismiss?: (notificationId: string) => void;
}

const NotificationWidget: React.FC<NotificationWidgetProps> = ({
  widget,
  data,
  onRemove,
  onEdit,
  isEditing = false,
  onNotificationRead,
  onNotificationDismiss
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'message':
        return <MessageSquare className="text-blue-500" size={16} />;
      case 'event':
        return <Calendar className="text-purple-500" size={16} />;
      case 'document':
        return <FileText className="text-gray-500" size={16} />;
      default:
        return <Info className="text-blue-500" size={16} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'message':
        return 'border-l-blue-500 bg-blue-50';
      case 'event':
        return 'border-l-purple-500 bg-purple-50';
      case 'document':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = data.notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!isEditing && !notification.read && onNotificationRead) {
      onNotificationRead(notification.id);
    }
  };

  const handleDismiss = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!isEditing && onNotificationDismiss) {
      onNotificationDismiss(notificationId);
    }
  };

  const unreadCount = data.notifications.filter(n => !n.read).length;
  const totalCount = data.notifications.length;

  return (
    <BaseWidget
      widget={widget}
      onRemove={onRemove}
      onEdit={onEdit}
      isEditing={isEditing}
    >
      <div className="h-full flex flex-col">
        {/* Header with filters */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-gray-600" />
              <span className="font-medium text-gray-900">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todas ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                filter === 'unread' 
                  ? 'bg-red-100 text-red-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              No leídas ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                filter === 'read' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Leídas ({totalCount - unreadCount})
            </button>
          </div>
        </div>
        
        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200
                  ${getNotificationColor(notification.type)}
                  ${notification.read ? 'opacity-75' : ''}
                  ${isEditing ? 'pointer-events-none' : 'hover:shadow-sm'}
                `}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${
                        notification.read ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </p>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={10} />
                          <span>{formatTime(notification.timestamp.toISOString())}</span>
                        </div>
                        
                        {!isEditing && (
                          <button
                            onClick={(e) => handleDismiss(e, notification.id)}
                            className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Descartar"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-xs mt-1 ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {notification.sender && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <User size={10} />
                        <span>{notification.sender}</span>
                      </div>
                    )}
                    
                    {!notification.read && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell size={48} className="mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'all' 
                  ? 'No hay notificaciones' 
                  : filter === 'unread'
                  ? 'No hay notificaciones sin leer'
                  : 'No hay notificaciones leídas'
                }
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {totalCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {unreadCount > 0 
                ? `${unreadCount} notificaciones sin leer`
                : 'Todas las notificaciones están al día'
              }
            </p>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default NotificationWidget;