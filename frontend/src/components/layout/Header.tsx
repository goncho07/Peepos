import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Plus, Bell, Wifi, WifiOff, LogOut, User, Settings, ChevronsLeft, ChevronsRight, ChevronDown, UserPlus, MessageSquarePlus, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import NotificationCenter from '../notifications/NotificationCenter';

// Custom hook to check online status
const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

const Header: React.FC = () => {
  const { toggleSidebar, isSidebarCollapsed } = useUIStore();
  const logout = useAuthStore((state) => state.logout);
  const isOnline = useOfflineStatus();
  const [profileOpen, setProfileOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const createOptions = [
    { label: 'Nueva Matrícula', icon: UserPlus, action: () => {} },
    { label: 'Nuevo Comunicado', icon: MessageSquarePlus, action: () => {} },
    { label: 'Registrar Incidencia', icon: AlertTriangle, action: () => {} },
  ];

  return (
    <header className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-indigo-600 transition-colors"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? <ChevronsRight size={28} /> : <ChevronsLeft size={28} />}
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input
            type="text"
            placeholder="Buscar en todo el sistema..."
            className="pl-12 pr-4 py-2.5 w-72 border border-slate-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            <Plus size={18} />
            <span>Crear</span>
            <ChevronDown size={16} className={`transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
          {createMenuOpen && (
             <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {createOptions.map(option => (
                <button key={option.label} onClick={() => { option.action(); setCreateMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                  <option.icon size={18} /> {option.label}
                </button>
              ))}
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          {isOnline ? (
            <Wifi size={22} className="text-emerald-500" />
          ) : (
            <WifiOff size={22} className="text-rose-500" />
          )}
          <span className="hidden md:inline">{isOnline ? 'En línea' : 'Sin conexión'}</span>
        </div>

        <NotificationCenter />
        
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)}>
            <img src="https://picsum.photos/seed/director/48/48" alt="Perfil" className="w-12 h-12 rounded-full border-2 border-slate-200 hover:border-indigo-500 transition-all duration-300" />
          </button>
          <AnimatePresence>
          {profileOpen && (
            <motion.div
              // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100">
                <p className="font-semibold text-base">Director(a)</p>
                <p className="text-sm text-slate-500">Ángel G. Morales</p>
              </div>
              <a href="#/usuarios" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors"><User size={18} /> Perfil</a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors"><Settings size={18} /> Ajustes</a>
              <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;