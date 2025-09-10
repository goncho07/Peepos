import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Filter,
  Download,
  Upload,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Clock,
  Settings
} from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import UserModal from '../components/users/UserModal';
import UserImport from '../components/users/UserImport';
import UserActivityLog from '../components/users/UserActivityLog';
import RoleManager from '../components/users/RoleManager';
import { PermissionManager } from '../components/permissions/PermissionManager';
import { ProtectedElement } from '../components/auth/ProtectedElement';
import { usePermissionsContext } from '../contexts/PermissionsContext';
import { User } from '../types';

const mockUsers: User[] = [
  {
    dni: '12345678',
    name: 'Juan Pérez',
    area: 'Administración',
    role: 'Director',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    dni: '87654321',
    name: 'María García',
    area: 'Académico',
    role: 'Coordinadora',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=6366f1&color=fff&size=150'
  },
  {
    dni: '11223344',
    name: 'Carlos López',
    area: 'Sistemas',
    role: 'Administrador',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    dni: '55667788',
    name: 'Ana Martínez',
    area: 'Recursos Humanos',
    role: 'Asistente',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showPermissionManager, setShowPermissionManager] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { hasPermission } = usePermissionsContext();
  const [activityUserId, setActivityUserId] = useState<string | undefined>(undefined);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.dni.includes(searchTerm) ||
    user.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (dni: string) => {
    setSelectedUsers(prev =>
      prev.includes(dni)
        ? prev.filter(id => id !== dni)
        : [...prev, dni]
    );
  };

  const handleDeleteSelected = () => {
    setUsers(prev => prev.filter(user => !selectedUsers.includes(user.dni)));
    setSelectedUsers([]);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    // Convertir User a UserFormData
    const userFormData = {
      dni: user.dni,
      name: user.name,
      email: '', // Valor por defecto
      phone: '', // Valor por defecto
      address: '', // Valor por defecto
      birthDate: '', // Valor por defecto
      role: user.role,
      area: user.area,
      permissions: [], // Valor por defecto
      avatarUrl: user.avatarUrl,
      isActive: true // Valor por defecto
    };
    setEditingUser(userFormData as any);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.dni !== userId));
  };

  const handleUserSaved = (userData: any) => {
    if (editingUser) {
      // Actualizar usuario existente
      setUsers(users.map(user => 
        user.dni === editingUser.dni 
          ? { ...user, ...userData, updatedAt: new Date().toISOString() }
          : user
      ));
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        dni: userData.dni,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUsers([...users, newUser]);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleImportUsers = (importedUsers: any[]) => {
    const newUsers: User[] = importedUsers.map((userData, index) => ({
      dni: userData.dni,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setUsers([...users, ...newUsers]);
    setShowImportModal(false);
  };

  const handleShowActivity = (userId?: string) => {
    setActivityUserId(userId);
    setShowActivityLog(true);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'director':
        return 'bg-purple-100 text-purple-800';
      case 'coordinadora':
      case 'coordinador':
        return 'bg-blue-100 text-blue-800';
      case 'administrador':
        return 'bg-green-100 text-green-800';
      case 'asistente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          </div>
          <div className="flex items-center gap-2">
            <ProtectedElement requiredPermission="users.create">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateUser}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </ProtectedElement>
            <ProtectedElement requiredPermission="users.import">
              <Button 
                variant="outline"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </ProtectedElement>
            <ProtectedElement requiredPermission="users.roles">
              <Button 
                variant="outline"
                onClick={() => setShowRoleManager(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Roles
              </Button>
            </ProtectedElement>
            <ProtectedElement requiredPermission="users.roles">
              <Button 
                variant="outline"
                onClick={() => setShowPermissionManager(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Permisos
              </Button>
            </ProtectedElement>
            <ProtectedElement requiredPermission="users.activity">
              <Button 
                variant="outline"
                onClick={() => handleShowActivity()}
              >
                <Clock className="h-4 w-4 mr-2" />
                Actividad
              </Button>
            </ProtectedElement>
          </div>
        </div>

        {/* Search and Actions */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                label="Buscar usuarios"
                id="search-users"
                name="search-users"
                error={null}
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} seleccionado(s)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.dni}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card className={`p-6 cursor-pointer transition-all duration-200 ${
                selectedUsers.includes(user.dni)
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => toggleUserSelection(user.dni)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {selectedUsers.includes(user.dni) && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <UserCheck className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">DNI: {user.dni}</p>
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        getRoleColor(user.role)
                      }`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-500">{user.area}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 flex gap-1">
                  <ProtectedElement requiredPermission="users.edit">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditUser(user);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </ProtectedElement>
                  <ProtectedElement requiredPermission="users.activity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowActivity(user.dni);
                      }}
                    >
                      <Clock className="h-3 w-3" />
                    </Button>
                  </ProtectedElement>
                  <ProtectedElement requiredPermission="users.delete">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.dni);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </ProtectedElement>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <UserX className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No se encontraron usuarios</h3>
              <p>Intenta con diferentes términos de búsqueda</p>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Directores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role.toLowerCase().includes('director')).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coordinadores</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role.toLowerCase().includes('coordinador')).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.role.toLowerCase().includes('administrador')).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Modales */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleUserSaved}
        mode={editingUser ? 'edit' : 'create'}
      />

      <UserImport
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportUsers}
      />

      <UserActivityLog
        isOpen={showActivityLog}
        onClose={() => {
          setShowActivityLog(false);
          setActivityUserId(undefined);
        }}
        userId={activityUserId}
      />

      <RoleManager
        isOpen={showRoleManager}
        onClose={() => setShowRoleManager(false)}
        onRoleCreated={(role) => {
          console.log('Rol creado:', role);
        }}
        onRoleUpdated={(role) => {
          console.log('Rol actualizado:', role);
        }}
        onRoleDeleted={(roleId) => {
          console.log('Rol eliminado:', roleId);
        }}
      />

      <PermissionManager
        isOpen={showPermissionManager}
        onClose={() => setShowPermissionManager(false)}
      />
    </div>
  );
};

export default UsersPage;