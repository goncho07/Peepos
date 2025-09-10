import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Filter, Download, UserPlus } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';

interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  status: 'enrolled' | 'pending' | 'inactive';
  enrollmentDate: string;
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ana García López',
    grade: '5to',
    section: 'A',
    status: 'enrolled',
    enrollmentDate: '2024-03-01'
  },
  {
    id: '2',
    name: 'Carlos Mendoza Silva',
    grade: '4to',
    section: 'B',
    status: 'pending',
    enrollmentDate: '2024-03-15'
  },
  {
    id: '3',
    name: 'María Rodríguez Torres',
    grade: '6to',
    section: 'A',
    status: 'enrolled',
    enrollmentDate: '2024-02-20'
  }
];

const MatriculaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Matriculado';
      case 'pending': return 'Pendiente';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matrícula</h1>
          <p className="text-gray-600 mt-1">Gestión de matrículas y inscripciones</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => {}}>
            <Download size={16} />
            Exportar
          </Button>
          <Button className="flex items-center gap-2" onClick={() => {}}>
            <UserPlus size={16} />
            Nueva Matrícula
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Input
              label="Buscar estudiante"
              id="search-student"
              name="search-student"
              error={null}
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              startIcon={Search}
            />
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los grados</option>
            <option value="1ro">1ro</option>
            <option value="2do">2do</option>
            <option value="3ro">3ro</option>
            <option value="4to">4to</option>
            <option value="5to">5to</option>
            <option value="6to">6to</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="enrolled">Matriculado</option>
            <option value="pending">Pendiente</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </Card>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Grado: {student.grade}</span>
                  <span>Sección: {student.section}</span>
                  <span>Fecha: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                  {getStatusText(student.status)}
                </span>
                <Button variant="outline" size="sm" onClick={() => {}}>
                  Ver Detalles
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron estudiantes</h3>
          <p className="mt-1 text-sm text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default MatriculaPage;