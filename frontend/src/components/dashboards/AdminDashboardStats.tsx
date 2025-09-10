import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change, trend = 'neutral' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-white/70';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${color} p-6 rounded-xl text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className={`text-xs mt-1 ${getTrendColor()}`}>{change}</p>
        </div>
        <Icon size={32} className="text-white/80" />
      </div>
    </motion.div>
  );
};

const AdminDashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Estudiantes',
      value: '1,247',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      change: '+12% este mes',
      trend: 'up' as const
    },
    {
      title: 'Docentes Activos',
      value: '89',
      icon: BookOpen,
      color: 'from-green-400 to-green-600',
      change: '+3 nuevos',
      trend: 'up' as const
    },
    {
      title: 'Asistencia Promedio',
      value: '94.2%',
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600',
      change: '+2.1% vs mes anterior',
      trend: 'up' as const
    },
    {
      title: 'Alertas Pendientes',
      value: '7',
      icon: AlertTriangle,
      color: 'from-red-400 to-red-600',
      change: '-3 resueltas hoy',
      trend: 'down' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
};

export default AdminDashboardStats;
export { StatCard };