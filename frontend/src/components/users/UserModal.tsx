import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Calendar, Shield, Upload, Eye, EyeOff } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { useRoles, usePermissions } from '../../hooks/useRolePermissions';

interface UserFormData {
  dni: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  role: string;
  area: string;
  permissions: string[];
  password?: string;
  confirmPassword?: string;
  avatarUrl?: string;
  isActive: boolean;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  user?: UserFormData | null;
  mode: 'create' | 'edit';
}

// Datos hardcodeados eliminados - ahora se obtienen del backend
const areas = [
  'Dirección',
  'Académico',
  'Administración',
  'Recursos Humanos',
  'Sistemas',
  'Contabilidad',
  'Secretaría',
  'Mantenimiento'
];

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user, mode }) => {
  // Obtener datos del backend
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissions();

  const [formData, setFormData] = useState<UserFormData>({
    dni: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    role: '',
    area: '',
    permissions: [],
    password: '',
    confirmPassword: '',
    avatarUrl: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions' | 'security'>('basic');

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        ...user,
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        dni: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        role: '',
        area: '',
        permissions: [],
        password: '',
        confirmPassword: '',
        avatarUrl: '',
        isActive: true
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dni.trim()) newErrors.dni = 'DNI es requerido';
    else if (!/^\d{8}$/.test(formData.dni)) newErrors.dni = 'DNI debe tener 8 dígitos';

    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
    if (!formData.role) newErrors.role = 'Rol es requerido';
    if (!formData.area) newErrors.area = 'Área es requerida';

    if (mode === 'create' || formData.password) {
      if (!formData.password) newErrors.password = 'Contraseña es requerida';
      else if (formData.password.length < 6) newErrors.password = 'Contraseña debe tener al menos 6 caracteres';

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
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
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Información Básica', icon: User },
                { id: 'permissions', label: 'Permisos', icon: Shield },
                { id: 'security', label: 'Seguridad', icon: Eye }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="DNI"
                      id="dni"
                      name="dni"
                      type="text"
                      value={formData.dni}
                      onChange={(e) => handleInputChange('dni', e.target.value)}
                      error={errors.dni}
                      placeholder="12345678"
                      maxLength={8}
                    />

                    <Input
                      label="Nombre Completo"
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={errors.name}
                      placeholder="Juan Pérez García"
                    />

                    <Input
                      label="Email"
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                      placeholder="juan.perez@colegio.edu.pe"
                    />

                    <Input
                      label="Teléfono"
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={errors.phone}
                      placeholder="987654321"
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Dirección"
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        error={errors.address}
                        placeholder="Av. Principal 123, Lima"
                      />
                    </div>

                    <Input
                      label="Fecha de Nacimiento"
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      error={errors.birthDate}
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={() => handleInputChange('isActive', true)}
                            className="mr-2"
                          />
                          Activo
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="isActive"
                            checked={!formData.isActive}
                            onChange={() => handleInputChange('isActive', false)}
                            className="mr-2"
                          />
                          Inactivo
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Rol</label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.role ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar rol</option>
                        {rolesLoading ? (
                          <option disabled>Cargando roles...</option>
                        ) : (
                          roles.map(role => (
                            <option key={role.id || role.name} value={role.name}>{role.name}</option>
                          ))
                        )}
                      </select>
                      {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Área</label>
                      <select
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.area ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar área</option>
                        {areas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                      {errors.area && <p className="text-red-500 text-sm">{errors.area}</p>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Permisos del Sistema</h3>
                    <p className="text-sm text-blue-700">
                      Selecciona los permisos que tendrá este usuario en el sistema.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissionsLoading ? (
                      <div className="col-span-full text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Cargando permisos...</p>
                      </div>
                    ) : (
                      permissions.map(permission => {
                        const permissionName = typeof permission === 'string' ? permission : permission.name;
                        const [module, action] = permissionName.split('.');
                        return (
                          <label
                            key={typeof permission === 'string' ? permission : permission.name}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permissionName)}
                            onChange={() => togglePermission(permissionName)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-sm capitalize">
                              {module.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {action.replace('_', ' ')}
                            </div>
                          </div>
                        </label>
                      );
                    })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-900 mb-2">Configuración de Seguridad</h3>
                    <p className="text-sm text-yellow-700">
                      {mode === 'create' 
                        ? 'Establece una contraseña segura para el nuevo usuario.'
                        : 'Deja en blanco si no deseas cambiar la contraseña actual.'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Input
                        label="Contraseña"
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        error={errors.password}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirmar Contraseña"
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        error={errors.confirmPassword}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Requisitos de Contraseña</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Mínimo 6 caracteres</li>
                      <li>• Se recomienda incluir mayúsculas, minúsculas y números</li>
                      <li>• Evita usar información personal</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserModal;