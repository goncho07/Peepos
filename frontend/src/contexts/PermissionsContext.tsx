import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRoles, usePermissions, useUserPermissions } from '../hooks/useRolePermissions';
import { Role, Permission } from '../services/rolePermissionService';

// Las interfaces ahora se importan desde el servicio

interface PermissionsContextType {
  permissions: Permission[];
  roles: Role[];
  userPermissions: string[];
  userRole: Role | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccess: (module: string, action?: string) => boolean;
  hasModuleAccess: (module: string, action?: string) => boolean;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Los permisos ahora se obtienen del backend

// Los roles ahora se obtienen del backend

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { data: permissions = [], isLoading: permissionsLoading, refetch: refetchPermissions } = usePermissions();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: userPermissionsData, isLoading: userPermissionsLoading } = useUserPermissions();
  
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const isLoading = permissionsLoading || rolesLoading || userPermissionsLoading;

  useEffect(() => {
    if (user && userPermissionsData) {
      // Verificar que permissions existe y es un array antes de hacer map
      if (userPermissionsData.permissions && Array.isArray(userPermissionsData.permissions)) {
        setUserPermissions(userPermissionsData.permissions.map(p => p.name));
      } else {
        setUserPermissions([]);
      }
      
      // Verificar que roles existe y es un array antes de acceder
      if (userPermissionsData.roles && Array.isArray(userPermissionsData.roles) && userPermissionsData.roles.length > 0) {
        setUserRole(userPermissionsData.roles[0]);
      } else {
        setUserRole(null);
      }
    } else {
      setUserPermissions([]);
      setUserRole(null);
    }
  }, [user, userPermissionsData]);

  const hasPermission = (permission: string): boolean => {
    if (!user || isLoading) return false;
    
    // Verificar si el usuario tiene el permiso específico
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (!user || isLoading) return false;
    
    return permissionList.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (!user || isLoading) return false;
    
    return permissionList.every(permission => userPermissions.includes(permission));
  };

  const canAccess = (module: string, action?: string): boolean => {
    if (!user || isLoading) return false;
    
    if (action) {
      return hasPermission(`${module}.${action}`);
    }
    
    // Si no se especifica acción, verificar si tiene algún permiso en el módulo
    return userPermissions.some(permission => permission.startsWith(`${module}.`));
  };

  const refreshPermissions = async (): Promise<void> => {
    // React Query se encarga de refrescar los datos automáticamente
    // Los hooks useUserPermissions, useRoles y usePermissions manejan la invalidación
  };

  const value: PermissionsContextType = {
    permissions,
    roles,
    userPermissions,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    hasModuleAccess: canAccess,
    isLoading,
    refreshPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsProvider');
  }
  return context;
};

// Hook para verificar permisos específicos
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = usePermissionsContext();
  return hasPermission(permission);
};

// Hook para verificar acceso a módulos
export const useModuleAccess = (module: string, action?: string): boolean => {
  const { hasModuleAccess } = usePermissionsContext();
  return hasModuleAccess(module, action);
};

// Hook para obtener permisos de un módulo específico
export const useModulePermissions = (module: string): string[] => {
  const { userPermissions } = usePermissionsContext();
  return userPermissions.filter(permission => permission.startsWith(`${module}.`));
};

export default PermissionsContext;