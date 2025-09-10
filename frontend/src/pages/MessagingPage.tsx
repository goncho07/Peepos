import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Clock, TrendingUp } from 'lucide-react';
import MessagingCenter from '../components/messaging/MessagingCenter';
import { Card } from '../components/ui';

const MessagingPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          Centro de Mensajería
        </h1>
        <p className="text-gray-600 mt-2">
          Comunicación interna en tiempo real para todo el personal educativo
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">156</h3>
          <p className="text-sm text-gray-600">Mensajes Hoy</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">24</h3>
          <p className="text-sm text-gray-600">Usuarios Activos</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">2.5min</h3>
          <p className="text-sm text-gray-600">Tiempo Respuesta</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">95%</h3>
          <p className="text-sm text-gray-600">Tasa de Entrega</p>
        </Card>
      </div>

      {/* Main Messaging Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MessagingCenter />
      </motion.div>
    </div>
  );
};

export default MessagingPage;