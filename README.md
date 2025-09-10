# Sistema de Gestión Escolar - IEE 6049 Ricardo Palma

## Descripción

Sistema integral de gestión escolar diseñado específicamente para la IEE 6049 Ricardo Palma (Lima, Perú). La solución digitaliza y centraliza los procesos de directivos, docentes, estudiantes y apoderados bajo los principios Mobile-First, Offline-First y API-First.

## Arquitectura

- **Backend**: Laravel 11 + PHP 8.3
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Base de Datos**: PostgreSQL 15
- **Cache & Colas**: Redis 7
- **Contenedores**: Docker Compose

## Credenciales de Demostración

**Usuario**: `123`  
**Contraseña**: `123`

Al iniciar sesión, serás redirigido al dashboard correspondiente a tu perfil asignado.

## Perfiles de Usuario

### 1. Perfil Administrativo (Director/Admin)
- Dashboard con KPIs estratégicos
- Gestión completa de usuarios
- Administración de matrícula
- Supervisión académica
- Reportes para UGEL
- Gestión de recursos y finanzas

### 2. Perfil Docente
- Dashboard simplificado
- Gestión de secciones asignadas
- Registro de asistencia y calificaciones
- Comunicaciones con estudiantes y apoderados
- Reserva de recursos

### 3. Perfil Alumno
- Resumen de rendimiento académico
- Visualización de calificaciones
- Historial de asistencia
- Horario de clases
- Bandeja de comunicaciones

## Instalación

### Prerrequisitos
- Docker y Docker Compose
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd peepos4
   ```

2. **Construir y levantar los contenedores**
   ```bash
   docker-compose up --build -d
   ```

3. **Instalar dependencias del backend**
   ```bash
   docker-compose exec backend composer install
   ```

4. **Generar clave de aplicación**
   ```bash
   docker-compose exec backend php artisan key:generate
   ```

5. **Ejecutar migraciones y seeders**
   ```bash
   docker-compose exec backend php artisan migrate --seed
   ```

6. **Instalar dependencias del frontend**
   ```bash
   docker-compose exec frontend npm install
   ```

## Acceso a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Aplicación completa**: http://localhost (vía Nginx)

## Estructura del Proyecto

```
peepos4/
├── backend/           # Laravel API
│   ├── app/
│   ├── config/
│   ├── database/
│   └── routes/
├── frontend/          # React SPA
│   ├── src/
│   ├── public/
│   └── package.json
├── nginx/             # Configuración proxy
└── docker-compose.yml # Orquestación de servicios
```

## Características Principales

### Seguridad
- Autenticación con Laravel Sanctum
- RBAC (Control de Acceso Basado en Roles)
- HTTPS/TLS obligatorio
- Auditoría de acciones

### Performance
- Cache con Redis
- Paginación basada en cursor
- Optimización de consultas
- Lazy loading de componentes

### UX/UI
- Diseño Mobile-First
- Interfaz reactiva con Framer Motion
- Tema personalizable
- Componentes reutilizables

## Comandos Útiles

### Backend (Laravel)
```bash
# Ejecutar migraciones
docker-compose exec backend php artisan migrate

# Crear seeder
docker-compose exec backend php artisan make:seeder UserSeeder

# Limpiar cache
docker-compose exec backend php artisan cache:clear

# Ejecutar tests
docker-compose exec backend php artisan test
```

### Frontend (React)
```bash
# Instalar dependencias
docker-compose exec frontend npm install

# Ejecutar tests
docker-compose exec frontend npm test

# Build para producción
docker-compose exec frontend npm run build
```

### Base de Datos
```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U sge_user -d sge_ricardo_palma

# Backup de base de datos
docker-compose exec postgres pg_dump -U sge_user sge_ricardo_palma > backup.sql
```

## Desarrollo

### Agregar Nueva Funcionalidad
1. Crear migración y modelo en Laravel
2. Implementar controlador y rutas API
3. Crear componentes React
4. Agregar rutas en React Router
5. Implementar tests

### Estructura de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Cambios de formato
- `refactor:` Refactorización
- `test:` Tests

## Soporte

Para soporte técnico o reportar issues, contactar al equipo de desarrollo.

## Licencia

Este proyecto está licenciado bajo MIT License.