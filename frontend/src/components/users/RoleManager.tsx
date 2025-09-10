import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Plus, Edit, Trash2, Save, Users, Settings, Eye, EyeOff, Check } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { useRoles, usePermissions } from '../../hooks/useRolePermissions';
import { Permission, Role } from '../../services/rolePermissionService';

// Interfaces importadas desde el servicio

interface RoleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated?: (role: Role) => void;
  onRoleUpdated?: (role: Role) => void;
  onRoleDeleted?: (roleId: string) => void;
}

// Datos eliminados - ahora se obtienen del backend

// Datos eliminados - ahora se obtienen del backend

const RoleManager: React.FC<RoleManagerProps> = ({ 
  isOpen, 
  onClose, 
  onRoleCreated, 
  onRoleUpdated, 
  onRoleDeleted 
}) => {
  // Obtener datos del backend usando React Query
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Helper function to extract module from permission name
  const getPermissionModule = (permissionName: string): string => {
    const parts = permissionName.split('.');
    return parts.length > 1 ? parts[0] : 'general';
  };

  const modules = [...new Set(Array.isArray(permissions) ? permissions.map(p => getPermissionModule(p.name)) : [])];
  const filteredPermissions = Array.isArray(permissions) ? permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (permission.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !selectedModule || getPermissionModule(permission.name) === selectedModule;
    return matchesSearch && matchesModule;
  }) : [];

  const handleCreateRole = () => {
    setIsCreating(true);
    setIsEditing(true);
    setSelectedRole(null);
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handleEditRole = (role: Role) => {
    // Verificar si es un rol del sistema (admin, super-admin, etc.)
    const systemRoles = ['admin', 'super-admin', 'system'];
    if (systemRoles.includes(role.name.toLowerCase())) return;
    
    setSelectedRole(role);
    setIsEditing(true);
    setIsCreating(false);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions?.map(p => p.name) || []
    });
  };

  const handleSaveRole = () => {
    if (!formData.name.trim()) return;

    // TODO: Implementar llamadas a la API para crear/actualizar roles
    // Por ahora solo notificamos a los callbacks
    if (isCreating) {
      const newRole: Role = {
        id: Date.now(),
        name: formData.name,
        guard_name: 'web',
        description: formData.description,
        permissions: Array.isArray(permissions) ? permissions.filter(p => formData.permissions.includes(p.name)) : []
      };
      onRoleCreated?.(newRole);
    } else if (selectedRole) {
      const updatedRole: Role = {
        ...selectedRole,
        name: formData.name,
        description: formData.description,
        permissions: Array.isArray(permissions) ? permissions.filter(p => formData.permissions.includes(p.name)) : []
      };
      onRoleUpdated?.(updatedRole);
    }

    setIsEditing(false);
    setSelectedRole(null);
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handleDeleteRole = (role: Role) => {
    // Verificar si es un rol del sistema
    const systemRoles = ['admin', 'super-admin', 'system'];
    if (systemRoles.includes(role.name.toLowerCase())) return;
    
    // TODO: Implementar llamada a la API para eliminar rol
    onRoleDeleted?.(role.id.toString());
  };

  const handlePermissionToggle = (permissionName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(name => name !== permissionName)
        : [...prev.permissions, permissionName]
    }));
  };

  const getPermissionsByModule = (module: string) => {
    return Array.isArray(permissions) ? permissions.filter(p => getPermissionModule(p.name) === module) : [];
  };

  const isModuleFullySelected = (module: string) => {
    const modulePermissions = getPermissionsByModule(module);
    return modulePermissions.every(p => formData.permissions.includes(p.name));
  };

  const toggleModulePermissions = (module: string) => {
    const modulePermissions = getPermissionsByModule(module);
    const isFullySelected = isModuleFullySelected(module);
    
    if (isFullySelected) {
      // Remover todos los permisos del módulo
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(name => 
          !modulePermissions.some(p => p.name === name)
        )
      }));
    } else {
      // Agregar todos los permisos del módulo
      const newPermissions = modulePermissions.map(p => p.name);
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...newPermissions])]
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Gestión de Roles y Permisos
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Lista de roles */}
            <div className="w-1/3 border-r overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <Button onClick={handleCreateRole} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Rol
                </Button>
              </div>
              
              <div className="p-4 space-y-3">
                {rolesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay roles disponibles</p>
                  </div>
                ) : (
                  roles.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole?.id === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedRole(role);
                      setIsEditing(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{role.permissions?.length || 0} permisos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>{role.permissions.length} permisos</span>
                          </div>
                        </div>
                        {['admin', 'super-admin', 'system'].includes(role.name.toLowerCase()) && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            Rol del sistema
                          </span>
                        )}
                      </div>
                      
                      {!['admin', 'super-admin', 'system'].includes(role.name.toLowerCase()) && (
                        <div className="flex space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRole(role);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!['admin', 'super-admin', 'system'].includes(role.name.toLowerCase()) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRole(role);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Detalles del rol */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {isCreating ? 'Crear Nuevo Rol' : 'Editar Rol'}
                    </h3>
                    
                    {permissionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="ml-3 text-gray-600">Cargando permisos...</p>
                      </div>
                    ) : (
                    <div className="space-y-4">
                      <Input
                        label="Nombre del rol"
                        id="roleName"
                        name="roleName"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        error={null}
                        placeholder="Ej: Secretario Académico"
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Describe las responsabilidades de este rol..."
                        />
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Permisos */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Permisos ({formData.permissions.length} seleccionados)
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPermissions(!showPermissions)}
                      >
                        {showPermissions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showPermissions ? 'Ocultar' : 'Mostrar'} Permisos
                      </Button>
                    </div>

                    {showPermissions && (
                      <div className="space-y-4">
                        {modules.map((module) => {
                          const modulePermissions = getPermissionsByModule(module);
                          const isFullySelected = isModuleFullySelected(module);
                          const selectedCount = modulePermissions.filter(p => 
                            formData.permissions.includes(p.name)
                          ).length;

                          return (
                            <div key={module} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => toggleModulePermissions(module)}
                                    className={`flex items-center justify-center w-5 h-5 border-2 rounded ${
                                      isFullySelected
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : selectedCount > 0
                                        ? 'bg-blue-100 border-blue-600'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {isFullySelected && <Check className="h-3 w-3" />}
                                    {selectedCount > 0 && selectedCount < modulePermissions.length && (
                                      <div className="w-2 h-2 bg-blue-600 rounded" />
                                    )}
                                  </button>
                                  <h5 className="font-medium text-gray-900">{module}</h5>
                                  <span className="text-sm text-gray-500">
                                    ({selectedCount}/{modulePermissions.length})
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2 ml-8">
                                {modulePermissions.map((permission) => (
                                  <label
                                    key={permission.id}
                                    className="flex items-start space-x-3 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.permissions.includes(permission.name)}
                                      onChange={() => handlePermissionToggle(permission.name)}
                                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">
                                        {permission.name}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {permission.description}
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedRole(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveRole}>
                      <Save className="h-4 w-4 mr-2" />
                      {isCreating ? 'Crear Rol' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </div>
              ) : selectedRole ? (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedRole.name}
                      </h3>
                      {!['admin', 'super-admin', 'system'].includes(selectedRole.name.toLowerCase()) && (
                        <Button
                          variant="outline"
                          onClick={() => handleEditRole(selectedRole)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{selectedRole.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedRole.permissions?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Permisos asignados</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {modules.filter(module => 
                            getPermissionsByModule(module).some(p => 
                              selectedRole.permissions?.some(rp => rp.name === p.name)
                            )
                          ).length}
                        </div>
                        <div className="text-sm text-gray-600">Módulos con acceso</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedRole.permissions?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total de permisos</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Permisos Detallados
                    </h4>
                    
                    <div className="space-y-4">
                      {modules.map((module) => {
                        const modulePermissions = getPermissionsByModule(module).filter(p => 
                          selectedRole.permissions?.some(rp => rp.name === p.name)
                        );
                        
                        if (modulePermissions.length === 0) return null;
                        
                        return (
                          <div key={module} className="border rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-3">
                              {module} ({modulePermissions.length} permisos)
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {modulePermissions.map((permission) => (
                                <div key={permission.name} className="flex items-center space-x-3">
                                  <Check className="h-4 w-4 text-green-600" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {permission.name}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {permission.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Selecciona un rol</h3>
                    <p>Elige un rol de la lista para ver sus detalles y permisos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleManager;