// API Configuration
import { getConfig, getApiUrl } from './environment';

interface ApiEndpoints {
  [key: string]: string | ApiEndpoints;
}

// Type for final endpoint values (only strings)
type EndpointValue = string;

interface ApiConfig {
  BASE_URL: string;
  TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  RETRY_DELAY: number;
  HEADERS: {
    'Content-Type': string;
    'Accept': string;
    'X-Requested-With': string;
  };
  ENDPOINTS: {
    AUTH: ApiEndpoints;
    DASHBOARD: ApiEndpoints;
    USERS: ApiEndpoints;
    STUDENTS: ApiEndpoints;
    TEACHERS: ApiEndpoints;
    CLASSES: ApiEndpoints;
    COURSES: ApiEndpoints;
    ENROLLMENTS: ApiEndpoints;
    GRADES: ApiEndpoints;
    ATTENDANCE: ApiEndpoints;
    COMMUNICATIONS: ApiEndpoints;
    REPORTS: ApiEndpoints;
    RESOURCES: ApiEndpoints;
  };
}

const API_CONFIG: ApiConfig = {
  // Usar configuración de entorno robusta
  BASE_URL: getConfig('API_URL'),
  TIMEOUT: getConfig('API_TIMEOUT'),
  RETRY_ATTEMPTS: getConfig('API_RETRY_ATTEMPTS'),
  RETRY_DELAY: getConfig('API_RETRY_DELAY'),

  // Headers for API requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },

  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      CSRF: '/sanctum/csrf-cookie'
    },

    // Dashboard
    DASHBOARD: {
      ADMIN: '/dashboard/admin',
      STUDENT: '/dashboard/student',
      TEACHER: '/dashboard/teacher'
    },

    // Users
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: '/users',
      DELETE: '/users',
      SHOW: '/users'
    },

    // Students
    STUDENTS: {
      LIST: '/students',
      CREATE: '/students',
      UPDATE: '/students',
      DELETE: '/students',
      SHOW: '/students',
      GRADES: '/students/{id}/grades',
      ATTENDANCE: '/students/{id}/attendance'
    },

    // Teachers
    TEACHERS: {
      LIST: '/teachers',
      CREATE: '/teachers',
      UPDATE: '/teachers',
      DELETE: '/teachers',
      SHOW: '/teachers',
      CLASSES: '/teachers/{id}/classes'
    },

    // Classes
    CLASSES: {
      LIST: '/classes',
      CREATE: '/classes',
      UPDATE: '/classes',
      DELETE: '/classes',
      SHOW: '/classes',
      STUDENTS: '/classes/{id}/students'
    },

    // Courses
    COURSES: {
      LIST: '/courses',
      CREATE: '/courses',
      UPDATE: '/courses',
      DELETE: '/courses',
      SHOW: '/courses'
    },

    // Enrollments endpoints
    ENROLLMENTS: {
      LIST: '/enrollments',
      CREATE: '/enrollments',
      UPDATE: '/enrollments',
      DELETE: '/enrollments',
      SHOW: '/enrollments'
    },

    // Grades
    GRADES: {
      LIST: '/grades',
      CREATE: '/grades',
      UPDATE: '/grades',
      DELETE: '/grades'
    },

    // Attendance
    ATTENDANCE: {
      LIST: '/attendance',
      CREATE: '/attendance',
      UPDATE: '/attendance',
      MARK: '/attendance/mark'
    },

    // Communications
    COMMUNICATIONS: {
      LIST: '/communications',
      CREATE: '/communications',
      UPDATE: '/communications',
      DELETE: '/communications',
      SHOW: '/communications',
      SEND: '/communications/send'
    },

    // Reports
    REPORTS: {
      LIST: '/reports',
      GENERATE: '/reports/generate',
      DOWNLOAD: '/reports/download',
      PREVIEW: '/reports/preview',
      DELETE: '/reports'
    },

    // Resources
    RESOURCES: {
      LIST: '/resources',
      UPLOAD: '/resources/upload',
      DOWNLOAD: '/resources/download',
      DELETE: '/resources'
    }
  }
};

export default API_CONFIG;