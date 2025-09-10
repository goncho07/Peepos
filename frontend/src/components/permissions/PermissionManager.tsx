import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check, 
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { usePermissionsContext } from '../../contexts/PermissionsContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  customPermissions: string[];
  deniedPermissions: string[];
  lastLogin?: Date;
}

interface PermissionAssignment {
  userId: string;
  permissionId: string;
  granted: boolean;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  reason?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@colegio.edu',
    role: 'director',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isActive: true,
    customPermissions: ['users.delete', 'settings.backup'],
    deniedPermissions: [],
    lastLogin: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@colegio.edu',
    role: 'coordinator',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=6366f1&color=fff&size=150',
    isActive: true,
    customPermissions: ['students.export'],
    deniedPermissions: ['students.delete'],
    lastLogin: new Date('2024-01-15T09:15:00')
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos.lopez@colegio.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isActive: true,
    customPermissions: [],
    deniedPermissions: ['academic.grades.edit'],
    lastLogin: new Date('2024-01-15T08:45:00')
  }
];

const mockAssignments: PermissionAssignment[] = [
  {
    userId: '1',
    permissionId: 'users.delete',
    granted: true,
    assignedBy: 'admin',
    assignedAt: new Date('2024-01-10T14:30:00'),
    reason: 'Necesario para gestión de usuarios inactivos'
  },
  {
    userId: '2',
    permissionId: 'students.delete',
    granted: false,
    assignedBy: 'admin',
    assignedAt: new Date('2024-01-12T11:20:00'),
    reason: 'Restricción por política de seguridad'
  }
];

interface PermissionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({ isOpen, onClose }) => {
  const { permissions, roles } = usePermissionsContext();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [assignments, setAssignments] = useState<PermissionAssignment[]>(mockAssignments);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'assignments'>('users');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<{
    custom: string[];
    denied: string[];
  }>({ custom: [], denied: [] });

  // Helper functions to extract module and action from permission name
  const getPermissionModule = (permissionName: string): string => {
    const parts = permissionName.split('.');
    return parts.length > 1 ? parts[0] : 'general';
  };

  const getPermissionAction = (permissionName: string): string => {
    const parts = permissionName.split('.');
    return parts.length > 1 ? parts.slice(1).join('.') : permissionName;
  };

