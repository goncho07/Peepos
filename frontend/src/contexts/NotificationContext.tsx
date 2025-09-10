import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../services/apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  userId?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'academic' | 'administrative' | 'system' | 'communication';
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Inicializar conexión WebSocket
  useEffect(() => {
    // Solo conectar si hay usuario y token de autenticación
    if (!userId || !localStorage.getItem('auth_token')) {
      return;
    }

    const socketInstance = io(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000', {
      transports: ['websocket'],
      query: { userId }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('notification', (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      addNotification(notification);
    });

    socketInstance.on('bulk_notifications', (notificationList: Notification[]) => {
      setNotifications(prev => [...notificationList, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (userId && localStorage.getItem('auth_token')) {
      loadInitialNotifications();
    }
  }, [userId]);

  const loadInitialNotifications = async () => {
    try {
      const response = await apiClient.get(`/v1/notifications?userId=${userId}`);
      if (response.data) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      // Agregar notificaciones de ejemplo para desarrollo
      addMockNotifications();
    }
  };

  const addMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nueva matrícula pendiente',
        message: 'Juan Pérez ha completado su solicitud de matrícula',
        type: 'info',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: 'medium',
        category: 'administrative',
        actionUrl: '/matricula/solicitudes'
      },
      {
        id: '2',
        title: 'Evaluación pendiente de revisión',
        message: 'Examen de Matemáticas - 5to A requiere calificación',
        type: 'warning',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: 'high',
        category: 'academic',
        actionUrl: '/academico/evaluaciones'
      },
      {
        id: '3',
        title: 'Sistema actualizado',
        message: 'Nueva versión del sistema disponible con mejoras',
        type: 'success',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        priority: 'low',
        category: 'system'
      }
    ];
    setNotifications(mockNotifications);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar notificación del navegador si está permitido
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );

    // Enviar al servidor
    if (socket) {
      socket.emit('mark_read', { notificationId: id, userId });
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Enviar al servidor
    if (socket) {
      socket.emit('mark_all_read', { userId });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));

    // Enviar al servidor
    if (socket) {
      socket.emit('remove_notification', { notificationId: id, userId });
    }
  };

  const clearAll = () => {
    setNotifications([]);

    // Enviar al servidor
    if (socket) {
      socket.emit('clear_all', { userId });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    isConnected
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

// Export del contexto como named export
export { NotificationContext };

// Export default del provider para compatibilidad con Fast Refresh
export default NotificationProvider;