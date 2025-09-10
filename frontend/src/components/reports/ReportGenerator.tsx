import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Loading from '../ui/Loading';
import { apiService } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  DocumentArrowDownIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'academic' | 'attendance' | 'grades' | 'enrollment' | 'financial' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  parameters: ReportParameter[];
  icon: React.ReactNode;
}

interface ReportParameter {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  generated_at: string;
  generated_by: string;
  file_url?: string;
  parameters: Record<string, any>;
  status: 'generating' | 'completed' | 'failed';
  file_size?: number;
}

interface ReportFilters {
  start_date?: string;
  end_date?: string;
  semester?: string;
  academic_year?: string;
  course_id?: number;
  class_id?: number;
  student_id?: number;
  teacher_id?: number;
  department?: string;
  status?: string;
}

export const ReportGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const { user } = useAuthStore();

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'student_grades',
      name: 'Reporte de Calificaciones',
      description: 'Reporte detallado de calificaciones por estudiante, curso o período',
      type: 'grades',
      format: 'pdf',
      icon: <AcademicCapIcon className="h-6 w-6" />,
      parameters: [
        { key: 'student_id', label: 'Estudiante', type: 'select', required: false, options: [] },
        { key: 'course_id', label: 'Curso', type: 'select', required: false, options: [] },
        { key: 'semester', label: 'Semestre', type: 'text', required: false },
        { key: 'academic_year', label: 'Año Académico', type: 'text', required: true, defaultValue: new Date().getFullYear().toString() },
        { key: 'include_statistics', label: 'Incluir Estadísticas', type: 'boolean', required: false, defaultValue: true }
      ]
    },
    {
      id: 'attendance_summary',
      name: 'Resumen de Asistencia',
      description: 'Reporte de asistencia por estudiante, clase o período',
      type: 'attendance',
      format: 'excel',
      icon: <ClockIcon className="h-6 w-6" />,
      parameters: [
        { key: 'class_id', label: 'Clase', type: 'select', required: false, options: [] },
        { key: 'student_id', label: 'Estudiante', type: 'select', required: false, options: [] },
        { key: 'start_date', label: 'Fecha Inicio', type: 'date', required: true },
        { key: 'end_date', label: 'Fecha Fin', type: 'date', required: true },
        { key: 'attendance_status', label: 'Estado de Asistencia', type: 'multiselect', required: false, options: [
          { value: 'present', label: 'Presente' },
          { value: 'absent', label: 'Ausente' },
          { value: 'late', label: 'Tardanza' },
          { value: 'excused', label: 'Justificado' }
        ]}
      ]
    },
    {
      id: 'enrollment_report',
      name: 'Reporte de Matrículas',
      description: 'Estadísticas y detalles de matrículas por período',
      type: 'enrollment',
      format: 'pdf',
      icon: <UserGroupIcon className="h-6 w-6" />,
      parameters: [
        { key: 'semester', label: 'Semestre', type: 'text', required: true },
        { key: 'academic_year', label: 'Año Académico', type: 'text', required: true, defaultValue: new Date().getFullYear().toString() },
        { key: 'course_id', label: 'Curso', type: 'select', required: false, options: [] },
        { key: 'enrollment_status', label: 'Estado de Matrícula', type: 'select', required: false, options: [
          { value: 'all', label: 'Todos' },
          { value: 'approved', label: 'Aprobadas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'rejected', label: 'Rechazadas' }
        ]}
      ]
    },
    {
      id: 'academic_performance',
      name: 'Rendimiento Académico',
      description: 'Análisis completo del rendimiento académico institucional',
      type: 'academic',
      format: 'pdf',
      icon: <ChartBarIcon className="h-6 w-6" />,
      parameters: [
        { key: 'academic_year', label: 'Año Académico', type: 'text', required: true, defaultValue: new Date().getFullYear().toString() },
        { key: 'semester', label: 'Semestre', type: 'text', required: false },
        { key: 'department', label: 'Departamento', type: 'text', required: false },
        { key: 'include_charts', label: 'Incluir Gráficos', type: 'boolean', required: false, defaultValue: true },
        { key: 'include_comparisons', label: 'Incluir Comparaciones', type: 'boolean', required: false, defaultValue: true }
      ]
    },
    {
      id: 'teacher_performance',
      name: 'Reporte de Docentes',
      description: 'Evaluación y estadísticas de desempeño docente',
      type: 'academic',
      format: 'excel',
      icon: <PresentationChartLineIcon className="h-6 w-6" />,
      parameters: [
        { key: 'teacher_id', label: 'Docente', type: 'select', required: false, options: [] },
        { key: 'academic_year', label: 'Año Académico', type: 'text', required: true, defaultValue: new Date().getFullYear().toString() },
        { key: 'semester', label: 'Semestre', type: 'text', required: false },
        { key: 'include_student_feedback', label: 'Incluir Evaluaciones Estudiantiles', type: 'boolean', required: false, defaultValue: false }
      ]
    },
    {
      id: 'custom_query',
      name: 'Reporte Personalizado',
      description: 'Generar reporte con parámetros personalizados',
      type: 'custom',
      format: 'csv',
      icon: <TableCellsIcon className="h-6 w-6" />,
      parameters: [
        { key: 'query_name', label: 'Nombre del Reporte', type: 'text', required: true },
        { key: 'data_source', label: 'Fuente de Datos', type: 'select', required: true, options: [
          { value: 'students', label: 'Estudiantes' },
          { value: 'courses', label: 'Cursos' },
          { value: 'grades', label: 'Calificaciones' },
          { value: 'attendance', label: 'Asistencia' },
          { value: 'enrollments', label: 'Matrículas' }
        ]},
        { key: 'fields', label: 'Campos a Incluir', type: 'multiselect', required: true, options: [] },
        { key: 'filters', label: 'Filtros JSON', type: 'text', required: false }
      ]
    }
  ];

  useEffect(() => {
    fetchGeneratedReports();
    fetchSelectOptions();
  }, []);

  const fetchGeneratedReports = async () => {
    try {
      const response = await apiService.reports?.getAll() || { data: { data: [] } };
      setGeneratedReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchSelectOptions = async () => {
    try {
      const [coursesRes, classesRes, studentsRes, teachersRes] = await Promise.all([
        apiService.courses?.getAll() || { data: { data: [] } },
        apiService.classes.getAll(),
        apiService.students.getAll(),
        apiService.teachers.getAll()
      ]);
      
      setCourses(coursesRes.data.data || []);
      setClasses(classesRes.data.data || []);
      setStudents(studentsRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching select options:', error);
    }
  };

  const updateTemplateOptions = (template: ReportTemplate) => {
    const updatedTemplate = { ...template };
    
    updatedTemplate.parameters = template.parameters.map(param => {
      if (param.key === 'student_id') {
        return {
          ...param,
          options: students.map((student: any) => ({
            value: student.id.toString(),
            label: `${student.user.first_name} ${student.user.last_name} - ${student.student_code}`
          }))
        };
      }
      if (param.key === 'course_id') {
        return {
          ...param,
          options: courses.map((course: any) => ({
            value: course.id.toString(),
            label: `${course.course_code} - ${course.name}`
          }))
        };
      }
      if (param.key === 'class_id') {
        return {
          ...param,
          options: classes.map((classItem: any) => ({
            value: classItem.id.toString(),
            label: `${classItem.name} - ${classItem.schedule}`
          }))
        };
      }
      if (param.key === 'teacher_id') {
        return {
          ...param,
          options: teachers.map((teacher: any) => ({
            value: teacher.id.toString(),
            label: `${teacher.user.first_name} ${teacher.user.last_name}`
          }))
        };
      }
      return param;
    });
    
    return updatedTemplate;
  };

  const openReportModal = (template: ReportTemplate) => {
    const updatedTemplate = updateTemplateOptions(template);
    setSelectedTemplate(updatedTemplate);
    
    // Initialize parameters with default values
    const initialParams: Record<string, any> = {};
    updatedTemplate.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        initialParams[param.key] = param.defaultValue;
      }
    });
    setReportParameters(initialParams);
    setIsModalOpen(true);
  };

  const handleParameterChange = (key: string, value: any) => {
    setReportParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateReport = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      
      const reportData = {
        template_id: selectedTemplate.id,
        parameters: reportParameters,
        format: selectedTemplate.format
      };
      
      const response = await apiService.reports?.generate(reportData);
      
      if (response?.data?.file_url) {
        // Direct download
        const link = document.createElement('a');
        link.href = response.data.file_url;
        link.download = `${selectedTemplate.name}_${new Date().toISOString().split('T')[0]}.${selectedTemplate.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Reporte generado y descargado exitosamente');
      } else {
        toast.success('Reporte generado exitosamente');
      }
      
      setIsModalOpen(false);
      fetchGeneratedReports();
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const previewReport = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      
      const response = await apiService.reports?.preview({
        template_id: selectedTemplate.id,
        parameters: reportParameters
      });
      
      setPreviewData(response?.data);
      setIsPreviewModalOpen(true);
    } catch (error: any) {
      console.error('Error previewing report:', error);
      toast.error('Error al generar la vista previa');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (report: GeneratedReport) => {
    if (!report.file_url) {
      toast.error('Archivo no disponible');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = report.file_url;
      link.download = `${report.name}.${report.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      return;
    }
    
    try {
      await apiService.reports?.delete(reportId);
      toast.success('Reporte eliminado exitosamente');
      fetchGeneratedReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar el reporte');
    }
  };

  const renderParameterInput = (parameter: ReportParameter) => {
    const value = reportParameters[parameter.key] || '';
    
    switch (parameter.type) {
      case 'text':
        return (
          <Input
            label={parameter.label}
            value={value}
            onChange={(e) => handleParameterChange(parameter.key, e.target.value)}
            required={parameter.required}
          />
        );
      
      case 'number':
        return (
          <Input
            label={parameter.label}
            type="number"
            value={value}
            onChange={(e) => handleParameterChange(parameter.key, parseInt(e.target.value))}
            required={parameter.required}
          />
        );
      
      case 'date':
        return (
          <Input
            label={parameter.label}
            type="date"
            value={value}
            onChange={(e) => handleParameterChange(parameter.key, e.target.value)}
            required={parameter.required}
          />
        );
      
      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {parameter.label}
              {parameter.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleParameterChange(parameter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={parameter.required}
            >
              <option value="">Seleccionar...</option>
              {parameter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'multiselect':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {parameter.label}
              {parameter.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {parameter.options?.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(option.value)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      handleParameterChange(parameter.key, newValues);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleParameterChange(parameter.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              {parameter.label}
            </label>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'generating':
        return 'Generando';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Report Templates */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Plantillas de Reportes
          </h2>
          <p className="text-gray-600">
            Selecciona una plantilla para generar reportes personalizados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map(template => (
            <Card key={template.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-blue-500">
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.format.toUpperCase()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => openReportModal(template)}
                    >
                      Generar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Generated Reports */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Reportes Generados
          </h2>
          <p className="text-gray-600">
            Historial de reportes generados y disponibles para descarga
          </p>
        </div>

        {generatedReports.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay reportes generados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generatedReports.map(report => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.format.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(report.generated_at).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(report.generated_at).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(report.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {report.status === 'completed' && report.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report)}
                            className="p-1"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReport(report.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
          setReportParameters({});
        }}
        title={selectedTemplate ? `Generar ${selectedTemplate.name}` : 'Generar Reporte'}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500">
                  {selectedTemplate.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedTemplate.parameters.map(parameter => (
                <div key={parameter.key}>
                  {renderParameterInput(parameter)}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={previewReport}
                  disabled={loading}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedTemplate(null);
                    setReportParameters({});
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={generateReport}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewData(null);
        }}
        title="Vista Previa del Reporte"
        size="xl"
      >
        {previewData && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  generateReport();
                }}
              >
                Generar Reporte Completo
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportGenerator;