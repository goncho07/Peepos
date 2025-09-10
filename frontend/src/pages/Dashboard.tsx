import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BarChart2, Bell, MessageSquare, Calendar, QrCode, BookCheck, ClipboardList, ArrowRight, CheckCircle, AlertTriangle, FileText, Settings } from 'lucide-react';
import { Calendar as CalendarComponent } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import CustomizableDashboard from '../components/dashboard/CustomizableDashboard';


const kpiData = [
  { title: 'Matrícula Activa', value: '1,242', icon: Users, color: 'from-sky-400 to-blue-500', change: '-8 vs 2024' },
  { title: 'Asistencia del Periodo', value: '92%', icon: BarChart2, color: 'from-emerald-400 to-teal-500', change: '+1.5%' },
  { title: 'Incidencias de Hoy', value: '5', icon: AlertTriangle, color: 'from-amber-400 to-orange-500', change: '2 críticas' },
  { title: 'Próximo Hito', value: 'Cierre Bim. III', icon: Calendar, color: 'from-purple-400 to-indigo-500', change: 'en 12 días' },
];


const quickActions = [
    { text: 'Tomar Asistencia QR', icon: QrCode, path: '/asistencia/scan', color: 'bg-indigo-100 text-indigo-700' },
    { text: 'Revisar Notas', icon: BookCheck, path: '/academico/avance-docentes', color: 'bg-emerald-100 text-emerald-700' },
    { text: 'Nuevo Comunicado', icon: MessageSquare, path: '/comunicaciones', color: 'bg-sky-100 text-sky-700' },
    { text: 'Generar Reporte UGEL', icon: FileText, path: '/reportes', color: 'bg-rose-100 text-rose-700' },
]


const tasksAndAlerts = [
  { text: 'Aprobar Acta de 5to Grado "A"', type: 'approval', user: 'A. Barreto' },
  { text: 'Estudiante con 5 inasistencias', type: 'alert', user: 'Quispe, Ana' },
  { text: 'Solicitud de materiales de laboratorio', type: 'approval', user: 'V. Buendia' },
  { text: 'Cierre de matrícula vence pronto', type: 'alert', user: 'Sistema' },
];


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showCustomizable, setShowCustomizable] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } },
  };


  if (showCustomizable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Dashboard Personalizable</h1>
            <p className="text-slate-500 mt-1 text-lg">Configura tu dashboard según tus necesidades.</p>
          </div>
          <button
            onClick={() => setShowCustomizable(false)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            Vista Clásica
          </button>
        </div>
        <CustomizableDashboard userRole="director" userId="user-123" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Columna Principal de Contenido */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">Hola de nuevo, Director 👋</h1>
              <p className="text-slate-500 mt-1 text-lg">Aquí tienes el pulso de tu institución para hoy.</p>
            </div>
            <button
              onClick={() => setShowCustomizable(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings size={16} />
              Dashboard Personalizable
            </button>
          </div>


          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {kpiData.map((kpi, index) => (
              <motion.div key={index} 
                variants={itemVariants} className={`relative overflow-hidden rounded-2xl text-white p-6 shadow-lg flex flex-col justify-between h-44 bg-gradient-to-br ${kpi.color}`}>
                <div className="absolute -right-6 -top-6 text-white/10">
                  <kpi.icon size={100} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <p className="font-semibold text-white/90">{kpi.title}</p>
                  <p className="text-4xl font-bold mt-2">{kpi.value}</p>
                </div>
                <div className="relative z-10">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">{kpi.change}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <motion.div 
                variants={itemVariants} className="xl:col-span-1">
                   <h2 className="text-2xl font-bold text-slate-800 mb-4">Acciones Frecuentes</h2>
                   <div className="space-y-4">
                    {quickActions.map(action => (
                        <motion.button 
                            key={action.text}
                            whileHover={{ scale: 1.03, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            className="w-full flex items-center justify-between p-4 bg-white rounded-xl font-semibold hover:shadow-lg border border-gray-100 transition-all text-base group"
                        >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${action.color}`}>
                                  <action.icon size={22} />
                              </div>
                              <span className="text-slate-700">{action.text}</span>
                            </div>
                            <ArrowRight size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </motion.button>
                    ))}
                </div>
              </motion.div>
              <motion.div 
                variants={itemVariants} className="xl:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell size={24} /> Tareas y Alertas</h2>
                <ul className="space-y-3">
                    {tasksAndAlerts.map((task, index) => (
                         <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                              {task.type === 'approval' ? <CheckCircle size={20} className="text-sky-500" /> : <AlertTriangle size={20} className="text-amber-500" />}
                              <div>
                                  <p className="font-semibold text-slate-700">{task.text}</p>
                                  <p className="text-sm text-slate-500">Involucrado: {task.user}</p>
                              </div>
                          </div>
                          <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                      </li>
                    ))}
                </ul>
            </motion.div>
          </div>
        </div>


        {/* Columna Derecha con Calendario */}
        <div className="lg:col-span-1 xl:col-span-1">
          <CalendarComponent />
        </div>
      </div>
    </>
  );
};

export default Dashboard;