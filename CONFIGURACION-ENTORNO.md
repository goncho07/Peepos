# Guía de Configuración del Entorno de Desarrollo

## Problemas Identificados

1. **PHP no está instalado** en el sistema local
2. **Docker Desktop tiene problemas** de conectividad
3. **Backend API no está corriendo** en el puerto 8000

## Soluciones Recomendadas

### Opción 1: Instalar PHP Localmente (Recomendado)

#### 1.1 Usando XAMPP (Más Fácil)
1. Descargar XAMPP desde: https://www.apachefriends.org/download.html
2. Instalar XAMPP
3. Agregar PHP al PATH del sistema:
   - Abrir "Variables de entorno del sistema"
   - Agregar `C:\xampp\php` al PATH
   - Reiniciar PowerShell

#### 1.2 Usando PHP Standalone
1. Descargar PHP desde: https://windows.php.net/download/
2. Extraer en `C:\php`
3. Agregar `C:\php` al PATH del sistema
4. Copiar `php.ini-development` a `php.ini`
5. Habilitar extensiones necesarias en `php.ini`:
   ```ini
   extension=pdo_pgsql
   extension=mbstring
   extension=openssl
   extension=curl
   ```

#### 1.3 Instalar Composer
1. Descargar desde: https://getcomposer.org/download/
2. Ejecutar el instalador
3. Verificar: `composer --version`

### Opción 2: Reparar Docker

#### 2.1 Reiniciar Docker Desktop
1. Cerrar Docker Desktop completamente
2. Reiniciar como administrador
3. Esperar a que se inicie completamente

#### 2.2 Verificar Docker
```powershell
docker --version
docker ps
```

#### 2.3 Si Docker funciona, usar:
```powershell
docker-compose up -d postgres redis
docker-compose up backend
```

### Opción 3: Usar Laragon (Alternativa)

1. Descargar Laragon desde: https://laragon.org/download/
2. Instalar con PHP 8.3, Composer, y PostgreSQL
3. Iniciar Laragon
4. PHP y Composer estarán disponibles automáticamente

## Pasos Después de Instalar PHP

### 1. Configurar el Backend
```powershell
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Configurar Base de Datos
Editar `.env` con los datos de tu base de datos:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sge_ricardo_palma
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

### 3. Ejecutar Migraciones
```powershell
php artisan migrate
php artisan db:seed
```

### 4. Iniciar el Servidor
```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

## Verificación de APIs

Una vez que el backend esté corriendo, verificar:

### Endpoints Principales
- `GET http://localhost:8000/api/health` - Estado del servidor
- `POST http://localhost:8000/api/auth/login` - Login
- `GET http://localhost:8000/api/user` - Usuario autenticado
- `GET http://localhost:8000/api/courses` - Cursos
- `GET http://localhost:8000/api/students` - Estudiantes

### Credenciales de Prueba
```json
{
  "email": "admin@peepos.com",
  "password": "123"
}
```

## Solución de Problemas Comunes

### Error: "Class not found"
```powershell
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

### Error: "Key not found"
```powershell
php artisan key:generate
```

### Error de Base de Datos
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `.env`
3. Crear la base de datos manualmente si no existe

### Error de Permisos
```powershell
# En el directorio backend
chmod -R 775 storage bootstrap/cache
```

## Estado Actual del Proyecto

✅ **Frontend**: Funcionando en http://localhost:3000
❌ **Backend**: No está corriendo (falta PHP)
❌ **Base de Datos**: No configurada
❌ **Docker**: Problemas de conectividad

## Próximos Pasos

1. Instalar PHP usando una de las opciones anteriores
2. Configurar la base de datos PostgreSQL
3. Ejecutar el script `start-backend.bat`
4. Verificar que las APIs respondan correctamente
5. Probar la integración frontend-backend

---

**Nota**: Una vez que tengas PHP instalado, ejecuta `start-backend.bat` desde el directorio raíz del proyecto para iniciar el servidor automáticamente.