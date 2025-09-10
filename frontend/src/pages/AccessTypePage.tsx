import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { Button, Card } from '../components/ui';

interface AccessType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  route: string;
}

const accessTypes: AccessType[] = [
  {
    id: 'admin',
    title: 'Administrador',
    description: 'Acceso completo al sistema de gestión escolar',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    route: '/login?type=admin'
  },
  {
    id: 'teacher',
    title: 'Docente',
    description: 'Gestión de clases, calificaciones y asistencia',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    route: '/login?type=teacher'
  },
  {
    id: 'student',
    title: 'Estudiante',
    description: 'Consulta de notas, horarios y recursos académicos',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    route: '/login?type=student'
  },
  {
    id: 'parent',
    title: 'Padre/Madre',
    description: 'Seguimiento del progreso académico de sus hijos',
    icon: BookOpen,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    route: '/login?type=parent'
  }
];

const AccessTypePage: React.FC = () => {
  const navigate = useNavigate();

  const handleAccessTypeSelect = (accessType: AccessType) => {
    navigate(accessType.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6"
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Sistema de Gestión Escolar
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Selecciona tu tipo de acceso para continuar al sistema
          </motion.p>
        </div>

        {/* Access Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessTypes.map((accessType, index) => {
            const IconComponent = accessType.icon;
            
            return (
              <motion.div
                key={accessType.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-current ${accessType.bgColor} ${accessType.color} group`}
                  onClick={() => handleAccessTypeSelect(accessType)}
                >
                  <div className="text-center space-y-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg ${accessType.color}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {accessType.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {accessType.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                      <span>Acceder</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12"
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-gray-600 mb-4">
              Si tienes problemas para acceder al sistema, contacta al administrador
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/support'}>
              Contactar Soporte
            </Button>
          </div>
        </motion.div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>Sistema de Gestión Escolar v2.0 - © 2024</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccessTypePage;