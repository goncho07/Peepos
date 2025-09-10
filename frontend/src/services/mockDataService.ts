// Servicio para generar datos de ejemplo aleatorios

// Types for mock data
interface Student {
  id: number;
  codigo: string;
  nombre: string;
  grado: string;
  seccion: string;
  edad: number;
  email: string;
  telefono: string;
  fechaIngreso: Date;
  estado: string;
  promedio: string;
  asistencia: string;
}

interface Teacher {
  id: number;
  codigo: string;
  nombre: string;
  especialidad: string;
  email: string;
  telefono: string;
  fechaIngreso: Date;
  estado: string;
}

interface Grade {
  id: number;
  estudiante: string;
  materia: string;
  nota: number;
  fecha: Date;
  tipo: string;
}

const nombres = [
  'Ana García', 'Carlos López', 'María Rodríguez', 'José Martínez', 'Carmen Sánchez',
  'Francisco Pérez', 'Isabel Gómez', 'Antonio Fernández', 'Dolores Ruiz', 'Manuel Díaz',
  'Pilar Moreno', 'Jesús Muñoz', 'Teresa Álvarez', 'Alejandro Romero', 'Concepción Navarro',
  'Miguel Jiménez', 'Rosario Iglesias', 'Pedro Medina', 'Antonia Garrido', 'Rafael Serrano',
  'Francisca Ramos', 'Juan Carlos Molina', 'Josefa Morales', 'Daniel Ortega', 'Mercedes Delgado'
];

const apellidos = [
  'García', 'López', 'Rodríguez', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Fernández',
  'Ruiz', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Navarro', 'Jiménez',
  'Iglesias', 'Medina', 'Garrido', 'Serrano', 'Ramos', 'Molina', 'Morales', 'Ortega'
];

const materias = [
  'Matemáticas', 'Comunicación', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés',
  'Educación Física', 'Arte', 'Religión', 'Computación', 'Tutoría'
];

const grados = ['1°', '2°', '3°', '4°', '5°'];
const secciones = ['A', 'B', 'C', 'D'];
const estados = ['Activo', 'Inactivo', 'Pendiente', 'Completado', 'En Proceso'];

const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generar estudiantes
export const generateStudents = (count: number = 50): Student[] => {
  return Array.from({ length: count }, (_, index) => {
    const nombre = getRandomElement(nombres);
    const apellido = getRandomElement(apellidos);
    return {
      id: index + 1,
      codigo: `EST${String(index + 1).padStart(4, '0')}`,
      nombre: `${nombre} ${apellido}`,
      grado: getRandomElement(grados),
      seccion: getRandomElement(secciones),
      edad: getRandomNumber(11, 17),
      email: `${nombre.toLowerCase().replace(' ', '.')}.${apellido.toLowerCase()}@estudiante.edu.pe`,
      telefono: `9${getRandomNumber(10000000, 99999999)}`,
      fechaIngreso: getRandomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
      estado: getRandomElement(['Activo', 'Inactivo']),
      promedio: (Math.random() * 10 + 10).toFixed(1),
      asistencia: `${getRandomNumber(85, 100)}%`
    };
  });
};

// Generar docentes
export const generateTeachers = (count = 20) => {
  return Array.from({ length: count }, (_, index) => {
    const nombre = getRandomElement(nombres);
    const apellido = getRandomElement(apellidos);
    return {
      id: index + 1,
      codigo: `DOC${String(index + 1).padStart(4, '0')}`,
      nombre: `${nombre} ${apellido}`,
      especialidad: getRandomElement(materias),
      email: `${nombre.toLowerCase().replace(' ', '.')}.${apellido.toLowerCase()}@colegio.edu.pe`,
      telefono: `9${getRandomNumber(10000000, 99999999)}`,
      fechaIngreso: getRandomDate(new Date(2015, 0, 1), new Date(2024, 11, 31)),
      estado: getRandomElement(['Activo', 'Inactivo']),
      experiencia: `${getRandomNumber(1, 20)} años`,
      grados: Array.from({ length: getRandomNumber(1, 3) }, () =>
        `${getRandomElement(grados)} ${getRandomElement(secciones)}`
      ).join(', ')
    };
  });
};

// Generar clases
export const generateClasses = (count = 30) => {
  return Array.from({ length: count }, (_, index) => {
    return {
      id: index + 1,
      codigo: `CLS${String(index + 1).padStart(4, '0')}`,
      materia: getRandomElement(materias),
      grado: getRandomElement(grados),
      seccion: getRandomElement(secciones),
      docente: getRandomElement(nombres),
      horario: `${getRandomNumber(8, 15)}:00 - ${getRandomNumber(9, 16)}:00`,
      aula: `Aula ${getRandomNumber(101, 320)}`,
      estudiantes: getRandomNumber(25, 35),
      estado: getRandomElement(['Activo', 'Inactivo']),
      periodo: '2024'
    };
  });
};

// Generar asistencias
export const generateAttendance = (count = 100) => {
  return Array.from({ length: count }, (_, index) => {
    const fecha = getRandomDate(new Date(2024, 0, 1), new Date());
    return {
      id: index + 1,
      estudiante: getRandomElement(nombres),
      clase: getRandomElement(materias),
      fecha: fecha,
      estado: getRandomElement(['Presente', 'Ausente', 'Tardanza', 'Justificado']),
      hora: `${getRandomNumber(8, 15)}:${getRandomNumber(0, 59).toString().padStart(2, '0')}`,
      observaciones: Math.random() > 0.7 ? getRandomElement([
        'Llegó tarde por transporte',
        'Justificado por cita médica',
        'Ausente por enfermedad',
        'Participación activa en clase'
      ]) : ''
    };
  });
};

// Generar calificaciones
export const generateGrades = (count = 80) => {
  return Array.from({ length: count }, (_, index) => {
    return {
      id: index + 1,
      estudiante: getRandomElement(nombres),
      materia: getRandomElement(materias),
      bimestre: getRandomElement(['I', 'II', 'III', 'IV']),
      nota: getRandomNumber(11, 20),
      fecha: getRandomDate(new Date(2024, 0, 1), new Date()),
      tipo: getRandomElement(['Examen', 'Práctica', 'Tarea', 'Proyecto']),
      peso: getRandomElement([20, 30, 40, 50]),
      observaciones: Math.random() > 0.6 ? getRandomElement([
        'Excelente desempeño',
        'Necesita mejorar',
        'Buen trabajo',
        'Requiere refuerzo'
      ]) : ''
    };
  });
};

// Generar comunicaciones
export const generateCommunications = (count = 25) => {
  return Array.from({ length: count }, (_, index) => {
    return {
      id: index + 1,
      titulo: getRandomElement([
        'Reunión de padres de familia',
        'Actividad deportiva',
        'Examen bimestral',
        'Día del logro',
        'Simulacro de sismo',
        'Ceremonia de graduación',
        'Feria de ciencias',
        'Concurso de matemáticas'
      ]),
      tipo: getRandomElement(['Comunicado', 'Citación', 'Invitación', 'Recordatorio']),
      destinatario: getRandomElement(['Padres de familia', 'Estudiantes', 'Docentes', 'Todos']),
      fecha: getRandomDate(new Date(2024, 0, 1), new Date()),
      estado: getRandomElement(['Enviado', 'Pendiente', 'Leído']),
      prioridad: getRandomElement(['Alta', 'Media', 'Baja']),
      autor: getRandomElement(nombres)
    };
  });
};

// Generar reportes
export const generateReports = (count = 15) => {
  return Array.from({ length: count }, (_, index) => {
    return {
      id: index + 1,
      titulo: getRandomElement([
        'Reporte de Asistencia Mensual',
        'Análisis de Calificaciones',
        'Estadísticas de Rendimiento',
        'Reporte Disciplinario',
        'Informe de Actividades',
        'Evaluación Docente',
        'Reporte Financiero'
      ]),
      tipo: getRandomElement(['Académico', 'Administrativo', 'Financiero', 'Disciplinario']),
      periodo: getRandomElement(['Enero 2024', 'Febrero 2024', 'Marzo 2024', 'I Bimestre', 'II Bimestre']),
      fechaCreacion: getRandomDate(new Date(2024, 0, 1), new Date()),
      estado: getRandomElement(['Completado', 'En Proceso', 'Pendiente']),
      autor: getRandomElement(nombres),
      formato: getRandomElement(['PDF', 'Excel', 'Word'])
    };
  });
};

// Generar recursos
export const generateResources = (count = 40) => {
  return Array.from({ length: count }, (_, index) => {
    return {
      id: index + 1,
      nombre: getRandomElement([
        'Libro de Matemáticas 5°',
        'Proyector Multimedia',
        'Laboratorio de Ciencias',
        'Computadoras del Aula',
        'Material Deportivo',
        'Instrumentos Musicales',
        'Biblioteca Escolar',
        'Tablets Educativas'
      ]),
      tipo: getRandomElement(['Material', 'Equipo', 'Infraestructura', 'Digital']),
      categoria: getRandomElement(['Académico', 'Deportivo', 'Tecnológico', 'Artístico']),
      cantidad: getRandomNumber(1, 50),
      estado: getRandomElement(['Disponible', 'En Uso', 'Mantenimiento', 'Dañado']),
      ubicacion: getRandomElement(['Aula 101', 'Laboratorio', 'Biblioteca', 'Gimnasio', 'Almacén']),
      fechaAdquisicion: getRandomDate(new Date(2020, 0, 1), new Date()),
      responsable: getRandomElement(nombres)
    };
  });
};

// Función principal para obtener todos los datos
export const getAllMockData = () => {
  return {
    students: generateStudents(),
    teachers: generateTeachers(),
    classes: generateClasses(),
    attendance: generateAttendance(),
    grades: generateGrades(),
    communications: generateCommunications(),
    reports: generateReports(),
    resources: generateResources()
  };
};

// Estadísticas del dashboard
export const getDashboardStats = () => {
  return {
    totalStudents: getRandomNumber(450, 550),
    totalTeachers: getRandomNumber(25, 35),
    totalClasses: getRandomNumber(28, 35),
    attendanceRate: getRandomNumber(88, 96),
    averageGrade: (Math.random() * 3 + 14).toFixed(1),
    activeUsers: getRandomNumber(380, 420)
  };
};

export default {
  generateStudents,
  generateTeachers,
  generateClasses,
  generateAttendance,
  generateGrades,
  generateCommunications,
  generateReports,
  generateResources,
  getAllMockData,
  getDashboardStats
};