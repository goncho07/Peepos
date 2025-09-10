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
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Course {
  id: number;
  course_code: string;
  name: string;
  description?: string;
  credits: number;
  hours_per_week: number;
  department?: string;
  level: string;
  semester?: string;
  academic_year?: string;
  prerequisites?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  classes_count?: number;
  students_count?: number;
  teachers_count?: number;
}

interface CourseFormData {
  course_code: string;
  name: string;
  description?: string;
  credits: number;
  hours_per_week: number;
  department?: string;
  level: string;
  semester?: string;
  academic_year?: string;
  prerequisites?: string[];
  is_active: boolean;
}

interface CourseManagerProps {
  departmentFilter?: string;
  levelFilter?: string;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ 
  departmentFilter, 
  levelFilter 
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    course_code: '',
    name: '',
    description: '',
    credits: 3,
    hours_per_week: 4,
    department: '',
    level: 'undergraduate',
    semester: '',
    academic_year: new Date().getFullYear().toString(),
    prerequisites: [],
    is_active: true
  });
  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState({
    department: departmentFilter || '',
    level: levelFilter || '',
    is_active: 'all'
  });
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCourses();
    fetchAvailableCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.department) params.department = filters.department;
      if (filters.level) params.level = filters.level;
      if (filters.is_active !== 'all') params.is_active = filters.is_active === 'true';
      
      const response = await apiService.courses?.getAll(params) || { data: { data: [] } };
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await apiService.courses?.getAll() || { data: { data: [] } };
      setAvailableCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCourse) {
        await apiService.courses?.update(editingCourse.id, formData);
        toast.success('Curso actualizado exitosamente');
      } else {
        await apiService.courses?.create(formData);
        toast.success('Curso creado exitosamente');
      }
      
      setIsModalOpen(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el curso');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      name: course.name,
      description: course.description || '',
      credits: course.credits,
      hours_per_week: course.hours_per_week,
      department: course.department || '',
      level: course.level,
      semester: course.semester || '',
      academic_year: course.academic_year || '',
      prerequisites: course.prerequisites || [],
      is_active: course.is_active
    });
    setIsModalOpen(true);
  };

  const handleView = (course: Course) => {
    setViewingCourse(course);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      return;
    }

    try {
      await apiService.courses?.delete(id);
      toast.success('Curso eliminado exitosamente');
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el curso');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiService.courses?.update(id, { is_active: !currentStatus });
      toast.success(`Curso ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      fetchCourses();
    } catch (error: any) {
      console.error('Error toggling course status:', error);
      toast.error('Error al cambiar el estado del curso');
    }
  };

  const resetForm = () => {
    setFormData({
      course_code: '',
      name: '',
      description: '',
      credits: 3,
      hours_per_week: 4,
      department: '',
      level: 'undergraduate',
      semester: '',
      academic_year: new Date().getFullYear().toString(),
      prerequisites: [],
      is_active: true
    });
    setPrerequisiteInput('');
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    resetForm();
    setIsModalOpen(true);
  };

  const addPrerequisite = () => {
    if (prerequisiteInput.trim() && !formData.prerequisites?.includes(prerequisiteInput.trim())) {
      setFormData({
        ...formData,
        prerequisites: [...(formData.prerequisites || []), prerequisiteInput.trim()]
      });
      setPrerequisiteInput('');
    }
  };

  const removePrerequisite = (prerequisite: string) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites?.filter(p => p !== prerequisite) || []
    });
  };

  const getCourseStats = () => {
    const total = courses.length;
    const active = courses.filter(c => c.is_active).length;
    const inactive = total - active;
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    
    return { total, active, inactive, totalCredits };
  };

  const stats = getCourseStats();

  const columns = [
    {
      key: 'course_info',
      label: 'Información del Curso',
      render: (course: Course) => (
        <div>
          <div className="font-medium text-gray-900">{course.name}</div>
          <div className="text-sm text-gray-500">{course.course_code}</div>
          {course.department && (
            <div className="text-xs text-gray-400">{course.department}</div>
          )}
        </div>
      )
    },
    {
      key: 'academic_info',
      label: 'Información Académica',
      render: (course: Course) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <AcademicCapIcon className="h-4 w-4 text-blue-500" />
            <span>{course.credits} créditos</span>
          </div>
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4 text-green-500" />
            <span>{course.hours_per_week}h/semana</span>
          </div>
          <div className="text-xs text-gray-500 capitalize">{course.level}</div>
        </div>
      )
    },
    {
      key: 'semester_info',
      label: 'Período Académico',
      render: (course: Course) => (
        <div className="text-sm">
          {course.semester && (
            <div className="font-medium">{course.semester}</div>
          )}
          {course.academic_year && (
            <div className="text-gray-500">{course.academic_year}</div>
          )}
        </div>
      )
    },
    {
      key: 'statistics',
      label: 'Estadísticas',
      render: (course: Course) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="h-4 w-4 text-purple-500" />
            <span>{course.students_count || 0} estudiantes</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpenIcon className="h-4 w-4 text-orange-500" />
            <span>{course.classes_count || 0} clases</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (course: Course) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          course.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {course.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (course: Course) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(course)}
            className="p-1"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(course)}
            className="p-1"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(course.id, course.is_active)}
            className={`p-1 ${
              course.is_active 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            {course.is_active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(course.id)}
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Cursos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activos</p>
              <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactivos</p>
              <p className="text-2xl font-semibold text-red-600">{stats.inactive}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Créditos</p>
              <p className="text-2xl font-semibold text-purple-600">{stats.totalCredits}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Cursos
          </h2>
          <Button onClick={openCreateModal}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los departamentos</option>
              <option value="computer_science">Ciencias de la Computación</option>
              <option value="mathematics">Matemáticas</option>
              <option value="physics">Física</option>
              <option value="chemistry">Química</option>
              <option value="biology">Biología</option>
              <option value="engineering">Ingeniería</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel
            </label>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los niveles</option>
              <option value="undergraduate">Pregrado</option>
              <option value="graduate">Posgrado</option>
              <option value="doctorate">Doctorado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        <DataTable
          data={courses}
          columns={columns}
          searchable
          searchPlaceholder="Buscar cursos..."
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
          resetForm();
        }}
        title={editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código del Curso"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              placeholder="CS101"
              required
            />
            <Input
              label="Nombre del Curso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Introducción a la Programación"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descripción del curso..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Créditos"
              type="number"
              value={formData.credits.toString()}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              min="1"
              max="10"
              required
            />
            <Input
              label="Horas por Semana"
              type="number"
              value={formData.hours_per_week.toString()}
              onChange={(e) => setFormData({ ...formData, hours_per_week: parseInt(e.target.value) })}
              min="1"
              max="20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar departamento</option>
                <option value="computer_science">Ciencias de la Computación</option>
                <option value="mathematics">Matemáticas</option>
                <option value="physics">Física</option>
                <option value="chemistry">Química</option>
                <option value="biology">Biología</option>
                <option value="engineering">Ingeniería</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="undergraduate">Pregrado</option>
                <option value="graduate">Posgrado</option>
                <option value="doctorate">Doctorado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Semestre"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="2024-1"
            />
            <Input
              label="Año Académico"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="2024"
            />
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prerrequisitos
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={prerequisiteInput}
                onChange={(e) => setPrerequisiteInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Código del curso prerrequisito"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              />
              <Button type="button" onClick={addPrerequisite}>
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites?.map((prerequisite, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {prerequisite}
                  <button
                    type="button"
                    onClick={() => removePrerequisite(prerequisite)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Curso activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCourse(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingCourse ? 'Actualizar' : 'Crear'} Curso
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingCourse(null);
        }}
        title="Detalles del Curso"
        size="lg"
      >
        {viewingCourse && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{viewingCourse.name}</h3>
                <p className="text-sm text-gray-500">{viewingCourse.course_code}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  viewingCourse.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {viewingCourse.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {viewingCourse.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700">{viewingCourse.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Información Académica</h4>
                <div className="space-y-1 text-sm">
                  <div>Créditos: {viewingCourse.credits}</div>
                  <div>Horas por semana: {viewingCourse.hours_per_week}</div>
                  <div>Nivel: {viewingCourse.level}</div>
                  {viewingCourse.department && (
                    <div>Departamento: {viewingCourse.department}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Período Académico</h4>
                <div className="space-y-1 text-sm">
                  {viewingCourse.semester && (
                    <div>Semestre: {viewingCourse.semester}</div>
                  )}
                  {viewingCourse.academic_year && (
                    <div>Año académico: {viewingCourse.academic_year}</div>
                  )}
                </div>
              </div>
            </div>

            {viewingCourse.prerequisites && viewingCourse.prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Prerrequisitos</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingCourse.prerequisites.map((prerequisite, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {prerequisite}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{viewingCourse.students_count || 0}</div>
                  <div className="text-sm text-gray-500">Estudiantes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{viewingCourse.classes_count || 0}</div>
                  <div className="text-sm text-gray-500">Clases</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{viewingCourse.teachers_count || 0}</div>
                  <div className="text-sm text-gray-500">Profesores</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(viewingCourse);
                }}
              >
                Editar Curso
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingCourse(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseManager;