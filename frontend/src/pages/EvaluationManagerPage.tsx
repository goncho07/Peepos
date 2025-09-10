import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EvaluationManager from '../components/academic/EvaluationManager';
import { Card } from '../components/ui';

const EvaluationManagerPage: React.FC = () => {
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
              <ClipboardCheck className="h-8 w-8 text-emerald-600" />
              Gestión de Evaluaciones
            </h1>
            <p className="text-gray-600 mt-1">
              Administración integral de evaluaciones, calificaciones y análisis académico
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-2">15</div>
          <div className="text-sm text-gray-600">Evaluaciones Activas</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">342</div>
          <div className="text-sm text-gray-600">Calificaciones Registradas</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">78.5</div>
          <div className="text-sm text-gray-600">Promedio General</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
          <div className="text-sm text-gray-600">Tasa de Aprobación</div>
        </Card>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <EvaluationManager />
      </motion.div>
    </div>
  );
};

export default EvaluationManagerPage;