  useEffect(() => {
    if (selectedUser) {
      setEditingPermissions({
        custom: [...selectedUser.customPermissions],
        denied: [...selectedUser.deniedPermissions]
      });
    }
  }, [selectedUser]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesActive = showInactive || user.isActive;
    
    return matchesSearch && matchesRole && matchesActive;
  });

  const filteredPermissions = Array.isArray(permissions) ? permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (permission.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !filterModule || getPermissionModule(permission.name) === filterModule;
    
    return matchesSearch && matchesModule;
  }) : [];

  const getUserRole = (user: User) => {
    return roles.find(role => role.name === user.role);
  };

  const getUserEffectivePermissions = (user: User) => {
    const role = getUserRole(user);
    const rolePermissions = role ? role.permissions?.map(p => p.name) || [] : [];
    
    // Combinar permisos del rol con permisos personalizados
    const allPermissions = [...new Set([...rolePermissions, ...user.customPermissions])];
    
    // Remover permisos denegados
    return allPermissions.filter(permission => !user.deniedPermissions.includes(permission));
  };

  const handlePermissionToggle = (permissionId: string, type: 'custom' | 'denied') => {
    setEditingPermissions(prev => {
      const newPermissions = { ...prev };
      
      if (type === 'custom') {
        if (newPermissions.custom.includes(permissionId)) {
          newPermissions.custom = newPermissions.custom.filter(p => p !== permissionId);
        } else {
          newPermissions.custom.push(permissionId);
          // Remover de denegados si está ahí
          newPermissions.denied = newPermissions.denied.filter(p => p !== permissionId);
        }
      } else {
        if (newPermissions.denied.includes(permissionId)) {
          newPermissions.denied = newPermissions.denied.filter(p => p !== permissionId);
        } else {
          newPermissions.denied.push(permissionId);
          // Remover de personalizados si está ahí
          newPermissions.custom = newPermissions.custom.filter(p => p !== permissionId);
        }
      }
      
      return newPermissions;
    });
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id 
        ? {
            ...user,
            customPermissions: editingPermissions.custom,
            deniedPermissions: editingPermissions.denied
          }
        : user
    ));
    
    // Crear registros de asignación
    const newAssignments: PermissionAssignment[] = [];
    
    // Permisos personalizados agregados
    editingPermissions.custom.forEach(permissionId => {
      if (!selectedUser.customPermissions.includes(permissionId)) {
        newAssignments.push({
          userId: selectedUser.id,
          permissionId,
          granted: true,
          assignedBy: 'current-user',
          assignedAt: new Date(),
          reason: 'Permiso personalizado agregado'
        });
      }
    });
    
    // Permisos denegados agregados
    editingPermissions.denied.forEach(permissionId => {
      if (!selectedUser.deniedPermissions.includes(permissionId)) {
        newAssignments.push({
          userId: selectedUser.id,
          permissionId,
          granted: false,
          assignedBy: 'current-user',
          assignedAt: new Date(),
          reason: 'Permiso denegado'
        });
      }
    });
    
    setAssignments(prev => [...prev, ...newAssignments]);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (selectedUser) {
      setEditingPermissions({
        custom: [...selectedUser.customPermissions],
        denied: [...selectedUser.deniedPermissions]
      });
    }
    setIsEditing(false);
  };

  const getPermissionStatus = (permissionId: string, user: User) => {
    const role = getUserRole(user);
    const rolePermissions = role ? role.permissions?.map(p => p.name) || [] : [];
    
    if (user.deniedPermissions.includes(permissionId)) {
      return 'denied';
    }
    
    if (user.customPermissions.includes(permissionId)) {
      return 'custom';
    }
    
    if (rolePermissions.includes(permissionId)) {
      return 'role';
    }
    
    return 'none';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'role': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'custom': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'denied': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'role': return 'Por rol';
      case 'custom': return 'Personalizado';
      case 'denied': return 'Denegado';
      default: return 'Sin acceso';
    }
  };

  const modules = [...new Set((Array.isArray(permissions) ? permissions : []).map(p => getPermissionModule(p.name)))];
  const userRoles = [...new Set(users.map(u => u.role))];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gestión de Permisos
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Administra permisos de usuarios y roles
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'users', label: 'Usuarios', icon: Users },
              { id: 'permissions', label: 'Permisos', icon: Settings },
              { id: 'assignments', label: 'Asignaciones', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={activeTab === 'users' ? 'Buscar usuarios...' : 'Buscar permisos...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                {activeTab === 'users' && (
                  <div className="space-y-2">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todos los roles</option>
                      {userRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mostrar inactivos</span>
                    </label>
                  </div>
                )}
                
                {activeTab === 'permissions' && (
                  <select
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Todos los módulos</option>
                    {modules.map(module => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'users' && (
                  <div className="space-y-2 p-4">
                    {filteredUsers.map(user => (
                      <motion.div
                        key={user.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedUser?.id === user.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                {user.role}
                              </span>
                              {!user.isActive && (
                                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded">
                                  Inactivo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'permissions' && (
                  <div className="space-y-2 p-4">
                    {filteredPermissions.map(permission => (
                      <div
                        key={permission.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {permission.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {permission.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                                {getPermissionModule(permission.name)}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                {getPermissionAction(permission.name)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {selectedUser && activeTab === 'users' ? (
                <div className="flex-1 overflow-y-auto">
                  {/* User Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`}
                          alt={selectedUser.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedUser.name}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-sm">
                              {selectedUser.role}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              selectedUser.isActive 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                            }`}>
                              {selectedUser.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSavePermissions}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4" />
                              <span>Guardar</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancelar</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Editar Permisos</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Permissions List */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {modules.map(module => {
                        const modulePermissions = Array.isArray(permissions) ? permissions.filter(p => getPermissionModule(p.name) === module) : [];
                        
                        return (
                          <div key={module} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                              <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                {module}
                              </h4>
                            </div>
                            
                            <div className="p-4 space-y-3">
                              {modulePermissions.map(permission => {
                                const status = getPermissionStatus(permission.id.toString(), selectedUser);
                                const isInCustom = isEditing ? editingPermissions.custom.includes(permission.id.toString()) : selectedUser.customPermissions.includes(permission.id.toString());
                                const isInDenied = isEditing ? editingPermissions.denied.includes(permission.id.toString()) : selectedUser.deniedPermissions.includes(permission.id.toString());
                                
                                return (
                                  <div key={permission.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {permission.name}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {permission.description}
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {!isEditing && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                                          {getStatusLabel(status)}
                                        </span>
                                      )}
                                      
                                      {isEditing && (
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => handlePermissionToggle(permission.id.toString(), 'custom')}
                                            className={`p-2 rounded-lg transition-colors ${
                                              isInCustom
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-green-600'
                                            }`}
                                            title="Conceder permiso"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                          
                                          <button
                                            onClick={() => handlePermissionToggle(permission.id.toString(), 'denied')}
                                            className={`p-2 rounded-lg transition-colors ${
                                              isInDenied
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-600'
                                            }`}
                                            title="Denegar permiso"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {activeTab === 'users' ? 'Selecciona un usuario' : 'Gestión de Permisos'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {activeTab === 'users' 
                        ? 'Selecciona un usuario de la lista para ver y editar sus permisos'
                        : 'Aquí puedes gestionar los permisos del sistema'
                      }
                    </p>
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

export default PermissionManager;