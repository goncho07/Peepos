import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiClient';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    isAuthenticated: false,
    user: null,
    token: null,

    // Reemplazar mock con integración real
    login: async (email: string, password: string) => {
      try {
        const response = await apiService.auth.login({ email, password });
        const { user, token } = response.data.data;

        // Solo actualizar el estado de Zustand - persist se encarga del resto
        set({
          isAuthenticated: true,
          user,
          token
        });
        
        // Sincronizar con localStorage para el interceptor de axios
        localStorage.setItem('auth_token', token);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('auth_token');
      set({
        isAuthenticated: false,
        user: null,
        token: null
      });
    },

    setUser: (user: User) => {
      set({ user });
    },

    setToken: (token: string) => {
      set({ token, isAuthenticated: true });
      localStorage.setItem('auth_token', token);
    },
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      token: state.token
    }),
    onRehydrateStorage: () => (state) => {
      // Sincronizar con localStorage después de rehidratar
      if (state?.token) {
        localStorage.setItem('auth_token', state.token);
      } else {
        localStorage.removeItem('auth_token');
      }
    },
  }
));