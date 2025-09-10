import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

interface UIStore {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
import { Home, Users, BookOpen, Handshake, FileSpreadsheet, MessageSquare, Briefcase, HelpCircle, UsersRound, ClipboardCheck, Warehouse, UserPlus, FileCheck, CreditCard,
  MessageCircle, GraduationCap, BarChart3, Calendar, Settings } from 'lucide-react';
import { NavItem } from '../../types';

// Agregar indicadores de progreso y notificaciones
const navItems: NavItem[] = [
  { 
    to: '/', 
    text: 'Inicio', 
    icon: Home,
    notifications: 0
  },
  { 
    to: '/usuarios', 
    text: 'Usuarios', 
    icon: UsersRound,
    notifications: 2,
    badge: 'Nuevo'
  },
  { 
    to: '/matricula', 
    text: 'Matrícula', 
    icon: UserPlus,
    notifications: 0
  },
  { 
    to: '/documents/review', 
    text: 'Revisión Documentos', 
    icon: FileCheck,
    notifications: 0
  },
  {
    to: '/payments',
    text: 'Pagos',
    icon: CreditCard,
    notifications: 3
  },
  {
    to: '/academico',
    text: 'Académico',
    icon: GraduationCap,
    notifications: 0
  },
  {
    to: '/asistencia',
    text: 'Asistencia',
    icon: Calendar,
    notifications: 1
  },
  {
    to: '/messaging',
    text: 'Mensajería',
    icon: MessageCircle,
    notifications: 5
  },
  { 
    to: '/comunicaciones', 
    text: 'Comunicaciones', 
    icon: MessageSquare,
    notifications: 5,
    progress: 75 // Porcentaje de mensajes leídos
  },
  {
    to: '/reportes',
    text: 'Reportes',
    icon: BarChart3,
    notifications: 0
  },
  {
    to: '/recursos',
    text: 'Recursos',
    icon: BookOpen,
    notifications: 0
  },
  {
    to: '/ayuda',
    text: 'Ayuda',
    icon: HelpCircle,
    notifications: 0
  }
];

const Sidebar: React.FC = () => {
  const { isSidebarCollapsed } = useUIStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const linkClasses = "flex items-center px-4 py-3.5 text-slate-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 group relative font-medium";
  const activeLinkClasses = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30";
  const logoUrl = 'https://cdn-icons-png.flaticon.com/512/2602/2602414.png';

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-center h-20 border-b border-gray-200 shrink-0 px-4">
        <img src={logoUrl} alt="Logo del Colegio" className={`transition-all duration-300 ${isSidebarCollapsed ? 'h-12 w-12' : 'h-10 w-10'}`} />
        <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.h1 
            // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="ml-2 text-xl font-bold text-slate-800 leading-tight"
          >
            IEE 6049<br/>Ricardo Palma
          </motion.h1>
        )}
        </AnimatePresence>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to} onMouseEnter={() => setHoveredItem(item.to)} onMouseLeave={() => setHoveredItem(null)}>
              <NavLink to={item.to} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                <item.icon className={`h-6 w-6 shrink-0 transition-all ${isSidebarCollapsed ? 'mx-auto' : 'mr-4'}`} />
                <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-base"
                  >
                    {item.text}
                  </motion.span>
                )}
                </AnimatePresence>
                 {isSidebarCollapsed && hoveredItem === item.to && (
                  <motion.div
                    // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap z-50"
                  >
                    {item.text}
                  </motion.div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;