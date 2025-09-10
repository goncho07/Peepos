// Implementar página principal de comunicaciones
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Bell, Users, Calendar } from 'lucide-react';

const ComunicacionesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mensajes');
  
  return (
    <div className="p-6 space-y-6">
      {/* Header con navegación por tabs */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          Centro de Comunicaciones
        </h1>
      </div>
      
      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
            { id: 'comunicados', label: 'Comunicados', icon: Bell },
            { id: 'eventos', label: 'Eventos', icon: Calendar },
            { id: 'grupos', label: 'Grupos', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Contenido dinámico por tab */}
      <div className="min-h-96">
        {activeTab === 'mensajes' && <div>Messages component placeholder</div>}
        {activeTab === 'comunicados' && <div>Comunicados component placeholder</div>}
        {activeTab === 'eventos' && <div>Eventos component placeholder</div>}
        {activeTab === 'grupos' && <div>Grupos component placeholder</div>}
      </div>
    </div>
  );
};