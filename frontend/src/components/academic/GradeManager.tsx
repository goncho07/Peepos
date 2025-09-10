import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import DataTable from '../ui/DataTable';
import Loading from '../ui/Loading';
import { apiService } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Grade {
  id: number;
  student_id: number;
  course_id: number;
  class_id: number;
  evaluation_type: string;
  score: number;
  max_score: number;
  weight: number;
  evaluation_date: string;
  comments?: string;
  student: {
    id: number;
    student_code: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  course: {
    id: number;
    name: string;
    course_code: string;
  };
  class: {
    id: number;
    name: string;
  };
}

interface GradeFormData {
  student_id: number;
  course_id: number;
  class_id: number;
  evaluation_type: string;
  score: number;
  max_score: number;
  weight: number;
  evaluation_date: string;
  comments?: string;
}

interface GradeManagerProps {
  classId?: number;
  courseId?: number;
  studentId?: number;
}

export const GradeManager: React.FC<GradeManagerProps> = ({ 
  classId, 
  courseId, 
  studentId 
}) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState<GradeFormData>({
    student_id: studentId || 0,
    course_id: courseId || 0,
    class_id: classId || 0,
    evaluation_type: 'exam',
    score: 0,
    max_score: 100,
    weight: 1,
    evaluation_date: new Date().toISOString().split('T')[0],
    comments: ''
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchGrades();
    if (!studentId) fetchStudents();
    if (!courseId) fetchCourses();
    if (!classId) fetchClasses();
  }, [classId, courseId, studentId]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (classId) params.class_id = classId;
      if (courseId) params.course_id = courseId;
      if (studentId) params.student_id = studentId;
      
      const response = await apiService.grades.getAll(params);
      setGrades(response.data.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Error al cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiService.students.getAll();
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiService.courses?.getAll() || { data: { data: [] } };
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiService.classes.getAll();
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingGrade) {
        await apiService.grades.update(editingGrade.id, formData);
        toast.success('Calificación actualizada exitosamente');
      } else {
        await apiService.grades.create(formData);
        toast.success('Calificación creada exitosamente');
      }
      
      setIsModalOpen(false);
      setEditingGrade(null);
      resetForm();
      fetchGrades();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la calificación');
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      student_id: grade.student_id,
      course_id: grade.course_id,
      class_id: grade.class_id,
      evaluation_type: grade.evaluation_type,
      score: grade.score,
      max_score: grade.max_score,
      weight: grade.weight,
      evaluation_date: grade.evaluation_date.split('T')[0],
      comments: grade.comments || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta calificación?')) {
      return;
    }

    try {
      await apiService.grades.delete(id);
      toast.success('Calificación eliminada exitosamente');
      fetchGrades();
    } catch (error: any) {
      console.error('Error deleting grade:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar la calificación');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: studentId || 0,
      course_id: courseId || 0,
      class_id: classId || 0,
      evaluation_type: 'exam',
      score: 0,
      max_score: 100,
      weight: 1,
      evaluation_date: new Date().toISOString().split('T')[0],
      comments: ''
    });
  };

  const openCreateModal = () => {
    setEditingGrade(null);
    resetForm();
    setIsModalOpen(true);
  };

  const getPercentage = (score: number, maxScore: number) => {
    return ((score / maxScore) * 100).toFixed(1);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const columns = [
    {
      key: 'student',
      label: 'Estudiante',
      render: (grade: Grade) => (
        <div>
          <div className="font-medium">
            {grade.student.user.first_name} {grade.student.user.last_name}
          </div>
          <div className="text-sm text-gray-500">{grade.student.student_code}</div>
        </div>
      )
    },
    {
      key: 'course',
      label: 'Curso',
      render: (grade: Grade) => (
        <div>
          <div className="font-medium">{grade.course.name}</div>
          <div className="text-sm text-gray-500">{grade.course.course_code}</div>
        </div>
      )
    },
    {
      key: 'evaluation_type',
      label: 'Tipo de Evaluación',
      render: (grade: Grade) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {grade.evaluation_type}
        </span>
      )
    },
    {
      key: 'score',
      label: 'Calificación',
      render: (grade: Grade) => {
        const percentage = parseFloat(getPercentage(grade.score, grade.max_score));
        return (
          <div className="text-center">
            <div className={`font-bold ${getGradeColor(percentage)}`}>
              {grade.score}/{grade.max_score}
            </div>
            <div className={`text-sm ${getGradeColor(percentage)}`}>
              {percentage}%
            </div>
          </div>
        );
      }
    },
    {
      key: 'weight',
      label: 'Peso',
      render: (grade: Grade) => `${grade.weight}x`
    },
    {
      key: 'evaluation_date',
      label: 'Fecha',
      render: (grade: Grade) => new Date(grade.evaluation_date).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (grade: Grade) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(grade)}
            className="p-1"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(grade.id)}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Calificaciones
          </h2>
          <Button onClick={openCreateModal}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Calificación
          </Button>
        </div>

        <DataTable
          data={grades}
          columns={columns}
          searchable
          searchPlaceholder="Buscar calificaciones..."
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGrade(null);
          resetForm();
        }}
        title={editingGrade ? 'Editar Calificación' : 'Nueva Calificación'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!studentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante
              </label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar estudiante</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.user.first_name} {student.user.last_name} - {student.student_code}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!courseId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar curso</option>
                {courses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!classId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clase
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar clase</option>
                {classes.map((classItem: any) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evaluación
            </label>
            <select
              value={formData.evaluation_type}
              onChange={(e) => setFormData({ ...formData, evaluation_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="exam">Examen</option>
              <option value="quiz">Quiz</option>
              <option value="homework">Tarea</option>
              <option value="project">Proyecto</option>
              <option value="participation">Participación</option>
              <option value="final">Examen Final</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Puntuación"
              type="number"
              value={formData.score.toString()}
              onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
              min="0"
              step="0.1"
              required
            />
            <Input
              label="Puntuación Máxima"
              type="number"
              value={formData.max_score.toString()}
              onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })}
              min="1"
              step="0.1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Peso"
              type="number"
              value={formData.weight.toString()}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              min="0.1"
              step="0.1"
              required
            />
            <Input
              label="Fecha de Evaluación"
              type="date"
              value={formData.evaluation_date}
              onChange={(e) => setFormData({ ...formData, evaluation_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Comentarios adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingGrade(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingGrade ? 'Actualizar' : 'Crear'} Calificación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradeManager;