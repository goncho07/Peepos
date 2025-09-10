import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  FileText, 
  Settings, 
  Award,
  BarChart3,
  GraduationCap,
  Calendar,
  Target,
  BookMarked,
  ClipboardCheck
} from 'lucide-react';
import { Card } from '../components/ui';

interface AcademicModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
  bgColor: string;
  stats?: {
    label: string;
    value: string;
  };
}

const academicModules: AcademicModule[] = [
  {
    id: 'planificacion-curricular',
    title: 'Planificación Curricular',
    description: 'Gestión de carreras, materias y horarios académicos',
    icon: BookMarked,
    route: '/academico/planificacion-curricular',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    stats: {
      label: 'Carreras activas',
      value: '8'
    }
  },
  {
    id: 'evaluaciones',
    title: 'Gestión de Evaluaciones',
    description: 'Administración de evaluaciones, calificaciones y análisis',
    icon: ClipboardCheck,
    route: '/academico/evaluaciones',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    stats: {
      label: 'Evaluaciones activas',
      value: '15'
    }
  },
  {
    id: 'avance-docentes',
    title: 'Avance Docentes',
    description: 'Monitoreo del progreso curricular por docente',
    icon: Users,
    route: '/academico/avance-docentes',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    stats: {
      label: 'Docentes activos',
      value: '24'
    }
  },
  {
    id: 'monitoreo-cursos',
    title: 'Monitoreo de Cursos',
    description: 'Seguimiento del avance por materia y grado',
    icon: BookOpen,
    route: '/academico/monitoreo-cursos',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    stats: {
      label: 'Cursos activos',
      value: '18'
    }
  },
  {
    id: 'monitoreo-estudiantes',
    title: 'Monitoreo Estudiantes',
    description: 'Seguimiento del rendimiento estudiantil',
    icon: GraduationCap,
    route: '/academico/monitoreo-estudiantes',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    stats: {
      label: 'Estudiantes',
      value: '450'
    }
  },
  {
    id: 'actas-certificados',
    title: 'Actas y Certificados',
    description: 'Gestión de documentos académicos oficiales',
    icon: Award,
    route: '/academico/actas-certificados',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    stats: {
      label: 'Documentos',
      value: '156'
    }
  },
  {
    id: 'reportes',
    title: 'Reportes Académicos',
    description: 'Informes y estadísticas del rendimiento',
    icon: BarChart3,
    route: '/academico/reportes',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    stats: {
      label: 'Reportes',
      value: '12'
    }
  },
  {
    id: 'configuracion',
    title: 'Configuración Académica',
    description: 'Configuración de períodos, materias y criterios',
    icon: Settings,
    route: '/academico/configuracion',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    stats: {
      label: 'Configuraciones',
      value: '8'
    }
  }
];

const AcademicoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleModuleClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Módulo Académico</h1>
        <p className="text-lg text-gray-600">Panel de control académico para directores</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">85%</h3>
          <p className="text-sm text-gray-600">Avance Curricular</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">92%</h3>
          <p className="text-sm text-gray-600">Asistencia Promedio</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <Award className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">78</h3>
          <p className="text-sm text-gray-600">Promedio General</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Q2</h3>
          <p className="text-sm text-gray-600">Período Actual</p>
        </Card>
      </div>

      {/* Academic Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicModules.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleModuleClick(module.route)}
              className={`${module.bgColor} rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${module.color.replace('text-', 'bg-').replace('600', '100')}`}>
                  <Icon className={`h-6 w-6 ${module.color}`} />
                </div>
                {module.stats && (
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${module.color}`}>
                      {module.stats.value}
                    </div>
                    <div className="text-xs text-gray-600">
                      {module.stats.label}
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {module.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {module.description}
              </p>
              
              <div className="mt-4 flex items-center text-sm font-medium">
                <span className={module.color}>Acceder al módulo</span>
                <svg className={`ml-2 h-4 w-4 ${module.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Reporte de calificaciones Q2 generado</p>
              <p className="text-xs text-gray-600">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Actualización de avance curricular - 5to A</p>
              <p className="text-xs text-gray-600">Hace 4 horas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Certificado de estudios emitido - Ana García</p>
              <p className="text-xs text-gray-600">Hace 6 horas</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AcademicoPage;