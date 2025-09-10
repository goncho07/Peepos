import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  User,
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  FileText,
  Search,
  Filter
} from 'lucide-react';

// Interfaces
interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  hours: number;
  semester: number;
  prerequisites: string[];
  description: string;
  isElective: boolean;
}

interface Career {
  id: string;
  name: string;
  code: string;
  duration: number; // en semestres
  totalCredits: number;
  subjects: Subject[];
  description: string;
  isActive: boolean;
}

interface Schedule {
  id: string;
  subjectId: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  group: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  maxHours: number;
  currentHours: number;
}

const CurriculumPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'careers' | 'subjects' | 'schedules'>('careers');
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'career' | 'subject' | 'schedule'>('career');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState<number | null>(null);

  // Mock data
  useEffect(() => {
    setCareers([
      {
        id: '1',
        name: 'Ingeniería en Sistemas',
        code: 'IS',
        duration: 10,
        totalCredits: 240,
        subjects: [],
        description: 'Carrera enfocada en el desarrollo de software y sistemas informáticos',
        isActive: true
      },
      {
        id: '2',
        name: 'Administración de Empresas',
        code: 'AE',
        duration: 8,
        totalCredits: 200,
        subjects: [],
        description: 'Carrera orientada a la gestión empresarial y administrativa',
        isActive: true
      }
    ]);

    setSubjects([
      {
        id: '1',
        name: 'Programación I',
        code: 'PROG1',
        credits: 4,
        hours: 6,
        semester: 1,
        prerequisites: [],
        description: 'Introducción a la programación',
        isElective: false
      },
      {
        id: '2',
        name: 'Matemáticas I',
        code: 'MAT1',
        credits: 3,
        hours: 4,
        semester: 1,
        prerequisites: [],
        description: 'Fundamentos matemáticos',
        isElective: false
      },
      {
        id: '3',
        name: 'Base de Datos',
        code: 'BD1',
        credits: 4,
        hours: 6,
        semester: 3,
        prerequisites: ['1'],
        description: 'Diseño y gestión de bases de datos',
        isElective: false
      }
    ]);

    setTeachers([
      {
        id: '1',
        name: 'Dr. Juan Pérez',
        email: 'juan.perez@instituto.edu',
        specialties: ['Programación', 'Algoritmos'],
        maxHours: 20,
        currentHours: 12
      },
      {
        id: '2',
        name: 'Mg. María García',
        email: 'maria.garcia@instituto.edu',
        specialties: ['Matemáticas', 'Estadística'],
        maxHours: 18,
        currentHours: 15
      }
    ]);

    setSchedules([
      {
        id: '1',
        subjectId: '1',
        teacherId: '1',
        day: 'Lunes',
        startTime: '08:00',
        endTime: '10:00',
        classroom: 'Lab-A',
        group: 'A'
      },
      {
        id: '2',
        subjectId: '2',
        teacherId: '2',
        day: 'Martes',
        startTime: '10:00',
        endTime: '12:00',
        classroom: 'Aula-101',
        group: 'A'
      }
    ]);
  }, []);

  const openModal = (type: 'career' | 'subject' | 'schedule', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = (data: any) => {
    if (modalType === 'career') {
      if (editingItem) {
        setCareers(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...data } : c));
      } else {
        const newCareer: Career = {
          id: Date.now().toString(),
          ...data,
          subjects: [],
          isActive: true
        };
        setCareers(prev => [...prev, newCareer]);
      }
    } else if (modalType === 'subject') {
      if (editingItem) {
        setSubjects(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...data } : s));
      } else {
        const newSubject: Subject = {
          id: Date.now().toString(),
          ...data,
          prerequisites: data.prerequisites || []
        };
        setSubjects(prev => [...prev, newSubject]);
      }
    } else if (modalType === 'schedule') {
      if (editingItem) {
        setSchedules(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...data } : s));
      } else {
        const newSchedule: Schedule = {
          id: Date.now().toString(),
          ...data
        };
        setSchedules(prev => [...prev, newSchedule]);
      }
    }
    closeModal();
  };

  const handleDelete = (type: 'career' | 'subject' | 'schedule', id: string) => {
    if (type === 'career') {
      setCareers(prev => prev.filter(c => c.id !== id));
    } else if (type === 'subject') {
      setSubjects(prev => prev.filter(s => s.id !== id));
    } else if (type === 'schedule') {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === null || subject.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Materia no encontrada';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Docente no encontrado';
  };

  const renderCareersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Carreras</h3>
        <button
          onClick={() => openModal('career')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Carrera
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {careers.map((career) => (
          <motion.div
            key={career.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{career.name}</h4>
                <p className="text-sm text-gray-600">{career.code}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal('career', career)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete('career', career.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{career.duration} semestres</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>{career.totalCredits} créditos</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{career.subjects.length} materias</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">{career.description}</p>

            <div className="mt-4">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                career.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {career.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSubjectsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Materias</h3>
        <button
          onClick={() => openModal('subject')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Materia
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar materias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterSemester || ''}
          onChange={(e) => setFilterSemester(e.target.value ? parseInt(e.target.value) : null)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los semestres</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sem => (
            <option key={sem} value={sem}>Semestre {sem}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredSubjects.map((subject) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                  <span className="text-sm text-gray-600">({subject.code})</span>
                  {subject.isElective && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Electiva
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>{subject.credits} créditos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{subject.hours} horas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Semestre {subject.semester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{subject.prerequisites.length} prerrequisitos</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3">{subject.description}</p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openModal('subject', subject)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete('subject', subject.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Horarios</h3>
        <button
          onClick={() => openModal('schedule')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Horario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Docente
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
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getSubjectName(schedule.subjectId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTeacherName(schedule.teacherId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.day}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.classroom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.group}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('schedule', schedule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('schedule', schedule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planificación Curricular</h2>
        <p className="text-gray-600">Gestiona carreras, materias y horarios académicos</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'careers', label: 'Carreras', icon: GraduationCap },
            { id: 'subjects', label: 'Materias', icon: BookOpen },
            { id: 'schedules', label: 'Horarios', icon: Calendar }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'careers' && renderCareersTab()}
          {activeTab === 'subjects' && renderSubjectsTab()}
          {activeTab === 'schedules' && renderSchedulesTab()}
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingItem ? 'Editar' : 'Crear'} {modalType === 'career' ? 'Carrera' : modalType === 'subject' ? 'Materia' : 'Horario'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal content would go here - forms for each type */}
                <div className="text-center py-8 text-gray-500">
                  Formulario de {modalType} (implementar según necesidades específicas)
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave({})}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurriculumPlanner;