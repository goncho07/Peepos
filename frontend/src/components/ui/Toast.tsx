import React, { useState, useEffect, createContext, useContext } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { classNames } from '../../utils/helpers.ts';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  success: (message: string, options?: any) => void;
  error: (message: string, options?: any) => void;
  warning: (message: string, options?: any) => void;
  info: (message: string, options?: any) => void;
  toasts: ToastData[];
}

// Context para manejar las notificaciones
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook para usar el contexto de toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider');
  }
  return context;
};

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

// Componente individual de Toast
const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);
  
  const handleClose = () => {
    setShow(false);
    setTimeout(() => onRemove(toast.id), 300);
  };
  
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  
  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700'
    }
  };
  
  const Icon = icons[toast.type];
  const colorScheme = colors[toast.type];
  
  return (
    <Transition
      show={show}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={classNames(
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
        colorScheme.bg,
        colorScheme.border
      )}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={classNames('h-6 w-6', colorScheme.icon)} />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              {toast.title && (
                <p className={classNames('text-sm font-medium', colorScheme.title)}>
                  {toast.title}
                </p>
              )}
              {toast.message && (
                <p className={classNames(
                  'text-sm',
                  colorScheme.message,
                  toast.title ? 'mt-1' : ''
                )}>
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={toast.action.onClick}
                    className={classNames(
                      'text-sm font-medium hover:underline focus:outline-none',
                      colorScheme.title
                    )}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className={classNames(
                  'rounded-md inline-flex hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  colorScheme.icon
                )}
                onClick={handleClose}
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

// Contenedor de toasts
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

// Provider de Toast
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      duration: 5000, // 5 segundos por defecto
      ...toast
    };
    
    setToasts((prev) => [...prev, newToast]);
    return id;
  };
  
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  const removeAllToasts = () => {
    setToasts([]);
  };
  
  // Métodos de conveniencia
  const success = (message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  };
  
  const error = (message, options = {}) => {
    return addToast({ type: 'error', message, duration: 0, ...options }); // Los errores no se auto-ocultan
  };
  
  const warning = (message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  };
  
  const info = (message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  };
  
  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export default Toast;