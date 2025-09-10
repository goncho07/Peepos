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
import { 
  PlusIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  class_id?: number;
  enrollment_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped';
  semester: string;
  academic_year: string;
  grade?: number;
  credits: number;
  notes?: string;
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
    credits: number;
    prerequisites?: string[];
  };
  class?: {
    id: number;
    name: string;
    schedule: string;
    capacity: number;
    enrolled_count: number;
  };
}

interface EnrollmentFormData {
  student_id: number;
  course_id: number;
  class_id?: number;
  semester: string;
  academic_year: string;
  notes?: string;
}

interface StudentEnrollmentProps {
  studentId?: number;
  courseId?: number;
  semester?: string;
}

export const StudentEnrollment: React.FC<StudentEnrollmentProps> = ({ 
  studentId, 
  courseId, 
  semester 
}) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    student_id: studentId || 0,
    course_id: courseId || 0,
    class_id: undefined,
    semester: semester || '',
    academic_year: new Date().getFullYear().toString(),
    notes: ''
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    semester: semester || '',
    academic_year: new Date().getFullYear().toString()
  });
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchEnrollments();
    if (!studentId) fetchStudents();
    if (!courseId) fetchCourses();
    fetchAvailableCourses();
  }, [studentId, courseId, filters]);

  useEffect(() => {
    if (formData.course_id) {
      fetchClassesForCourse(formData.course_id);
    }
  }, [formData.course_id]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (studentId) params.student_id = studentId;
      if (courseId) params.course_id = courseId;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.semester) params.semester = filters.semester;
      if (filters.academic_year) params.academic_year = filters.academic_year;
      
      const response = await apiService.enrollments?.getAll(params) || { data: { data: [] } };
      setEnrollments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Error al cargar las matrículas');
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

  const fetchAvailableCourses = async () => {
    try {
      const response = await apiService.courses?.getAll({ is_active: true }) || { data: { data: [] } };
      setAvailableCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };

  const fetchClassesForCourse = async (courseId: number) => {
    try {
      const response = await apiService.classes.getAll({ course_id: courseId });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEnrollment) {
        await apiService.enrollments?.update(editingEnrollment.id, formData);
        toast.success('Matrícula actualizada exitosamente');
      } else {
        await apiService.enrollments?.create(formData);
        toast.success('Matrícula creada exitosamente');
      }
      
      setIsModalOpen(false);
      setEditingEnrollment(null);
      resetForm();
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error saving enrollment:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la matrícula');
    }
  };

  const handleBulkEnrollment = async () => {
    if (selectedStudents.length === 0 || !formData.course_id) {
      toast.error('Selecciona estudiantes y un curso');
      return;
    }

    try {
      const enrollmentData = selectedStudents.map(studentId => ({
        student_id: studentId,
        course_id: formData.course_id,
        class_id: formData.class_id,
        semester: formData.semester,
        academic_year: formData.academic_year,
        notes: formData.notes
      }));

      await apiService.enrollments?.bulkCreate(enrollmentData);
      toast.success('Matrícula masiva realizada exitosamente');
      setIsBulkModalOpen(false);
      setSelectedStudents([]);
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error with bulk enrollment:', error);
      toast.error(error.response?.data?.message || 'Error en la matrícula masiva');
    }
  };

  const handleStatusChange = async (enrollmentId: number, newStatus: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped') => {
    try {
      await apiService.enrollments?.update(enrollmentId, { status: newStatus });
      toast.success('Estado de matrícula actualizado');
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error updating enrollment status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setFormData({
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      class_id: enrollment.class_id,
      semester: enrollment.semester,
      academic_year: enrollment.academic_year,
      notes: enrollment.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta matrícula?')) {
      return;
    }

    try {
      await apiService.enrollments?.delete(id);
      toast.success('Matrícula eliminada exitosamente');
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar la matrícula');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: studentId || 0,
      course_id: courseId || 0,
      class_id: undefined,
      semester: semester || '',
      academic_year: new Date().getFullYear().toString(),
      notes: ''
    });
  };

  const openCreateModal = () => {
    setEditingEnrollment(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openBulkModal = () => {
    setSelectedStudents([]);
    setIsBulkModalOpen(true);
  };

  const getStatusIcon = (status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped') => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <AcademicCapIcon className="h-5 w-5 text-blue-500" />;
      case 'dropped':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped') => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'dropped':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped') => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      case 'dropped':
        return 'Retirada';
      default:
        return status;
    }
  };

  const getEnrollmentStats = () => {
    const total = enrollments.length;
    const approved = enrollments.filter(e => e.status === 'approved').length;
    const pending = enrollments.filter(e => e.status === 'pending').length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const totalCredits = enrollments
      .filter(e => e.status === 'approved' || e.status === 'completed')
      .reduce((sum, e) => sum + e.credits, 0);
    
    return { total, approved, pending, completed, totalCredits };
  };

  const stats = getEnrollmentStats();

  const columns = [
    {
      key: 'student',
      label: 'Estudiante',
      render: (enrollment: Enrollment) => (
        <div>
          <div className="font-medium">
            {enrollment.student.user.first_name} {enrollment.student.user.last_name}
          </div>
          <div className="text-sm text-gray-500">{enrollment.student.student_code}</div>
        </div>
      )
    },
    {
      key: 'course',
      label: 'Curso',
      render: (enrollment: Enrollment) => (
        <div>
          <div className="font-medium">{enrollment.course.name}</div>
          <div className="text-sm text-gray-500">
            {enrollment.course.course_code} - {enrollment.course.credits} créditos
          </div>
        </div>
      )
    },
    {
      key: 'class',
      label: 'Clase',
      render: (enrollment: Enrollment) => (
        <div>
          {enrollment.class ? (
            <>
              <div className="font-medium">{enrollment.class.name}</div>
              <div className="text-sm text-gray-500">{enrollment.class.schedule}</div>
              <div className="text-xs text-gray-400">
                {enrollment.class.enrolled_count}/{enrollment.class.capacity} estudiantes
              </div>
            </>
          ) : (
            <span className="text-gray-400">Sin asignar</span>
          )}
        </div>
      )
    },
    {
      key: 'period',
      label: 'Período',
      render: (enrollment: Enrollment) => (
        <div className="text-sm">
          <div>{enrollment.semester}</div>
          <div className="text-gray-500">{enrollment.academic_year}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (enrollment: Enrollment) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(enrollment.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
            {getStatusLabel(enrollment.status)}
          </span>
        </div>
      )
    },
    {
      key: 'enrollment_date',
      label: 'Fecha de Matrícula',
      render: (enrollment: Enrollment) => new Date(enrollment.enrollment_date).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (enrollment: Enrollment) => (
        <div className="flex space-x-2">
          {enrollment.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(enrollment.id, 'approved')}
                className="p-1 text-green-600 hover:text-green-700"
              >
                Aprobar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(enrollment.id, 'rejected')}
                className="p-1 text-red-600 hover:text-red-700"
              >
                Rechazar
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(enrollment)}
            className="p-1"
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(enrollment.id)}
            className="p-1 text-red-600 hover:text-red-700"
          >
            Eliminar
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Aprobadas</p>
              <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completadas</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.completed}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Créditos</p>
              <p className="text-2xl font-semibold text-purple-600">{stats.totalCredits}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Matrículas
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={openBulkModal}>
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Matrícula Masiva
            </Button>
            <Button onClick={openCreateModal}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Matrícula
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
              <option value="completed">Completada</option>
              <option value="dropped">Retirada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre
            </label>
            <Input
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              placeholder="2024-1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año Académico
            </label>
            <Input
              value={filters.academic_year}
              onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
              placeholder="2024"
            />
          </div>
        </div>

        <DataTable
          data={enrollments}
          columns={columns}
          searchable
          searchPlaceholder="Buscar matrículas..."
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEnrollment(null);
          resetForm();
        }}
        title={editingEnrollment ? 'Editar Matrícula' : 'Nueva Matrícula'}
        size="lg"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value), class_id: undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar curso</option>
              {availableCourses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.name} ({course.credits} créditos)
                </option>
              ))}
            </select>
          </div>

          {classes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clase (Opcional)
              </label>
              <select
                value={formData.class_id || ''}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin asignar a clase específica</option>
                {classes.map((classItem: any) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.schedule} ({classItem.enrolled_count}/{classItem.capacity})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Semestre"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="2024-1"
              required
            />
            <Input
              label="Año Académico"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="2024"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEnrollment(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingEnrollment ? 'Actualizar' : 'Crear'} Matrícula
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Enrollment Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setSelectedStudents([]);
        }}
        title="Matrícula Masiva"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value), class_id: undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar curso</option>
                {availableCourses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            
            {classes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clase (Opcional)
                </label>
                <select
                  value={formData.class_id || ''}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin asignar</option>
                  {classes.map((classItem: any) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} - {classItem.schedule}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Semestre"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="2024-1"
              required
            />
            <Input
              label="Año Académico"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="2024"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Estudiantes ({selectedStudents.length} seleccionados)
            </label>
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {students.map((student: any) => (
                <div key={student.id} className="flex items-center p-3 border-b last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student.id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="font-medium">
                      {student.user.first_name} {student.user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{student.student_code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBulkModalOpen(false);
                setSelectedStudents([]);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleBulkEnrollment}>
              Matricular {selectedStudents.length} Estudiantes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentEnrollment;