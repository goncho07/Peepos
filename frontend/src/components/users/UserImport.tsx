import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Users, Eye } from 'lucide-react';
import { Button, Card } from '../ui';

interface ImportedUser {
  dni: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  area: string;
  status: 'valid' | 'error' | 'warning';
  errors: string[];
}

interface UserImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (users: ImportedUser[]) => void;
}

const UserImport: React.FC<UserImportProps> = ({ isOpen, onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importedUsers, setImportedUsers] = useState<ImportedUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      alert('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)');
      return;
    }
    
    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    // Simular procesamiento del archivo
    // En una implementación real, aquí usarías una librería como xlsx o papaparse
    setTimeout(() => {
      const mockData: ImportedUser[] = [
        {
          dni: '12345678',
          name: 'Juan Pérez García',
          email: 'juan.perez@email.com',
          phone: '987654321',
          role: 'Docente',
          area: 'Académico',
          status: 'valid',
          errors: []
        },
        {
          dni: '87654321',
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '987654322',
          role: 'Coordinadora',
          area: 'Académico',
          status: 'valid',
          errors: []
        },
        {
          dni: '11223344',
          name: 'Carlos López',
          email: 'carlos.lopez',
          phone: '987654323',
          role: 'Administrador',
          area: 'Sistemas',
          status: 'error',
          errors: ['Email inválido']
        },
        {
          dni: '55667788',
          name: 'Ana Martínez',
          email: 'ana.martinez@email.com',
          phone: '',
          role: 'Asistente',
          area: 'Administración',
          status: 'warning',
          errors: ['Teléfono faltante']
        }
      ];
      
      setImportedUsers(mockData);
      setStep('preview');
      setIsProcessing(false);
    }, 2000);
  };

  const handleImport = () => {
    const validUsers = importedUsers.filter(user => user.status === 'valid' || user.status === 'warning');
    onImport(validUsers);
    setStep('complete');
  };

  const downloadTemplate = () => {
    // En una implementación real, generarías y descargarías un archivo Excel template
    const csvContent = "DNI,Nombre,Email,Teléfono,Rol,Área\n12345678,Juan Pérez,juan@email.com,987654321,Docente,Académico";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_usuarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setImportedUsers([]);
    setStep('upload');
    setIsProcessing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const validCount = importedUsers.filter(u => u.status === 'valid').length;
  const warningCount = importedUsers.filter(u => u.status === 'warning').length;
  const errorCount = importedUsers.filter(u => u.status === 'error').length;

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
            <h2 className="text-2xl font-bold text-gray-900">Importar Usuarios</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6">
            {step === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <FileSpreadsheet className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Importar usuarios desde Excel
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Sube un archivo Excel o CSV con la información de los usuarios
                  </p>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arrastra tu archivo aquí
                  </p>
                  <p className="text-gray-600 mb-4">
                    o haz clic para seleccionar
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4"
                  >
                    Seleccionar Archivo
                  </Button>
                  <p className="text-sm text-gray-500">
                    Formatos soportados: .xlsx, .xls, .csv (máximo 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">¿No tienes una plantilla?</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Descarga nuestra plantilla de Excel con el formato correcto
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Plantilla
                      </Button>
                    </div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Procesando archivo...</p>
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Vista previa de importación
                  </h3>
                  <Button variant="outline" onClick={resetImport}>
                    Cambiar archivo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Válidos</p>
                        <p className="text-2xl font-bold text-green-900">{validCount}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </Card>

                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-700">Advertencias</p>
                        <p className="text-2xl font-bold text-yellow-900">{warningCount}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-yellow-500" />
                    </div>
                  </Card>

                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-700">Errores</p>
                        <p className="text-2xl font-bold text-red-900">{errorCount}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </Card>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {importedUsers.map((user, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getStatusColor(user.status)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(user.status)}
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div>DNI: {user.dni}</div>
                              <div>Email: {user.email}</div>
                              <div>Rol: {user.role}</div>
                              <div>Área: {user.area}</div>
                            </div>
                            {user.errors.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-red-700">Errores:</p>
                                <ul className="text-sm text-red-600 list-disc list-inside">
                                  {user.errors.map((error, errorIndex) => (
                                    <li key={errorIndex}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Nota:</strong> Solo se importarán los usuarios válidos y con advertencias.
                    Los usuarios con errores deben ser corregidos antes de la importación.
                  </p>
                  <p className="text-sm text-gray-600">
                    Se importarán {validCount + warningCount} de {importedUsers.length} usuarios.
                  </p>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Importación completada
                </h3>
                <p className="text-gray-600 mb-6">
                  Se han importado {validCount + warningCount} usuarios exitosamente
                </p>
                <Button onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            )}
          </div>

          {step === 'preview' && (
            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validCount + warningCount === 0}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Importar {validCount + warningCount} Usuarios
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserImport;