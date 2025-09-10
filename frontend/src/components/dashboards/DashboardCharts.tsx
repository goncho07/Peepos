import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card } from '../ui';

interface ChartPlaceholderProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  data?: any[];
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ 
  title, 
  type, 
  height = 200 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'line': return <TrendingUp size={24} />;
      case 'bar': return <BarChart3 size={24} />;
      case 'pie': return <PieChart size={24} />;
      case 'area': return <Activity size={24} />;
      default: return <BarChart3 size={24} />;
    }
  };

  const getPattern = () => {
    switch (type) {
      case 'line':
        return (
          <svg className="w-full h-full" viewBox="0 0 300 150">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,120 Q75,80 150,90 T300,60"
              stroke="#3B82F6"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M0,120 Q75,80 150,90 T300,60 L300,150 L0,150 Z"
              fill="url(#lineGradient)"
            />
            {[0, 75, 150, 225, 300].map((x, i) => (
              <circle key={i} cx={x} cy={120 - i * 10} r="3" fill="#3B82F6" />
            ))}
          </svg>
        );
      case 'bar':
        return (
          <svg className="w-full h-full" viewBox="0 0 300 150">
            {[40, 80, 60, 100, 70, 90, 50].map((height, i) => (
              <rect
                key={i}
                x={i * 40 + 10}
                y={150 - height}
                width="30"
                height={height}
                fill={`hsl(${220 + i * 10}, 70%, 60%)`}
                rx="2"
              />
            ))}
          </svg>
        );
      case 'pie':
        return (
          <svg className="w-full h-full" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="60" fill="#3B82F6" />
            <path
              d="M 75 75 L 75 15 A 60 60 0 0 1 129.64 105 Z"
              fill="#10B981"
            />
            <path
              d="M 75 75 L 129.64 105 A 60 60 0 0 1 45 120 Z"
              fill="#F59E0B"
            />
            <path
              d="M 75 75 L 45 120 A 60 60 0 0 1 75 15 Z"
              fill="#EF4444"
            />
          </svg>
        );
      case 'area':
        return (
          <svg className="w-full h-full" viewBox="0 0 300 150">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 Q50,70 100,80 Q150,60 200,70 Q250,50 300,60 L300,150 L0,150 Z"
              fill="url(#areaGradient)"
            />
            <path
              d="M0,100 Q50,70 100,80 Q150,60 200,70 Q250,50 300,60"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-blue-600">{getIcon()}</div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div 
        className="bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div className="absolute inset-0 opacity-60">
          {getPattern()}
        </div>
        <div className="relative z-10 text-center">
          <div className="text-gray-400 mb-2">{getIcon()}</div>
          <p className="text-sm text-gray-500">Gráfico de {title}</p>
          <p className="text-xs text-gray-400 mt-1">Datos en tiempo real</p>
        </div>
      </div>
    </Card>
  );
};

const AttendanceChart: React.FC = () => {
  return (
    <ChartPlaceholder 
      title="Asistencia Semanal" 
      type="line" 
      height={250}
    />
  );
};

const GradesDistribution: React.FC = () => {
  return (
    <ChartPlaceholder 
      title="Distribución de Calificaciones" 
      type="bar" 
      height={250}
    />
  );
};

const StudentProgress: React.FC = () => {
  return (
    <ChartPlaceholder 
      title="Progreso del Estudiante" 
      type="area" 
      height={200}
    />
  );
};

const SubjectPerformance: React.FC = () => {
  return (
    <ChartPlaceholder 
      title="Rendimiento por Materia" 
      type="pie" 
      height={250}
    />
  );
};

const SystemUsage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <AttendanceChart />
      <GradesDistribution />
    </motion.div>
  );
};

export {
  ChartPlaceholder,
  AttendanceChart,
  GradesDistribution,
  StudentProgress,
  SubjectPerformance,
  SystemUsage
};

export default ChartPlaceholder;