import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import rolePermissionService, {
  Role,
  Permission,
  UserPermissions,
} from '../services/rolePermissionService';

// Query Keys para React Query
export const QUERY_KEYS = {
  ROLES: ['roles'] as const,
  PERMISSIONS: ['permissions'] as const,
  USER_PERMISSIONS: ['user-permissions'] as const,
  CHECK_PERMISSION: (permission: string) => ['check-permission', permission] as const,
};

/**
 * Hook para obtener todos los roles disponibles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES,
    queryFn: () => rolePermissionService.getRoles(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos (antes era cacheTime)
    enabled: !!localStorage.getItem('auth_token'), // Solo ejecutar si hay token
  });
};

/**
 * Hook para obtener todos los permisos disponibles
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PERMISSIONS,
    queryFn: () => rolePermissionService.getPermissions(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    enabled: !!localStorage.getItem('auth_token'), // Solo ejecutar si hay token
  });
};

/**
 * Hook para obtener roles y permisos del usuario autenticado
 */
export const useUserPermissions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PERMISSIONS,
    queryFn: () => rolePermissionService.getUserPermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    enabled: !!localStorage.getItem('auth_token'), // Solo ejecutar si hay token
  });
};

/**
 * Hook para verificar un permiso específico
 */
export const useCheckPermission = (permission: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.CHECK_PERMISSION(permission),
    queryFn: () => rolePermissionService.checkPermission(permission),
    enabled: enabled && !!permission,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para verificar múltiples permisos
 */
export const useCheckMultiplePermissions = (permissions: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ['check-multiple-permissions', ...permissions.sort()],
    queryFn: () => rolePermissionService.checkMultiplePermissions(permissions),
    enabled: enabled && permissions.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para invalidar caché de permisos (útil después de cambios de roles)
 */
export const useInvalidatePermissions = () => {
  const queryClient = useQueryClient();

  return {
    invalidateRoles: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES }),
    invalidatePermissions: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS }),
    invalidateUserPermissions: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS }),
    invalidateAllPermissions: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === 'check-permission' || query.queryKey[0] === 'check-multiple-permissions'
      });
    },
  };
};

/**
 * Hook personalizado que combina datos de usuario y verificación de permisos
 */
export const useUserRole = () => {
  const { data: userPermissions, isLoading, error } = useUserPermissions();

  const primaryRole = userPermissions?.roles?.[0]?.name || null;
  const allRoles = userPermissions?.roles?.map(role => role.name) || [];
  const allPermissions = userPermissions?.all_permissions?.map(permission => permission.name) || [];

  const hasRole = (roleName: string): boolean => {
    return allRoles.includes(roleName);
  };

  const hasPermission = (permissionName: string): boolean => {
    return allPermissions.includes(permissionName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => allRoles.includes(roleName));
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permissionName => allPermissions.includes(permissionName));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permissionName => allPermissions.includes(permissionName));
  };

  return {
    userPermissions,
    primaryRole,
    allRoles,
    allPermissions,
    isLoading,
    error,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    hasAllPermissions,
  };
};

/**
 * Hook para refrescar datos de permisos
 */
export const useRefreshPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Refrescar datos del usuario
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS });
      return true;
    },
    onSuccess: () => {
      console.log('Permisos actualizados exitosamente');
    },
    onError: (error) => {
      console.error('Error al actualizar permisos:', error);
    },
  });
};