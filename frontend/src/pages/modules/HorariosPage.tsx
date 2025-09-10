import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, BookOpen, MapPin, Filter, Download, Plus, Edit, Eye } from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';

interface ScheduleItem {
  id: string;
  subject: string;
  teacher: string;
  classroom: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  grade: string;
  section: string;
  color: string;
}

const mockSchedule: ScheduleItem[] = [
  {
    id: '1',
    subject: 'Matemáticas',
    teacher: 'Prof. López',
    classroom: 'Aula 101',
    startTime: '08:00',
    endTime: '09:30',
    dayOfWeek: 1, // Monday
    grade: '10°',
    section: 'A',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    subject: 'Historia',
    teacher: 'Prof. Martínez',
    classroom: 'Aula 102',
    startTime: '09:45',
    endTime: '11:15',
    dayOfWeek: 1,
    grade: '10°',
    section: 'A',
    color: 'bg-green-500'
  },
  {
    id: '3',
    subject: 'Ciencias',
    teacher: 'Prof. González',
    classroom: 'Lab 201',
    startTime: '11:30',
    endTime: '13:00',
    dayOfWeek: 1,
    grade: '10°',
    section: 'A',
    color: 'bg-purple-500'
  },
  {
    id: '4',
    subject: 'Inglés',
    teacher: 'Prof. Smith',
    classroom: 'Aula 103',
    startTime: '14:00',
    endTime: '15:30',
    dayOfWeek: 1,
    grade: '10°',
    section: 'A',
    color: 'bg-orange-500'
  },
  {
    id: '5',
    subject: 'Educación Física',
    teacher: 'Prof. Rodríguez',
    classroom: 'Gimnasio',
    startTime: '08:00',
    endTime: '09:30',
    dayOfWeek: 2, // Tuesday
    grade: '10°',
    section: 'A',
    color: 'bg-red-500'
  },
  {
    id: '6',
    subject: 'Arte',
    teacher: 'Prof. Morales',
    classroom: 'Taller Arte',
    startTime: '09:45',
    endTime: '11:15',
    dayOfWeek: 2,
    grade: '10°',
    section: 'A',
    color: 'bg-pink-500'
  },
  {
    id: '7',
    subject: 'Química',
    teacher: 'Prof. Vega',
    classroom: 'Lab 202',
    startTime: '11:30',
    endTime: '13:00',
    dayOfWeek: 3, // Wednesday
    grade: '11°',
    section: 'B',
    color: 'bg-indigo-500'
  },
  {
    id: '8',
    subject: 'Filosofía',
    teacher: 'Prof. Herrera',
    classroom: 'Aula 205',
    startTime: '14:00',
    endTime: '15:30',
    dayOfWeek: 4, // Thursday
    grade: '11°',
    section: 'A',
    color: 'bg-teal-500'
  }
];

const timeSlots = [
  '08:00 - 09:30',
  '09:45 - 11:15',
  '11:30 - 13:00',
  '14:00 - 15:30',
  '15:45 - 17:15'
];

const daysOfWeek = [
  { id: 1, name: 'Lunes', short: 'L' },
  { id: 2, name: 'Martes', short: 'M' },
  { id: 3, name: 'Miércoles', short: 'X' },
  { id: 4, name: 'Jueves', short: 'J' },
  { id: 5, name: 'Viernes', short: 'V' },
  { id: 6, name: 'Sábado', short: 'S' }
];

const HorariosPage: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState('10°');
  const [selectedSection, setSelectedSection] = useState('A');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchedule = mockSchedule.filter(item => {
    const matchesGrade = selectedGrade === 'all' || item.grade === selectedGrade;
    const matchesSection = selectedSection === 'all' || item.section === selectedSection;
    const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.classroom.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesGrade && matchesSection && matchesSearch;
  });

  const getScheduleForTimeSlot = (dayId: number, timeSlotIndex: number) => {
    return filteredSchedule.find(item => {
      const itemTimeSlot = `${item.startTime} - ${item.endTime}`;
      return item.dayOfWeek === dayId && itemTimeSlot === timeSlots[timeSlotIndex];
    });
  };

  const grades = [...new Set(mockSchedule.map(item => item.grade))];
  const sections = [...new Set(mockSchedule.map(item => item.section))];

  const scheduleStats = {
    totalClasses: filteredSchedule.length,
    totalTeachers: new Set(filteredSchedule.map(item => item.teacher)).size,
    totalSubjects: new Set(filteredSchedule.map(item => item.subject)).size,
    totalClassrooms: new Set(filteredSchedule.map(item => item.classroom)).size
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Horarios Académicos
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión y visualización de horarios de clases
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Horario
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar materia, profesor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grado
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los grados</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las secciones</option>
              {sections.map(section => (
                <option key={section} value={section}>Sección {section}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista
            </label>
            <div className="flex rounded-md border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cuadrícula
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-l ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
          
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clases</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleStats.totalClasses}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profesores</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleStats.totalTeachers}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Materias</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleStats.totalSubjects}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aulas</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleStats.totalClassrooms}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Schedule Content */}
      {viewMode === 'grid' ? (
        /* Grid View - Weekly Schedule */
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Horario Semanal - {selectedGrade} Sección {selectedSection}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-7 bg-gray-50">
                <div className="p-4 text-sm font-medium text-gray-500 border-r border-gray-200">
                  Horario
                </div>
                {daysOfWeek.map(day => (
                  <div key={day.id} className="p-4 text-sm font-medium text-gray-500 text-center border-r border-gray-200">
                    {day.name}
                  </div>
                ))}
              </div>
              
              {/* Time Slots */}
              {timeSlots.map((timeSlot, timeIndex) => (
                <div key={timeSlot} className="grid grid-cols-7 border-b border-gray-200">
                  <div className="p-4 text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-200">
                    {timeSlot}
                  </div>
                  {daysOfWeek.map(day => {
                    const scheduleItem = getScheduleForTimeSlot(day.id, timeIndex);
                    return (
                      <div key={`${day.id}-${timeIndex}`} className="p-2 border-r border-gray-200 min-h-[100px]">
                        {scheduleItem && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${scheduleItem.color} text-white p-3 rounded-lg h-full flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity`}
                          >
                            <div>
                              <div className="font-semibold text-sm mb-1">
                                {scheduleItem.subject}
                              </div>
                              <div className="text-xs opacity-90">
                                {scheduleItem.teacher}
                              </div>
                            </div>
                            <div className="text-xs opacity-90 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {scheduleItem.classroom}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Horarios ({filteredSchedule.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Día
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado/Sección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedule.map((item, index) => {
                  const dayName = daysOfWeek.find(d => d.id === item.dayOfWeek)?.name || 'N/A';
                  
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                          <div className="text-sm font-medium text-gray-900">{item.subject}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.teacher}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {item.startTime} - {item.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {item.classroom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.grade} - {item.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredSchedule.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay horarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron horarios con los filtros aplicados.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default HorariosPage;