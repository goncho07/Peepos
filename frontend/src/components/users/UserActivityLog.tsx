import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Shield, Edit, Trash2, Eye, Filter, Calendar, Search } from 'lucide-react';
import { Button, Card, Input } from '../ui';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const mockActivities: ActivityLog[] = [
  {
    id: '1',
    userId: '12345678',
    userName: 'Juan Pérez',
    action: 'Inicio de sesión',
    module: 'Autenticación',
    details: 'Usuario inició sesión exitosamente',
    timestamp: '2024-01-15T08:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'low'
  },
  {
    id: '2',
    userId: '12345678',
    userName: 'Juan Pérez',
    action: 'Creación de usuario',
    module: 'Usuarios',
    details: 'Creó nuevo usuario: María García (87654321)',
    timestamp: '2024-01-15T09:15:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'medium'
  },
  {
    id: '3',
    userId: '87654321',
    userName: 'María García',
    action: 'Modificación de permisos',
    module: 'Usuarios',
    details: 'Modificó permisos del usuario Carlos López',
    timestamp: '2024-01-15T10:45:00Z',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'high'
  },
  {
    id: '4',
    userId: '12345678',
    userName: 'Juan Pérez',
    action: 'Eliminación de usuario',
    module: 'Usuarios',
    details: 'Eliminó usuario: Ana Martínez (55667788)',
    timestamp: '2024-01-15T11:20:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'critical'
  },
  {
    id: '5',
    userId: '11223344',
    userName: 'Carlos López',
    action: 'Consulta de reportes',
    module: 'Reportes',
    details: 'Generó reporte de asistencia mensual',
    timestamp: '2024-01-15T14:30:00Z',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'low'
  },
  {
    id: '6',
    userId: '87654321',
    userName: 'María García',
    action: 'Importación masiva',
    module: 'Usuarios',
    details: 'Importó 25 usuarios desde archivo Excel',
    timestamp: '2024-01-15T15:45:00Z',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'medium'
  }
];

const UserActivityLog: React.FC<UserActivityLogProps> = ({ isOpen, onClose, userId }) => {
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivities);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>(mockActivities);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const modules = [...new Set(activities.map(a => a.module))];
  const severities = ['low', 'medium', 'high', 'critical'];

  useEffect(() => {
    let filtered = activities;

    // Filtrar por usuario específico si se proporciona
    if (userId) {
      filtered = filtered.filter(activity => activity.userId === userId);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por módulo
    if (selectedModule) {
      filtered = filtered.filter(activity => activity.module === selectedModule);
    }

    // Filtrar por severidad
    if (selectedSeverity) {
      filtered = filtered.filter(activity => activity.severity === selectedSeverity);
    }

    // Filtrar por rango de fechas
    if (dateRange.start) {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [activities, searchTerm, selectedModule, selectedSeverity, dateRange, userId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Eye className="h-4 w-4" />;
      case 'medium':
        return <Edit className="h-4 w-4" />;
      case 'high':
        return <Shield className="h-4 w-4" />;
      case 'critical':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedModule('');
    setSelectedSeverity('');
    setDateRange({ start: '', end: '' });
  };

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

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
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {userId ? 'Historial de Usuario' : 'Registro de Actividades'}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filtros */}
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  label=""
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  error={null}
                  className="pl-10"
                />
              </div>

              <div>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los módulos</option>
                  {modules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las severidades</option>
                  {severities.map(severity => (
                    <option key={severity} value={severity}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fecha inicio"
                id="startDate"
                name="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                error={null}
              />

              <Input
                label="Fecha fin"
                id="endDate"
                name="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                error={null}
              />
            </div>
          </div>

          {/* Lista de actividades */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {paginatedActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(activity.severity)}`}>
                          {getSeverityIcon(activity.severity)}
                          <span className="capitalize">{activity.severity}</span>
                        </div>
                        <span className="text-sm text-gray-500">{activity.module}</span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{activity.action}</h3>
                      <p className="text-gray-600 text-sm mb-2">{activity.details}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{activity.userName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(activity.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>IP: {activity.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron actividades
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="border-t p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredActivities.length)} de {filteredActivities.length} actividades
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserActivityLog;