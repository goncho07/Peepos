import { apiClient } from './apiClient';

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  description?: string;
}

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
  all_permissions: Permission[];
}

export interface CheckPermissionRequest {
  permission: string;
}

export interface CheckPermissionResponse {
  success: boolean;
  has_permission: boolean;
  message?: string;
}

class RolePermissionService {
  private baseUrl = '/v1/roles-permissions';

  /**
   * Obtener todos los roles disponibles
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/roles`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los permisos disponibles
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/permissions`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * Obtener roles y permisos del usuario autenticado
   */
  async getUserPermissions(): Promise<UserPermissions> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/user-permissions`);
      return response.data.data || { roles: [], permissions: [], all_permissions: [] };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  async checkPermission(permission: string): Promise<boolean> {
    try {
      const response = await apiClient.post<CheckPermissionResponse>(
        `${this.baseUrl}/check-permission`,
        { permission }
      );
      return response.data.has_permission || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Verificar múltiples permisos a la vez
   */
  async checkMultiplePermissions(permissions: string[]): Promise<Record<string, boolean>> {
    try {
      const results: Record<string, boolean> = {};
      
      // Ejecutar todas las verificaciones en paralelo
      const promises = permissions.map(async (permission) => {
        const hasPermission = await this.checkPermission(permission);
        return { permission, hasPermission };
      });
      
      const resolvedPromises = await Promise.all(promises);
      
      resolvedPromises.forEach(({ permission, hasPermission }) => {
        results[permission] = hasPermission;
      });
      
      return results;
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      // Retornar false para todos los permisos en caso de error
      return permissions.reduce((acc, permission) => {
        acc[permission] = false;
        return acc;
      }, {} as Record<string, boolean>);
    }
  }
}

export const rolePermissionService = new RolePermissionService();
export default rolePermissionService;