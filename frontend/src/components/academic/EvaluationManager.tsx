import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Clock,
  FileText,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Interfaces
interface Evaluation {
  id: string;
  title: string;
  type: 'exam' | 'assignment' | 'project' | 'quiz';
  subjectId: string;
  teacherId: string;
  date: string;
  duration: number; // en minutos
  totalPoints: number;
  description: string;
  instructions: string;
  status: 'draft' | 'published' | 'active' | 'completed';
  isOnline: boolean;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
}

interface Grade {
  id: string;
  evaluationId: string;
  studentId: string;
  score: number;
  maxScore: number;
  submissionDate: string;
  feedback: string;
  isLate: boolean;
  status: 'pending' | 'graded' | 'reviewed';
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentCode: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface EvaluationStats {
  totalEvaluations: number;
  activeEvaluations: number;
  pendingGrades: number;
  averageScore: number;
  completionRate: number;
}

const EvaluationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'evaluations' | 'grades' | 'analytics'>('evaluations');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'evaluation' | 'grade' | 'bulk-grade'>('evaluation');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [stats, setStats] = useState<EvaluationStats>({
    totalEvaluations: 0,
    activeEvaluations: 0,
    pendingGrades: 0,
    averageScore: 0,
    completionRate: 0
  });

  // Mock data
  useEffect(() => {
    setSubjects([
      { id: '1', name: 'Programación I', code: 'PROG1' },
      { id: '2', name: 'Matemáticas I', code: 'MAT1' },
      { id: '3', name: 'Base de Datos', code: 'BD1' }
    ]);

    setStudents([
      { id: '1', name: 'Ana García', email: 'ana.garcia@estudiante.edu', studentCode: 'EST001' },
      { id: '2', name: 'Carlos López', email: 'carlos.lopez@estudiante.edu', studentCode: 'EST002' },
      { id: '3', name: 'María Rodríguez', email: 'maria.rodriguez@estudiante.edu', studentCode: 'EST003' },
      { id: '4', name: 'Juan Pérez', email: 'juan.perez@estudiante.edu', studentCode: 'EST004' }
    ]);

    setEvaluations([
      {
        id: '1',
        title: 'Examen Parcial - Algoritmos',
        type: 'exam',
        subjectId: '1',
        teacherId: 'teacher1',
        date: '2024-02-15',
        duration: 120,
        totalPoints: 100,
        description: 'Examen sobre algoritmos básicos y estructuras de datos',
        instructions: 'Responder todas las preguntas. Tiempo límite: 2 horas.',
        status: 'completed',
        isOnline: false,
        allowLateSubmission: false,
        lateSubmissionPenalty: 0
      },
      {
        id: '2',
        title: 'Proyecto Final - Sistema Web',
        type: 'project',
        subjectId: '1',
        teacherId: 'teacher1',
        date: '2024-03-01',
        duration: 0,
        totalPoints: 200,
        description: 'Desarrollo de un sistema web completo',
        instructions: 'Entregar código fuente, documentación y presentación.',
        status: 'active',
        isOnline: true,
        allowLateSubmission: true,
        lateSubmissionPenalty: 10
      },
      {
        id: '3',
        title: 'Quiz - Derivadas',
        type: 'quiz',
        subjectId: '2',
        teacherId: 'teacher2',
        date: '2024-02-20',
        duration: 30,
        totalPoints: 50,
        description: 'Quiz rápido sobre derivadas básicas',
        instructions: 'Responder en 30 minutos máximo.',
        status: 'published',
        isOnline: true,
        allowLateSubmission: false,
        lateSubmissionPenalty: 0
      }
    ]);

    setGrades([
      {
        id: '1',
        evaluationId: '1',
        studentId: '1',
        score: 85,
        maxScore: 100,
        submissionDate: '2024-02-15T10:30:00',
        feedback: 'Buen trabajo en general, revisar algoritmos de ordenamiento.',
        isLate: false,
        status: 'graded'
      },
      {
        id: '2',
        evaluationId: '1',
        studentId: '2',
        score: 92,
        maxScore: 100,
        submissionDate: '2024-02-15T09:45:00',
        feedback: 'Excelente comprensión de los conceptos.',
        isLate: false,
        status: 'graded'
      },
      {
        id: '3',
        evaluationId: '2',
        studentId: '1',
        score: 0,
        maxScore: 200,
        submissionDate: '',
        feedback: '',
        isLate: false,
        status: 'pending'
      },
      {
        id: '4',
        evaluationId: '3',
        studentId: '3',
        score: 45,
        maxScore: 50,
        submissionDate: '2024-02-20T14:25:00',
        feedback: 'Muy bien, solo un pequeño error en la última pregunta.',
        isLate: false,
        status: 'graded'
      }
    ]);
  }, []);

  // Calculate stats
  useEffect(() => {
    const totalEvaluations = evaluations.length;
    const activeEvaluations = evaluations.filter(e => e.status === 'active' || e.status === 'published').length;
    const pendingGrades = grades.filter(g => g.status === 'pending').length;
    const gradedGrades = grades.filter(g => g.status === 'graded' && g.score > 0);
    const averageScore = gradedGrades.length > 0 
      ? gradedGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / gradedGrades.length
      : 0;
    const completionRate = grades.length > 0 
      ? (grades.filter(g => g.status === 'graded').length / grades.length) * 100
      : 0;

    setStats({
      totalEvaluations,
      activeEvaluations,
      pendingGrades,
      averageScore,
      completionRate
    });
  }, [evaluations, grades]);

