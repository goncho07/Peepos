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

// Additional interfaces for API data
interface StudentData {
  id?: number;
  student_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  [key: string]: any;
}

interface TeacherData {
  id?: number;
  teacher_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  hire_date?: string;
  [key: string]: any;
}

interface ClassData {
  id?: number;
  name: string;
  course_id: number;
  teacher_id?: number;
  schedule?: string;
  capacity?: number;
  semester?: string;
  academic_year?: string;
  [key: string]: any;
}

interface CourseData {
  id?: number;
  course_code?: string;
  name?: string;
  description?: string;
  credits?: number;
  hours_per_week?: number;
  department?: string;
  level?: string;
  semester?: string;
  academic_year?: string;
  is_active?: boolean;
  [key: string]: any;
}

interface EnrollmentData {
  id?: number;
  student_id?: number;
  course_id?: number;
  class_id?: number;
  enrollment_date?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped';
  semester?: string;
  academic_year?: string;
  grade?: number;
  credits?: number;
  notes?: string;
  [key: string]: any;
}

interface GradeData {
  id?: number;
  student_id: number;
  course_id: number;
  class_id?: number;
  evaluation_type: string;
  score: number;
  max_score: number;
  weight?: number;
  evaluation_date: string;
  comments?: string;
  [key: string]: any;
}

interface AttendanceData {
  id?: number;
  student_id?: number;
  class_id?: number;
  attendance_date?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
  [key: string]: any;
}

interface CommunicationData {
  id?: number;
  sender_id?: number;
  recipient_id?: number;
  recipient_type?: 'user' | 'group' | 'class' | 'all';
  subject?: string;
  content?: string;
  message_type?: 'info' | 'warning' | 'urgent' | 'announcement' | 'personal';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'draft' | 'sent' | 'delivered' | 'read';
  [key: string]: any;
}

interface ReportData {
  id?: number;
  name?: string;
  type?: string;
  parameters?: Record<string, any>;
  format?: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
  filters?: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
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
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.LIST), { params });
    },

    async create(studentData: StudentData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.CREATE), studentData);
    },

    async update(id: number | string, studentData: StudentData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE)}/${id}`, studentData);
    },

    async delete(id: number | string) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.DELETE)}/${id}`);
    },

    async getById(id: number | string) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.SHOW)}/${id}`);
    },

    async getGrades(id: number | string) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.GRADES).replace('{id}', id.toString()));
    },

    async getAttendance(id: number | string) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.STUDENTS.ATTENDANCE).replace('{id}', id.toString()));
    }
  },

  // Teachers methods
  teachers: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.LIST), { params });
    },

    async create(teacherData: TeacherData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.CREATE), teacherData);
    },

    async update(id: number | string, teacherData: TeacherData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE)}/${id}`, teacherData);
    },

    async delete(id: number | string) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.DELETE)}/${id}`);
    },

    async getById(id: number | string) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.SHOW)}/${id}`);
    },

    async getClasses(id: number | string) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.TEACHERS.CLASSES).replace('{id}', id.toString()));
    }
  },

  // Classes methods
  classes: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.LIST), { params });
    },

    async create(classData: ClassData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.CREATE), classData);
    },

    async update(id: number | string, classData: ClassData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.UPDATE)}/${id}`, classData);
    },

    async delete(id: number | string) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.DELETE)}/${id}`);
    },

    async getById(id: number | string) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.SHOW)}/${id}`);
    },

    async getStudents(id: number | string) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.CLASSES.STUDENTS).replace('{id}', id.toString()));
    }
  },

  // Courses methods
  courses: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.COURSES?.LIST || '/api/courses'), { params });
    },

    async create(courseData: CourseData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.COURSES?.CREATE || '/api/courses'), courseData);
    },

    async update(id: number | string, courseData: CourseData) {
      return await apiClient.put(getEndpoint(API_CONFIG.ENDPOINTS.COURSES?.UPDATE || `/api/courses/${id}`), courseData);
    },

    async delete(id: number | string) {
      return await apiClient.delete(getEndpoint(API_CONFIG.ENDPOINTS.COURSES?.DELETE || `/api/courses/${id}`));
    },

    async getById(id: number | string) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.COURSES?.SHOW || `/api/courses/${id}`));
    }
  },

  // Enrollments methods
  enrollments: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.ENROLLMENTS.LIST), { params });
    },

    async create(enrollmentData: EnrollmentData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.ENROLLMENTS.CREATE), enrollmentData);
    },

    async update(id: number | string, enrollmentData: EnrollmentData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.ENROLLMENTS.UPDATE)}/${id}`, enrollmentData);
    },

    async delete(id: number | string) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.ENROLLMENTS.DELETE)}/${id}`);
    },

    async getById(id: number | string) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.ENROLLMENTS.SHOW)}/${id}`);
    },

    async bulkCreate(enrollmentDataArray: EnrollmentData[]) {
      return await apiClient.post('/api/enrollments/bulk', enrollmentDataArray);
    }
  },

  // Grades methods
  grades: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.GRADES.LIST), { params });
    },

    async create(gradeData: GradeData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.GRADES.CREATE), gradeData);
    },

    async update(id: number | string, gradeData: GradeData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.GRADES.UPDATE)}/${id}`, gradeData);
    },

    async delete(id: number | string) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.GRADES.DELETE)}/${id}`);
    }
  },

  // Attendance methods
  attendance: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.LIST), { params });
    },

    async create(attendanceData: AttendanceData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.CREATE), attendanceData);
    },

    async update(id: number | string, attendanceData: AttendanceData) {
      return await apiClient.put(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.UPDATE).replace(':id', id.toString()), attendanceData);
    },

    async markAttendance(attendanceData: AttendanceData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.MARK), attendanceData);
    },

    async bulkCreate(attendanceDataArray: AttendanceData[]) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.ATTENDANCE.BULK_CREATE || '/api/attendance/bulk'), attendanceDataArray);
    }
  },

  // Communications methods
  communications: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.LIST), { params });
    },

    async create(communicationData: CommunicationData | FormData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.CREATE), communicationData);
    },

    async update(id: number | string, communicationData: CommunicationData) {
      return await apiClient.put(`${getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.UPDATE)}/${id}`, communicationData);
    },

    async delete(id: number | string) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.DELETE)}/${id}`);
    },

    async send(messageData: CommunicationData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.SEND), messageData);
    },

    async getConversations(params: ApiParams = {}) {
      return await apiClient.get('/api/communications/conversations', { params });
    },

    async getConversationMessages(conversationId: number | string, params: ApiParams = {}) {
      return await apiClient.get(`/api/communications/conversations/${conversationId}/messages`, { params });
    },

    async reply(messageData: CommunicationData) {
      return await apiClient.post('/api/communications/reply', messageData);
    },

    async getById(id: number | string) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.COMMUNICATIONS.SHOW).replace(':id', id.toString()));
    },

    async markAsRead(messageId: number | string) {
      return await apiClient.put(`/api/communications/messages/${messageId}/read`);
    }
  },

  // Reports methods
  reports: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.LIST), { params });
    },

    async generate(reportData: ReportData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.GENERATE), reportData);
    },

    async download(reportId: number | string) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.DOWNLOAD)}/${reportId}`, {
        responseType: 'blob'
      });
    },

    async preview(reportId: number | string | ReportData) {
      if (typeof reportId === 'object') {
        return await apiClient.post(`${getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.PREVIEW)}`, reportId);
      }
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.PREVIEW)}/${reportId}`);
    },

    async delete(id: number | string) {
      return await apiClient.delete(`${getEndpoint(API_CONFIG.ENDPOINTS.REPORTS.DELETE)}/${id}`);
    }
  },

  // Resources methods
  resources: {
    async getAll(params: ApiParams = {}) {
      return await apiClient.get(getEndpoint(API_CONFIG.ENDPOINTS.RESOURCES.LIST), { params });
    },

    async upload(formData: FormData) {
      return await apiClient.post(getEndpoint(API_CONFIG.ENDPOINTS.RESOURCES.UPLOAD), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },

    async download(resourceId: number | string) {
      return await apiClient.get(`${getEndpoint(API_CONFIG.ENDPOINTS.RESOURCES.DOWNLOAD)}/${resourceId}`, {
        responseType: 'blob'
      });
    },

    async delete(id: number | string) {
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