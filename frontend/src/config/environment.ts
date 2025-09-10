// Sistema de Configuración de Entorno Robusto
// Este archivo maneja la configuración de entorno con validación y valores por defecto

interface EnvironmentConfig {
  // API Configuration
  API_URL: string;
  BACKEND_URL: string;
  FRONTEND_URL: string;
  
  // Application Configuration
  APP_NAME: string;
  APP_VERSION: string;
  APP_ENV: 'development' | 'production' | 'staging' | 'test';
  
  // Authentication Configuration
  TOKEN_STORAGE_KEY: string;
  SESSION_TIMEOUT: number;
  
  // API Configuration
  API_TIMEOUT: number;
  API_RETRY_ATTEMPTS: number;
  API_RETRY_DELAY: number;
  
  // Feature Flags
  ENABLE_DEBUG: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_ERROR_REPORTING: boolean;
  
  // Performance Configuration
  PAGINATION_DEFAULT_SIZE: number;
  PAGINATION_MAX_SIZE: number;
  
  // File Upload Configuration
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  
  // Notification Configuration
  NOTIFICATION_TIMEOUT: number;
  ENABLE_PUSH_NOTIFICATIONS: boolean;
}

// Función para validar URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Función para validar números positivos
const isPositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

// Función para validar booleanos
const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

// Función para validar arrays de strings
const parseStringArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

// Función para obtener variable de entorno con validación
const getEnvVar = (
  key: string, 
  defaultValue: any, 
  validator?: (value: any) => boolean,
  parser?: (value: any) => any
): any => {
  const value = import.meta.env[key] || process.env[key];
  
  if (value === undefined || value === null || value === '') {
    console.warn(`Environment variable ${key} not found, using default value:`, defaultValue);
    return defaultValue;
  }
  
  const parsedValue = parser ? parser(value) : value;
  
  if (validator && !validator(parsedValue)) {
    console.error(`Invalid value for environment variable ${key}:`, value, 'Using default:', defaultValue);
    return defaultValue;
  }
  
  return parsedValue;
};

// Configuración por defecto
const DEFAULT_CONFIG: EnvironmentConfig = {
  API_URL: 'http://localhost:8000/api',
  BACKEND_URL: 'http://localhost:8000',
  FRONTEND_URL: 'http://localhost:3000',
  
  // Application Configuration
  APP_NAME: 'Sistema Educativo PEEPOS',
  APP_VERSION: '1.0.0',
  APP_ENV: 'development',
  
  // Authentication Configuration
  TOKEN_STORAGE_KEY: 'auth_token',
  SESSION_TIMEOUT: 7200, // 2 horas en segundos
  
  // API Configuration
  API_TIMEOUT: 10000, // 10 segundos
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000, // 1 segundo
  
  // Feature Flags
  ENABLE_DEBUG: true,
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_REPORTING: false,
  
  // Performance Configuration
  PAGINATION_DEFAULT_SIZE: 10,
  PAGINATION_MAX_SIZE: 100,
  
  // File Upload Configuration
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  
  // Notification Configuration
  NOTIFICATION_TIMEOUT: 5000, // 5 segundos
  ENABLE_PUSH_NOTIFICATIONS: false
};

