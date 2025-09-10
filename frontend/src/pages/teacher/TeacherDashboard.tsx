import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  TrendingUp,
  ClipboardCheck,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../components/ui';

const TeacherDashboard: React.FC = () => {
  const teacherStats = [
    { title: 'Estudiantes Activos', value: '156', icon: Users, color: 'from-blue-400 to-blue-600', change: '5 secciones' },
    { title: 'Asistencia Promedio', value: '91%', icon: Clock, color: 'from-green-400 to-green-600', change: 'Esta semana' },
    { title: 'Tareas por Revisar', value: '23', icon: FileText, color: 'from-yellow-400 to-yellow-600', change: 'Pendientes' },
    { title: 'Clases Hoy', value: '6', icon: BookOpen, color: 'from-purple-400 to-purple-600', change: '08:00 - 16:00' },
  ];

  const todayClasses = [
    { subject: 'Matemáticas', grade: '5to A', time: '08:00 - 09:30', room: 'Aula 201', status: 'completed' },
    { subject: 'Álgebra', grade: '4to B', time: '09:45 - 11:15', room: 'Aula 201', status: 'completed' },
    { subject: 'Geometría', grade: '3ro C', time: '11:30 - 13:00', room: 'Aula 201', status: 'current' },
    { subject: 'Matemáticas', grade: '5to B', time: '14:00 - 15:30', room: 'Aula 201', status: 'upcoming' },
  ];

  const pendingTasks = [
    { task: 'Revisar exámenes de 5to A', priority: 'high', dueDate: 'Hoy', count: 28 },
    { task: 'Preparar material para clase de mañana', priority: 'medium', dueDate: 'Mañana', count: 1 },
    { task: 'Actualizar notas en el sistema', priority: 'high', dueDate: 'Viernes', count: 45 },
    { task: 'Reunión con padres de familia', priority: 'low', dueDate: 'Próxima semana', count: 3 },
  ];

  const getClassStatus = (status: string) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' };
      case 'current': return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' };
      default: return { icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-green-500 bg-green-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel del Docente</h1>
          <p className="text-gray-600 mt-1">Gestión de clases y seguimiento académico</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ClipboardCheck size={18} />
            Tomar Asistencia
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={18} />
            Registrar Notas
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teacherStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} p-6 rounded-xl text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-white/70 text-xs mt-1">{stat.change}</p>
                </div>
                <Icon size={32} className="text-white/80" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Clases de Hoy
          </h2>
          <div className="space-y-3">
            {todayClasses.map((classItem, index) => {
              const statusInfo = getClassStatus(classItem.status);
              const StatusIcon = statusInfo.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 ${statusInfo.bg} rounded-lg border-l-4 ${
                    classItem.status === 'current' ? 'border-l-blue-500' :
                    classItem.status === 'completed' ? 'border-l-green-500' :
                    'border-l-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon size={16} className={statusInfo.color} />
                      <div>
                        <p className="font-medium text-gray-800">{classItem.subject} - {classItem.grade}</p>
                        <p className="text-sm text-gray-600">{classItem.time} • {classItem.room}</p>
                      </div>
                    </div>
                    {classItem.status === 'current' && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                        En curso
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            Tareas Pendientes
          </h2>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 border-l-4 ${getPriorityColor(task.priority)} rounded-r-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{task.task}</p>
                    <p className="text-sm text-gray-600">Vence: {task.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    {task.count > 1 && (
                      <p className="text-xs text-gray-500 mt-1">{task.count} elementos</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={20} />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left"
          >
            <MessageSquare className="text-blue-600 mb-2" size={24} />
            <p className="font-medium text-gray-800">Enviar Comunicado</p>
            <p className="text-sm text-gray-600">A padres de familia</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left"
          >
            <FileText className="text-green-600 mb-2" size={24} />
            <p className="font-medium text-gray-800">Generar Reporte</p>
            <p className="text-sm text-gray-600">De rendimiento</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left"
          >
            <Calendar className="text-purple-600 mb-2" size={24} />
            <p className="font-medium text-gray-800">Programar Evaluación</p>
            <p className="text-sm text-gray-600">Nueva fecha</p>
          </motion.button>
        </div>
      </Card>
    </div>
  );
};

export default TeacherDashboard;