  const openModal = (type: 'evaluation' | 'grade' | 'bulk-grade', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = (data: any) => {
    if (modalType === 'evaluation') {
      if (editingItem) {
        setEvaluations(prev => prev.map(e => e.id === editingItem.id ? { ...e, ...data } : e));
      } else {
        const newEvaluation: Evaluation = {
          id: Date.now().toString(),
          ...data,
          status: 'draft'
        };
        setEvaluations(prev => [...prev, newEvaluation]);
      }
    } else if (modalType === 'grade') {
      if (editingItem) {
        setGrades(prev => prev.map(g => g.id === editingItem.id ? { ...g, ...data } : g));
      } else {
        const newGrade: Grade = {
          id: Date.now().toString(),
          ...data,
          status: 'graded'
        };
        setGrades(prev => [...prev, newGrade]);
      }
    }
    closeModal();
  };

  const handleDelete = (type: 'evaluation' | 'grade', id: string) => {
    if (type === 'evaluation') {
      setEvaluations(prev => prev.filter(e => e.id !== id));
      // También eliminar calificaciones relacionadas
      setGrades(prev => prev.filter(g => g.evaluationId !== id));
    } else if (type === 'grade') {
      setGrades(prev => prev.filter(g => g.id !== id));
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Materia no encontrada';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Estudiante no encontrado';
  };

  const getEvaluationTitle = (evaluationId: string) => {
    const evaluation = evaluations.find(e => e.id === evaluationId);
    return evaluation ? evaluation.title : 'Evaluación no encontrada';
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === '' || evaluation.subjectId === selectedSubject;
    const matchesStatus = filterStatus === '' || evaluation.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const filteredGrades = grades.filter(grade => {
    const matchesEvaluation = selectedEvaluation === '' || grade.evaluationId === selectedEvaluation;
    const student = students.find(s => s.id === grade.studentId);
    const matchesSearch = !student || student.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEvaluation && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText className="w-4 h-4" />;
      case 'assignment': return <Edit className="w-4 h-4" />;
      case 'project': return <Award className="w-4 h-4" />;
      case 'quiz': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</p>
          </div>
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Evaluaciones Activas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeEvaluations}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pendientes de Calificar</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Promedio General</p>
            <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tasa de Finalización</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
          </div>
          <BarChart3 className="w-8 h-8 text-indigo-600" />
        </div>
      </div>
    </div>
  );

  const renderEvaluationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Evaluaciones</h3>
        <button
          onClick={() => openModal('evaluation')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Evaluación
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las materias</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="active">Activo</option>
          <option value="completed">Completado</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredEvaluations.map((evaluation) => (
          <motion.div
            key={evaluation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getTypeIcon(evaluation.type)}
                  <h4 className="font-semibold text-gray-900">{evaluation.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(evaluation.status)}`}>
                    {evaluation.status}
                  </span>
                  {evaluation.isOnline && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      En línea
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(evaluation.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{evaluation.duration > 0 ? `${evaluation.duration} min` : 'Sin límite'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>{evaluation.totalPoints} puntos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{getSubjectName(evaluation.subjectId)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600">{evaluation.description}</p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openModal('evaluation', evaluation)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEvaluation(evaluation.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete('evaluation', evaluation.id)}
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

  const renderGradesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Calificaciones</h3>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('bulk-grade')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Calificar en Lote
          </button>
          <button
            onClick={() => openModal('grade')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Calificación
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar estudiantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={selectedEvaluation}
          onChange={(e) => setSelectedEvaluation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las evaluaciones</option>
          {evaluations.map(evaluation => (
            <option key={evaluation.id} value={evaluation.id}>{evaluation.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade) => {
                const percentage = (grade.score / grade.maxScore) * 100;
                return (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getStudentName(grade.studentId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEvaluationTitle(grade.evaluationId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.score} / {grade.maxScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${
                        percentage >= 70 ? 'text-green-600' : 
                        percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        getStatusColor(grade.status)
                      }`}>
                        {grade.status}
                      </span>
                      {grade.isLate && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Tardía
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.submissionDate ? new Date(grade.submissionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('grade', grade)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('grade', grade.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Análisis y Reportes</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Distribución de Calificaciones</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Excelente (90-100%)</span>
              <span className="text-sm font-medium text-green-600">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bueno (80-89%)</span>
              <span className="text-sm font-medium text-blue-600">35%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Regular (70-79%)</span>
              <span className="text-sm font-medium text-yellow-600">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Insuficiente (&lt;70%)</span>
              <span className="text-sm font-medium text-red-600">15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Rendimiento por Materia</h4>
          <div className="space-y-4">
            {subjects.map((subject) => {
              const subjectGrades = grades.filter(g => {
                const evaluation = evaluations.find(e => e.id === g.evaluationId);
                return evaluation && evaluation.subjectId === subject.id && g.status === 'graded';
              });
              const average = subjectGrades.length > 0 
                ? subjectGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / subjectGrades.length
                : 0;
              
              return (
                <div key={subject.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{subject.name}</span>
                  <span className={`text-sm font-medium ${
                    average >= 80 ? 'text-green-600' : 
                    average >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {average.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Evaluaciones</h2>
        <p className="text-gray-600">Administra evaluaciones, calificaciones y análisis académico</p>
      </div>

      {renderStatsCards()}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'evaluations', label: 'Evaluaciones', icon: FileText },
            { id: 'grades', label: 'Calificaciones', icon: Award },
            { id: 'analytics', label: 'Análisis', icon: BarChart3 }
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
          {activeTab === 'evaluations' && renderEvaluationsTab()}
          {activeTab === 'grades' && renderGradesTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
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
                    {editingItem ? 'Editar' : 'Crear'} {modalType === 'evaluation' ? 'Evaluación' : modalType === 'grade' ? 'Calificación' : 'Calificación en Lote'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

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

export default EvaluationManager;