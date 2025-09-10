<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Auth;

class RolePermissionController extends Controller
{
    /**
     * Get all roles with their permissions
     */
    public function getRoles(): JsonResponse
    {
        try {
            $roles = Role::with('permissions')
                ->where('guard_name', 'api')
                ->get()
                ->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'display_name' => ucfirst($role->name),
                        'description' => $this->getRoleDescription($role->name),
                        'permissions' => $role->permissions->pluck('name')->toArray(),
                        'permissions_count' => $role->permissions->count(),
                        'users_count' => $role->users()->count(),
                        'is_system' => in_array($role->name, ['admin', 'teacher', 'student']),
                        'created_at' => $role->created_at,
                        'updated_at' => $role->updated_at
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all permissions grouped by module
     */
    public function getPermissions(): JsonResponse
    {
        try {
            $permissions = Permission::where('guard_name', 'api')
                ->get()
                ->map(function ($permission) {
                    $parts = explode('.', $permission->name);
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'display_name' => $this->getPermissionDisplayName($permission->name),
                        'description' => $this->getPermissionDescription($permission->name),
                        'module' => $parts[0] ?? 'general',
                        'action' => $parts[1] ?? 'access',
                        'created_at' => $permission->created_at
                    ];
                })
                ->groupBy('module');

            return response()->json([
                'success' => true,
                'data' => $permissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener permisos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user's permissions and role
     */
    public function getUserPermissions(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $userRole = $user->roles()->where('guard_name', 'api')->first();
            $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();
            $directPermissions = $user->getDirectPermissions()->pluck('name')->toArray();
            $rolePermissions = $user->getPermissionsViaRoles()->pluck('name')->toArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $user->id,
                    'roles' => $userRole ? [[
                        'id' => $userRole->id,
                        'name' => $userRole->name,
                        'display_name' => ucfirst($userRole->name),
                        'description' => $this->getRoleDescription($userRole->name)
                    ]] : [],
                    'permissions' => array_map(function($permission) {
                        return [
                            'id' => 0, // Placeholder ID
                            'name' => $permission,
                            'guard_name' => 'api'
                        ];
                    }, $userPermissions),
                    'all_permissions' => array_map(function($permission) {
                        return [
                            'id' => 0, // Placeholder ID
                            'name' => $permission,
                            'guard_name' => 'api'
                        ];
                    }, $userPermissions),
                    'permissions_count' => count($userPermissions),
                    'is_admin' => $user->hasRole('admin')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener permisos del usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user has specific permission
     */
    public function checkPermission(Request $request): JsonResponse
    {
        $request->validate([
            'permission' => 'required|string'
        ]);

        try {
            $user = Auth::user();
            $permission = $request->input('permission');
            
            $hasPermission = $user->can($permission);

            return response()->json([
                'success' => true,
                'data' => [
                    'permission' => $permission,
                    'has_permission' => $hasPermission,
                    'user_id' => $user->id
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get role description based on role name
     */
    private function getRoleDescription(string $roleName): string
    {
        $descriptions = [
            'admin' => 'Acceso completo al sistema',
            'teacher' => 'Gestión de clases y evaluaciones',
            'student' => 'Acceso a contenido académico'
        ];

        return $descriptions[$roleName] ?? 'Rol personalizado';
    }

    /**
     * Get permission display name
     */
    private function getPermissionDisplayName(string $permissionName): string
    {
        $parts = explode('.', $permissionName);
        $module = $parts[0] ?? '';
        $action = $parts[1] ?? '';

        $moduleNames = [
            'users' => 'Usuarios',
            'students' => 'Estudiantes',
            'teachers' => 'Docentes',
            'classes' => 'Clases',
            'grades' => 'Calificaciones',
            'attendance' => 'Asistencia',
            'reports' => 'Reportes',
            'dashboard' => 'Dashboard',
            'settings' => 'Configuración'
        ];

        $actionNames = [
            'view' => 'Ver',
            'create' => 'Crear',
            'edit' => 'Editar',
            'delete' => 'Eliminar',
            'manage' => 'Gestionar'
        ];

        $moduleName = $moduleNames[$module] ?? ucfirst($module);
        $actionName = $actionNames[$action] ?? ucfirst($action);

        return "$actionName $moduleName";
    }

    /**
     * Get permission description
     */
    private function getPermissionDescription(string $permissionName): string
    {
        $displayName = $this->getPermissionDisplayName($permissionName);
        return "Permite $displayName";
    }
}