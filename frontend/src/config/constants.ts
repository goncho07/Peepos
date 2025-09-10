// Sistema de Configuración Centralizada
// Este archivo centraliza todas las constantes del sistema para evitar código hardcodeado

// Configuración de áreas organizacionales
export const SYSTEM_AREAS = {
  DIRECCION: 'Dirección',
  ACADEMICO: 'Académico',
  ADMINISTRACION: 'Administración',
  RECURSOS_HUMANOS: 'Recursos Humanos',
  SISTEMAS: 'Sistemas',
  CONTABILIDAD: 'Contabilidad',
  SECRETARIA: 'Secretaría',
  MANTENIMIENTO: 'Mantenimiento'
} as const;

// Array de áreas para uso en formularios
export const AREAS_LIST = Object.values(SYSTEM_AREAS);

// Configuración de roles del sistema
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  COORDINATOR: 'coordinator',
  SECRETARY: 'secretary'
} as const;

// Configuración de permisos del sistema
export const SYSTEM_PERMISSIONS = {
  // Usuarios
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Estudiantes
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_EDIT: 'students.edit',
  STUDENTS_DELETE: 'students.delete',
  
  // Profesores
  TEACHERS_VIEW: 'teachers.view',
  TEACHERS_CREATE: 'teachers.create',
  TEACHERS_EDIT: 'teachers.edit',
  TEACHERS_DELETE: 'teachers.delete',
  
  // Cursos
  COURSES_VIEW: 'courses.view',
  COURSES_CREATE: 'courses.create',
  COURSES_EDIT: 'courses.edit',
  COURSES_DELETE: 'courses.delete',
  
  // Calificaciones
  GRADES_VIEW: 'grades.view',
  GRADES_CREATE: 'grades.create',
  GRADES_EDIT: 'grades.edit',
  GRADES_DELETE: 'grades.delete',
  
  // Asistencia
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_CREATE: 'attendance.create',
  ATTENDANCE_EDIT: 'attendance.edit',
  
  // Reportes
  REPORTS_VIEW: 'reports.view',
  REPORTS_GENERATE: 'reports.generate',
  
  // Comunicaciones
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_CREATE: 'communications.create',
  COMMUNICATIONS_EDIT: 'communications.edit',
  COMMUNICATIONS_DELETE: 'communications.delete'
} as const;

// Estados de asistencia
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
} as const;

// Configuración de estados de asistencia con etiquetas
export const ATTENDANCE_STATUS_CONFIG = {
  [ATTENDANCE_STATUS.PRESENT]: {
    label: 'Presente',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  [ATTENDANCE_STATUS.ABSENT]: {
    label: 'Ausente',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  [ATTENDANCE_STATUS.LATE]: {
    label: 'Tardanza',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  [ATTENDANCE_STATUS.EXCUSED]: {
    label: 'Justificado',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  }
} as const;

// Estados de calificaciones
export const GRADE_STATUS = {
  PENDING: 'pending',
  GRADED: 'graded',
  REVIEWED: 'reviewed',
  FINAL: 'final'
} as const;

// Tipos de evaluación
export const EVALUATION_TYPES = {
  EXAM: 'exam',
  QUIZ: 'quiz',
  HOMEWORK: 'homework',
  PROJECT: 'project',
  PARTICIPATION: 'participation'
} as const;

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
} as const;

// Configuración de validación
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  DNI_LENGTH: 8,
  PHONE_MIN_LENGTH: 9,
  PHONE_MAX_LENGTH: 15
} as const;

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES_PER_UPLOAD: 10
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000, // 5 segundos
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 7000,
  WARNING_DURATION: 5000
} as const;

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// Configuración de fechas
export const DATE_CONFIG = {
  DEFAULT_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  TIME_FORMAT: 'HH:mm',
  API_DATE_FORMAT: 'YYYY-MM-DD',
  API_DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss'
} as const;

// Configuración de semestres académicos
export const ACADEMIC_CONFIG = {
  SEMESTERS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  MIN_GRADE: 0,
  MAX_GRADE: 20,
  PASSING_GRADE: 11,
  CREDIT_RANGE: { min: 1, max: 6 }
} as const;

// Configuración de comunicaciones
export const COMMUNICATION_TYPES = {
  ANNOUNCEMENT: 'announcement',
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
  ALERT: 'alert'
} as const;

// Configuración de prioridades
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

// Configuración de estados generales
export const GENERAL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived'
} as const;

// Helper functions para obtener configuraciones
export const getAttendanceStatusConfig = (status: keyof typeof ATTENDANCE_STATUS) => {
  return ATTENDANCE_STATUS_CONFIG[ATTENDANCE_STATUS[status]];
};

export const getAreasList = () => AREAS_LIST;

export const getRolesList = () => Object.values(SYSTEM_ROLES);

export const getPermissionsList = () => Object.values(SYSTEM_PERMISSIONS);

// Función para validar si un valor está en una configuración
export const isValidValue = <T extends Record<string, any>>(config: T, value: any): value is T[keyof T] => {
  return Object.values(config).includes(value);
};

// Función para obtener la etiqueta de un valor de configuración
export const getConfigLabel = <T extends Record<string, any>>(config: T, value: T[keyof T]): string => {
  const key = Object.keys(config).find(k => config[k] === value);
  return key ? key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : value;
};

export default {
  SYSTEM_AREAS,
  AREAS_LIST,
  SYSTEM_ROLES,
  SYSTEM_PERMISSIONS,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_CONFIG,
  GRADE_STATUS,
  EVALUATION_TYPES,
  PAGINATION_CONFIG,
  VALIDATION_CONFIG,
  FILE_CONFIG,
  NOTIFICATION_CONFIG,
  NOTIFICATION_TYPES,
  DATE_CONFIG,
  ACADEMIC_CONFIG,
  COMMUNICATION_TYPES,
  PRIORITY_LEVELS,
  GENERAL_STATUS,
  getAttendanceStatusConfig,
  getAreasList,
  getRolesList,
  getPermissionsList,
  isValidValue,
  getConfigLabel
};