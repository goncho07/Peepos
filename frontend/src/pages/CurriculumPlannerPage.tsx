import React from 'react';
import { motion } from 'framer-motion';
import { BookMarked, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CurriculumPlanner from '../components/academic/CurriculumPlanner';
import { Card } from '../components/ui';

const CurriculumPlannerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/academico')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookMarked className="h-8 w-8 text-indigo-600" />
              Planificación Curricular
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión integral de carreras, materias y horarios académicos
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-2">8</div>
          <div className="text-sm text-gray-600">Carreras Activas</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-2">45</div>
          <div className="text-sm text-gray-600">Materias Totales</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
          <div className="text-sm text-gray-600">Docentes Asignados</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">120</div>
          <div className="text-sm text-gray-600">Horas Semanales</div>
        </Card>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CurriculumPlanner />
      </motion.div>
    </div>
  );
};

export default CurriculumPlannerPage;