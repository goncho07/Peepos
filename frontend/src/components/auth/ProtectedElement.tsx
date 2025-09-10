import React from 'react';
import { usePermissionsContext } from '../../contexts/PermissionsContext';

interface ProtectedElementProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredModule?: string;
  requiredAction?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const ProtectedElement: React.FC<ProtectedElementProps> = ({
  children,
  requiredPermission,
  requiredModule,
  requiredAction,
  fallback = null,
  showFallback = false
}) => {
  const { hasPermission, hasModuleAccess } = usePermissionsContext();

  // Si se especifica un permiso específico
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // Si se especifica módulo y acción
  if (requiredModule && requiredAction) {
    if (!hasModuleAccess(requiredModule, requiredAction)) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // Si solo se especifica módulo (acceso de lectura por defecto)
  if (requiredModule && !requiredAction) {
    if (!hasModuleAccess(requiredModule, 'read')) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
};

export default ProtectedElement;