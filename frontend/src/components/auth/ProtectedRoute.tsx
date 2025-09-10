import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePermissionsContext } from '../../contexts/PermissionsContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  requiredModule?: string;
  requiredAction?: string;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

const AccessDenied: React.FC<{ message?: string; onGoBack?: () => void }> = ({ 
  message = 'No tienes permisos para acceder a esta sección', 
  onGoBack 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Acceso Denegado
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300 mb-8"
          >
            {message}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Volver
              </button>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Ir Atrás
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Contacta al administrador</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Si crees que deberías tener acceso a esta sección, contacta al administrador del sistema.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const LoadingPermissions: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </motion.div>
        <p className="text-gray-600 dark:text-gray-300">Verificando permisos...</p>
      </motion.div>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
  requiredModule,
  requiredAction,
  fallbackPath = '/login',
  showAccessDenied = true
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    canAccess, 
    isLoading 
  } = usePermissionsContext();
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Mostrar loading mientras se cargan los permisos
  if (isLoading) {
    return <LoadingPermissions />;
  }

  // Verificar permisos
  let hasAccess = true;
  let accessMessage = 'No tienes permisos para acceder a esta sección';

  // Verificar permiso específico
  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
    if (!hasAccess) {
      accessMessage = `Necesitas el permiso '${requiredPermission}' para acceder a esta sección`;
    }
  }

  // Verificar lista de permisos
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      hasAccess = hasAllPermissions(requiredPermissions);
      if (!hasAccess) {
        accessMessage = `Necesitas todos estos permisos: ${requiredPermissions.join(', ')}`;
      }
    } else {
      hasAccess = hasAnyPermission(requiredPermissions);
      if (!hasAccess) {
        accessMessage = `Necesitas al menos uno de estos permisos: ${requiredPermissions.join(', ')}`;
      }
    }
  }

  // Verificar acceso a módulo
  if (requiredModule) {
    hasAccess = canAccess(requiredModule, requiredAction);
    if (!hasAccess) {
      const moduleAction = requiredAction ? `${requiredModule}.${requiredAction}` : requiredModule;
      accessMessage = `No tienes acceso al módulo '${moduleAction}'`;
    }
  }

  // Si no tiene acceso
  if (!hasAccess) {
    if (showAccessDenied) {
      return <AccessDenied message={accessMessage} />;
    } else {
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }
  }

  // Si tiene acceso, renderizar el contenido
  return <>{children}</>;
};

// Componente para proteger elementos específicos dentro de una página
interface ProtectedElementProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  requiredModule?: string;
  requiredAction?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
}



// Hook para verificar permisos en componentes
export const useRoutePermissions = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
  canAccess, 
  isLoading 
} = usePermissionsContext();

  const checkPermission = (permission: string): boolean => {
    return !isLoading && hasPermission(permission);
  };

  const checkAnyPermission = (permissions: string[]): boolean => {
    return !isLoading && hasAnyPermission(permissions);
  };

  const checkAllPermissions = (permissions: string[]): boolean => {
    return !isLoading && hasAllPermissions(permissions);
  };

  const checkModuleAccess = (module: string, action?: string): boolean => {
    return !isLoading && canAccess(module, action);
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkModuleAccess,
    isLoading
  };
};

export default ProtectedRoute;