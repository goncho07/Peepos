// Implementar dashboard de reportes
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Filter, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui';

const ReportesPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('trimestre');
  const [reportType, setReportType] = useState('academico');
  
  const reportCategories = [
    {
      id: 'academico',
      title: 'Reportes Académicos',
      description: 'Calificaciones, rendimiento y progreso estudiantil',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: TrendingUp
    },
    {
      id: 'asistencia',
      title: 'Reportes de Asistencia',
      description: 'Estadísticas de asistencia por estudiante y clase',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: Calendar
    },
    {
      id: 'financiero',
      title: 'Reportes Financieros',
      description: 'Ingresos, gastos y estado de pagos',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      icon: BarChart3
    }
  ];
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Centro de Reportes
        </h1>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Todo
          </Button>
        </div>
      </div>
      
      {/* Categorías de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.02 }}
            className={`${category.color} p-6 rounded-xl text-white cursor-pointer`}
            onClick={() => setReportType(category.id)}
          >
            <category.icon className="h-8 w-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
            <p className="text-white/80 text-sm">{category.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};