import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  ExternalLink
} from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface ToastNotification extends Notification {
  isVisible: boolean;
  timeoutId?: NodeJS.Timeout;
}

const NotificationToast: React.FC = () => {
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const navigate = useNavigate();

  // Escuchar nuevas notificaciones
  useEffect(() => {
    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.read) {
      // Verificar si ya existe un toast para esta notificación
      const existingToast = toasts.find(toast => toast.id === latestNotification.id);
      if (!existingToast) {
        showToast(latestNotification);
      }
    }
  }, [notifications]);

  const showToast = (notification: Notification) => {
    const toastNotification: ToastNotification = {
      ...notification,
      isVisible: true
    };

    setToasts(prev => [toastNotification, ...prev.slice(0, 4)]); // Máximo 5 toasts

    // Auto-hide después de 5 segundos (excepto para prioridad alta)
    const autoHideDelay = notification.priority === 'high' ? 8000 : 5000;
    const timeoutId = setTimeout(() => {
      hideToast(notification.id);
    }, autoHideDelay);

    // Actualizar el toast con el timeoutId
    setToasts(prev => 
      prev.map(toast => 
        toast.id === notification.id 
          ? { ...toast, timeoutId }
          : toast
      )
    );
  };

  const hideToast = (id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      )
    );

    // Remover completamente después de la animación
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

  const handleToastClick = (notification: ToastNotification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    hideToast(notification.id);
  };

  const handleClose = (id: string, timeoutId?: NodeJS.Timeout) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    hideToast(id);
  };

  const getToastIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getToastColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getPriorityBorder = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ 
              opacity: toast.isVisible ? 1 : 0, 
              x: toast.isVisible ? 0 : 300,
              scale: toast.isVisible ? 1 : 0.8,
              y: index * 10 // Efecto de apilamiento
            }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className={`
              w-96 max-w-sm bg-white rounded-lg shadow-lg border pointer-events-auto
              ${getToastColors(toast.type)} ${getPriorityBorder(toast.priority)}
              ${toast.actionUrl ? 'cursor-pointer hover:shadow-xl' : ''}
              transform transition-all duration-200
            `}
            onClick={() => toast.actionUrl && handleToastClick(toast)}
            style={{ zIndex: 1000 - index }} // Toasts más recientes encima
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getToastIcon(toast.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {toast.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {toast.actionUrl && (
                        <ExternalLink size={14} className="text-gray-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose(toast.id, toast.timeoutId);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-1">
                    {toast.message}
                  </p>
                  
                  {/* Priority Indicator */}
                  {toast.priority === 'high' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Prioridad Alta
                      </span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      toast.category === 'academic' ? 'bg-purple-100 text-purple-800' :
                      toast.category === 'administrative' ? 'bg-blue-100 text-blue-800' :
                      toast.category === 'system' ? 'bg-gray-100 text-gray-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {toast.category === 'academic' ? 'Académico' :
                       toast.category === 'administrative' ? 'Administrativo' :
                       toast.category === 'system' ? 'Sistema' : 'Comunicación'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <motion.div
              className="h-1 bg-gray-200 rounded-b-lg overflow-hidden"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ 
                duration: toast.priority === 'high' ? 8 : 5,
                ease: 'linear'
              }}
            >
              <div className={`h-full ${
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'warning' ? 'bg-yellow-500' :
                toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;