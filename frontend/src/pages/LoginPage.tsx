import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, ArrowLeft } from 'lucide-react';


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email o contraseña incorrectos.');
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };


  const logoUrl = 'https://cdn-icons-png.flaticon.com/512/2602/2602414.png';


  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-slate-100 overflow-hidden p-4"
    >
        {/* Animated background blobs */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>


      <motion.div
        // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30"
      >
        <button
            onClick={() => navigate('/access')}
            aria-label="Volver"
            className="absolute top-4 left-4 p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
            <ArrowLeft size={24} />
        </button>


        <div className="text-center pt-8">
          <img src={logoUrl} alt="Logo del Colegio" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800">Acceso Administrativo</h1>
          <p className="text-slate-500">Ingrese sus credenciales</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-white text-slate-800 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 transition"
              placeholder="Email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-3 bg-white text-slate-800 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 transition"
              placeholder="Contraseña"
            />
          </div>


          {error && (
            <motion.p 
              // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-center font-semibold text-rose-700 bg-rose-100 p-3 rounded-md"
            >
              {error}
            </motion.p>
          )}


          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
              {!isLoading && <LogIn className="ml-2" size={20} />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;