import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Target
} from 'lucide-react';
import { Card } from '../../components/ui';

const StudentDashboard: React.FC = () => {
  const studentStats = [
    { title: 'Promedio General', value: '16.8', icon: Award, color: 'from-green-400 to-green-600', change: '+0.3 vs anterior' },
    { title: 'Asistencia', value: '94%', icon: Clock, color: 'from-blue-400 to-blue-600', change: '23/25 días' },
    { title: 'Tareas Pendientes', value: '3', icon: FileText, color: 'from-yellow-400 to-yellow-600', change: 'Vencen pronto' },
    { title: 'Cursos Activos', value: '12', icon: BookOpen, color: 'from-purple-400 to-purple-600', change: 'Este bimestre' },
  ];

  const recentGrades = [
    { subject: 'Matemáticas', grade: 18, date: '2024-01-15', type: 'Examen' },
    { subject: 'Comunicación', grade: 16, date: '2024-01-14', type: 'Práctica' },
    { subject: 'Ciencias', grade: 17, date: '2024-01-12', type: 'Laboratorio' },
    { subject: 'Historia', grade: 15, date: '2024-01-10', type: 'Ensayo' },
  ];

  const upcomingTasks = [
    { task: 'Examen de Álgebra', subject: 'Matemáticas', dueDate: '2024-01-20', priority: 'high' },
    { task: 'Ensayo sobre la Independencia', subject: 'Historia', dueDate: '2024-01-22', priority: 'medium' },
    { task: 'Práctica de Laboratorio', subject: 'Química', dueDate: '2024-01-25', priority: 'low' },
  ];

  const getGradeColor = (grade: number) => {
    if (grade >= 17) return 'text-green-600 bg-green-100';
    if (grade >= 14) return 'text-blue-600 bg-blue-100';
    return 'text-red-600 bg-red-100';
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
          <h1 className="text-3xl font-bold text-gray-900">Mi Panel Estudiantil</h1>
          <p className="text-gray-600 mt-1">Seguimiento de tu progreso académico</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar size={18} />
            Ver Horario
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => {
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
        {/* Recent Grades */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Calificaciones Recientes
          </h2>
          <div className="space-y-3">
            {recentGrades.map((grade, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{grade.subject}</p>
                  <p className="text-sm text-gray-600">{grade.type} - {grade.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(grade.grade)}`}>
                  {grade.grade}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="text-blue-600" size={20} />
            Próximas Tareas
          </h2>
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
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
                    <p className="text-sm text-gray-600">{task.subject} - Vence: {task.dueDate}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Academic Progress Chart Placeholder */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="text-purple-600" size={20} />
          Progreso Académico
        </h2>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">Gráfico de progreso académico</p>
          <p className="text-sm text-gray-500 mt-2">Aquí se mostrará tu evolución durante el año</p>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;