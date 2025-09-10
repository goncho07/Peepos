# Configuración de Seeders - Sistema de Gestión Educativa

## Estado Actual

Se han creado todos los seeders necesarios para poblar la base de datos con datos de demostración:

### Seeders Creados:

1. **DatabaseSeeder.php** - Seeder principal que ejecuta todos los demás
2. **UserSeeder.php** - Crea usuarios de demostración con credenciales 123/123
3. **CourseSeeder.php** - Genera cursos académicos por departamento
4. **EnrollmentSeeder.php** - Matricula estudiantes en cursos
5. **GradeSeeder.php** - Crea calificaciones realistas
6. **AttendanceSeeder.php** - Genera registros de asistencia
7. **CommunicationSeeder.php** - Crea mensajes y anuncios del sistema

### Usuarios de Demostración Configurados:

- **Administrador**: admin@peepos.com / 123
- **Docente**: teacher@peepos.com / 123  
- **Estudiante**: student@peepos.com / 123

### Para Ejecutar los Seeders:

#### Opción 1: Con Docker (Recomendado)
```bash
# Levantar servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend php artisan migrate

# Ejecutar seeders
docker-compose exec backend php artisan db:seed
```

#### Opción 2: Con PHP Local
```bash
# Instalar dependencias
composer install

# Configurar archivo .env con base de datos
cp .env.example .env
php artisan key:generate

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders
php artisan db:seed
```

### Datos Generados:

- **Usuarios**: 1 admin, 5 docentes, 7 estudiantes
- **Cursos**: 13 cursos distribuidos por grados (10°, 11°, 12°)
- **Matrículas**: Estudiantes matriculados según su grado
- **Calificaciones**: 6-10 calificaciones por matrícula con distribución realista
- **Asistencia**: Registros con 75% presente, 10% tarde, 7% justificado, 8% ausente
- **Comunicaciones**: Anuncios, mensajes entre usuarios, notificaciones

### Estructura de Base de Datos:

- users (usuarios base)
- students, teachers, admins (perfiles específicos)
- courses (cursos académicos)
- classes (clases programadas)
- enrollments (matrículas)
- grades (calificaciones)
- attendances (asistencia)
- communications (mensajes/anuncios)

### Próximos Pasos:

1. Resolver problemas de Docker Desktop
2. Ejecutar migraciones y seeders
3. Verificar conexión frontend-backend
4. Probar login con credenciales de demostración
5. Validar funcionalidad de dashboards por rol

## Notas Técnicas:

- Los seeders están configurados para generar datos realistas
- Las calificaciones siguen una distribución normal
- La asistencia refleja patrones típicos de estudiantes
- Los cursos están organizados por departamentos académicos
- Las comunicaciones incluyen diferentes tipos de mensajes

Todos los archivos de seeders están listos y ubicados en:
`backend/database/seeders/`