// Función para cargar y validar la configuración
const loadEnvironmentConfig = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    // API Configuration
    API_URL: getEnvVar(
      'VITE_API_URL',
      DEFAULT_CONFIG.API_URL,
      isValidUrl
    ),
    BACKEND_URL: getEnvVar(
      'VITE_BACKEND_URL',
      DEFAULT_CONFIG.BACKEND_URL,
      isValidUrl
    ),
    FRONTEND_URL: getEnvVar(
      'VITE_FRONTEND_URL',
      DEFAULT_CONFIG.FRONTEND_URL,
      isValidUrl
    ),
    
    // Application Configuration
    APP_NAME: getEnvVar(
      'VITE_APP_NAME',
      DEFAULT_CONFIG.APP_NAME
    ),
    APP_VERSION: getEnvVar(
      'VITE_APP_VERSION',
      DEFAULT_CONFIG.APP_VERSION
    ),
    APP_ENV: getEnvVar(
      'VITE_APP_ENV',
      DEFAULT_CONFIG.APP_ENV,
      (value) => ['development', 'production', 'staging', 'test'].includes(value)
    ) as 'development' | 'production' | 'staging' | 'test',
    
    // Authentication Configuration
    TOKEN_STORAGE_KEY: getEnvVar(
      'VITE_TOKEN_STORAGE_KEY',
      DEFAULT_CONFIG.TOKEN_STORAGE_KEY
    ),
    SESSION_TIMEOUT: getEnvVar(
      'VITE_SESSION_TIMEOUT',
      DEFAULT_CONFIG.SESSION_TIMEOUT,
      isPositiveNumber,
      Number
    ),
    
    // API Configuration
    API_TIMEOUT: getEnvVar(
      'VITE_API_TIMEOUT',
      DEFAULT_CONFIG.API_TIMEOUT,
      isPositiveNumber,
      Number
    ),
    API_RETRY_ATTEMPTS: getEnvVar(
      'VITE_API_RETRY_ATTEMPTS',
      DEFAULT_CONFIG.API_RETRY_ATTEMPTS,
      (value) => isPositiveNumber(value) && Number(value) <= 10,
      Number
    ),
    API_RETRY_DELAY: getEnvVar(
      'VITE_API_RETRY_DELAY',
      DEFAULT_CONFIG.API_RETRY_DELAY,
      isPositiveNumber,
      Number
    ),
    
    // Feature Flags
    ENABLE_DEBUG: getEnvVar(
      'VITE_ENABLE_DEBUG',
      DEFAULT_CONFIG.ENABLE_DEBUG,
      undefined,
      parseBoolean
    ),
    ENABLE_ANALYTICS: getEnvVar(
      'VITE_ENABLE_ANALYTICS',
      DEFAULT_CONFIG.ENABLE_ANALYTICS,
      undefined,
      parseBoolean
    ),
    ENABLE_ERROR_REPORTING: getEnvVar(
      'VITE_ENABLE_ERROR_REPORTING',
      DEFAULT_CONFIG.ENABLE_ERROR_REPORTING,
      undefined,
      parseBoolean
    ),
    
    // Performance Configuration
    PAGINATION_DEFAULT_SIZE: getEnvVar(
      'VITE_PAGINATION_DEFAULT_SIZE',
      DEFAULT_CONFIG.PAGINATION_DEFAULT_SIZE,
      (value) => isPositiveNumber(value) && Number(value) <= 100,
      Number
    ),
    PAGINATION_MAX_SIZE: getEnvVar(
      'VITE_PAGINATION_MAX_SIZE',
      DEFAULT_CONFIG.PAGINATION_MAX_SIZE,
      (value) => isPositiveNumber(value) && Number(value) <= 1000,
      Number
    ),
    
    // File Upload Configuration
    MAX_FILE_SIZE: getEnvVar(
      'VITE_MAX_FILE_SIZE',
      DEFAULT_CONFIG.MAX_FILE_SIZE,
      isPositiveNumber,
      Number
    ),
    ALLOWED_FILE_TYPES: getEnvVar(
      'VITE_ALLOWED_FILE_TYPES',
      DEFAULT_CONFIG.ALLOWED_FILE_TYPES,
      undefined,
      parseStringArray
    ),
    
    // Notification Configuration
    NOTIFICATION_TIMEOUT: getEnvVar(
      'VITE_NOTIFICATION_TIMEOUT',
      DEFAULT_CONFIG.NOTIFICATION_TIMEOUT,
      isPositiveNumber,
      Number
    ),
    ENABLE_PUSH_NOTIFICATIONS: getEnvVar(
      'VITE_ENABLE_PUSH_NOTIFICATIONS',
      DEFAULT_CONFIG.ENABLE_PUSH_NOTIFICATIONS,
      undefined,
      parseBoolean
    )
  };
  
  // Validaciones adicionales
  if (config.PAGINATION_DEFAULT_SIZE > config.PAGINATION_MAX_SIZE) {
    console.warn('PAGINATION_DEFAULT_SIZE is greater than PAGINATION_MAX_SIZE, adjusting...');
    config.PAGINATION_DEFAULT_SIZE = config.PAGINATION_MAX_SIZE;
  }
  
  if (config.API_RETRY_DELAY > config.API_TIMEOUT) {
    console.warn('API_RETRY_DELAY is greater than API_TIMEOUT, adjusting...');
    config.API_RETRY_DELAY = Math.min(config.API_TIMEOUT / 2, 1000);
  }
  
  // Log de configuración en desarrollo
  if (config.ENABLE_DEBUG && config.APP_ENV === 'development') {
    console.group('🔧 Environment Configuration Loaded');
    console.table(config);
    console.groupEnd();
  }
  
  return config;
};

// Cargar configuración
const ENV_CONFIG = loadEnvironmentConfig();

// Función para obtener configuración específica
export const getConfig = <K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] => {
  return ENV_CONFIG[key];
};

// Función para verificar si estamos en un entorno específico
export const isEnvironment = (env: EnvironmentConfig['APP_ENV']): boolean => {
  return ENV_CONFIG.APP_ENV === env;
};

// Función para verificar si una característica está habilitada
export const isFeatureEnabled = (feature: 'DEBUG' | 'ANALYTICS' | 'ERROR_REPORTING' | 'PUSH_NOTIFICATIONS'): boolean => {
  switch (feature) {
    case 'DEBUG':
      return ENV_CONFIG.ENABLE_DEBUG;
    case 'ANALYTICS':
      return ENV_CONFIG.ENABLE_ANALYTICS;
    case 'ERROR_REPORTING':
      return ENV_CONFIG.ENABLE_ERROR_REPORTING;
    case 'PUSH_NOTIFICATIONS':
      return ENV_CONFIG.ENABLE_PUSH_NOTIFICATIONS;
    default:
      return false;
  }
};

// Función para obtener URLs con validación
export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = ENV_CONFIG.API_URL.endsWith('/') ? ENV_CONFIG.API_URL.slice(0, -1) : ENV_CONFIG.API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const getBackendUrl = (path: string = ''): string => {
  const baseUrl = ENV_CONFIG.BACKEND_URL.endsWith('/') ? ENV_CONFIG.BACKEND_URL.slice(0, -1) : ENV_CONFIG.BACKEND_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const getFrontendUrl = (path: string = ''): string => {
  const baseUrl = ENV_CONFIG.FRONTEND_URL.endsWith('/') ? ENV_CONFIG.FRONTEND_URL.slice(0, -1) : ENV_CONFIG.FRONTEND_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Exportar configuración completa
export { ENV_CONFIG };
export type { EnvironmentConfig };
export default ENV_CONFIG;