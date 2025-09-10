import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import API_CONFIG from '../config/api';

// Helper function to ensure endpoint is a string
const getEndpoint = (endpoint: any): string => {
  return endpoint as string;
};

// Types for API responses
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ApiParams {
  [key: string]: any;
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: true, // Important for Laravel Sanctum
});

// Interceptor de solicitud para agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar estado completo
      localStorage.removeItem('auth_token');
      
      // Importar dinámicamente para evitar dependencias circulares
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().logout();
      
      // Redirigir solo si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Sin permisos
      console.error('Acceso denegado');
    } else if (error.response?.status >= 500) {
      // Error del servidor
      console.error('Error del servidor:', error.response.data);
    }
    return Promise.reject(error);
  }
);



// API service methods
const apiService = {
  // Authentication methods
  auth: {
    async getCsrfToken(): Promise<AxiosResponse> {
      return await apiClient.get('/sanctum/csrf-cookie');
    },
    
    async login(credentials: LoginCredentials): Promise<AxiosResponse> {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.AUTH.LOGIN), credentials);
    },
    
    async logout(): Promise<AxiosResponse> {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.AUTH.LOGOUT));
    },
    
    async register(userData: RegisterData): Promise<AxiosResponse> {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.AUTH.REGISTER), userData);
    },
    
    async getUser(): Promise<AxiosResponse<User>> {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.AUTH.ME));
    },
    
    async refreshToken(): Promise<AxiosResponse> {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.AUTH.REFRESH));
    }
  },

  // Dashboard methods
  dashboard: {
    async getAdminStats() {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN));
    },

    async getStudentData() {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.DASHBOARD.STUDENT));
    },

    async getTeacherData() {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.DASHBOARD.TEACHER));
    }
  },

  // Users methods
  users: {
    async getAll(params: ApiParams = {}): Promise<AxiosResponse> {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.USERS.LIST), { params });
    },
    
    async create(userData: any): Promise<AxiosResponse> {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.USERS.CREATE), userData);
    },
    
    async update(id: number, userData: any): Promise<AxiosResponse> {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.USERS.UPDATE)}/${id}`, userData);
    },
    
    async delete(id: number): Promise<AxiosResponse> {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.USERS.DELETE)}/${id}`);
    },
    
    async getById(id: number): Promise<AxiosResponse<User>> {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.USERS.SHOW)}/${id}`);
    }
  },

  // Students methods
  students: {
    async getAll(params = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.LIST), { params });
    },

    async create(studentData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.CREATE), studentData);
    },

    async update(id, studentData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE)}/${id}`, studentData);
    },

    async delete(id) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.DELETE)}/${id}`);
    },

    async getById(id) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.SHOW)}/${id}`);
    },

    async getGrades(id) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.GRADES).replace('{id}', id));
    },

    async getAttendance(id) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.ATTENDANCE).replace('{id}', id));
    }
  },

  // Teachers methods
  teachers: {
    async getAll(params = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.LIST), { params });
    },

    async create(teacherData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.CREATE), teacherData);
    },

    async update(id, teacherData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE)}/${id}`, teacherData);
    },

    async delete(id) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.DELETE)}/${id}`);
    },

    async getById(id) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.SHOW)}/${id}`);
    },

    async getClasses(id) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.CLASSES).replace('{id}', id));
    }
  },

  // Classes methods
  classes: {
    async getAll(params = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.LIST), { params });
    },

    async create(classData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.CREATE), classData);
    },

    async update(id, classData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.UPDATE)}/${id}`, classData);
    },

    async delete(id) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.DELETE)}/${id}`);
    },

    async getById(id) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.SHOW)}/${id}`);
    },

    async getStudents(id) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.STUDENTS).replace('{id}', id));
    }
  },

  // Grades methods
  grades: {
    async getAll(params = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.GRADES.LIST), { params });
    },

    async create(gradeData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.GRADES.CREATE), gradeData);
    },

    async update(id, gradeData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.GRADES.UPDATE)}/${id}`, gradeData);
    },

    async delete(id) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.GRADES.DELETE)}/${id}`);
    }
  },

  // Attendance methods
  attendance: {
    async getAll(params = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.LIST), { params });
    },

    async create(attendanceData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.CREATE), attendanceData);
    },

    async update(id, attendanceData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.UPDATE)}/${id}`, attendanceData);
    },

    async markAttendance(attendanceData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.MARK), attendanceData);
    }
  },

  // Communications methods
  communications: {
    async getAll(params = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.LIST), { params });
    },

    async create(communicationData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.CREATE), communicationData);
    },

    async update(id, communicationData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.UPDATE)}/${id}`, communicationData);
    },

    async delete(id) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.DELETE)}/${id}`);
    },

    async send(messageData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.SEND), messageData);
    }
  },

  // Reports methods
  reports: {
    async generate(reportData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.GENERATE), reportData);
    },

    async download(reportId) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.DOWNLOAD)}/${reportId}`, {
        responseType: 'blob'
      });
    }
  },

  // Resources methods
  resources: {
    async getAll(params = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.RESOURCES.LIST), { params });
    },

    async upload(formData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.RESOURCES.UPLOAD), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },

    async download(resourceId) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.RESOURCES.DOWNLOAD)}/${resourceId}`, {
        responseType: 'blob'
      });
    },

    async delete(id) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.RESOURCES.DELETE)}/${id}`);
    }
  }
};

// Export apiService
export { apiService };

// Export default apiClient
export default apiClient;

// Also export as named export for compatibility
export { apiClient };