# Guía de Instalación Completa - Laragon + PHP 8.3 + Composer

## Paso 1: Descargar Laragon

1. Ve a https://laragon.org/download/
2. Descarga **Laragon Full** (incluye PHP, Apache, MySQL, Node.js)
3. Ejecuta el instalador como administrador
4. Instala en `C:\laragon` (ruta recomendada)

## Paso 2: Configurar PHP 8.3

### Opción A: Si Laragon no incluye PHP 8.3
1. Descarga PHP 8.3 desde: https://windows.php.net/download/
2. Extrae en `C:\laragon\bin\php\php-8.3.x`
3. En Laragon: Menu → PHP → Version → php-8.3.x

### Opción B: Usar PHP incluido en Laragon
1. Abre Laragon
2. Click derecho en el icono → PHP → Version
3. Selecciona la versión más reciente disponible

## Paso 3: Verificar Instalación

```powershell
# Abrir terminal en Laragon
php --version
composer --version
node --version
npm --version
```

## Paso 4: Configurar PostgreSQL

### Instalar PostgreSQL
1. Descarga desde: https://www.postgresql.org/download/windows/
2. Instala PostgreSQL 15 o superior
3. Configura usuario: `postgres` / password: `123456`
4. Puerto: `5432`

### Habilitar extensión PostgreSQL en PHP
1. Abre `C:\laragon\bin\php\php-8.3.x\php.ini`
2. Descomenta estas líneas:
```ini
extension=pdo_pgsql
extension=pgsql
extension=mbstring
extension=openssl
extension=curl
extension=fileinfo
extension=gd
extension=zip
```
3. Reinicia Laragon

## Paso 5: Configurar Variables de Entorno

1. Abre "Variables de entorno del sistema"
2. Agrega al PATH:
   - `C:\laragon\bin\php\php-8.3.x`
   - `C:\laragon\bin\composer`
   - `C:\laragon\bin\nodejs`
   - `C:\Program Files\PostgreSQL\15\bin`

## Paso 6: Crear Base de Datos

```sql
-- Conectar a PostgreSQL como postgres
CREATE DATABASE sge_ricardo_palma;
CREATE USER laravel_user WITH PASSWORD '123456';
GRANT ALL PRIVILEGES ON DATABASE sge_ricardo_palma TO laravel_user;
```

## Paso 7: Configurar Proyecto Laravel

```powershell
# En el directorio del proyecto
cd C:\Users\GONZALO\Desktop\peepos4\backend
composer install
cp .env.example .env
php artisan key:generate
```

## Paso 8: Configurar .env

```env
APP_NAME="SGE Ricardo Palma"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sge_ricardo_palma
DB_USERNAME=laravel_user
DB_PASSWORD=123456

SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

## Paso 9: Ejecutar Migraciones

```powershell
php artisan migrate
php artisan db:seed
```

## Paso 10: Iniciar Servidor

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

## Solución de Problemas Comunes

### Error: "Driver not found"
- Verificar que `pdo_pgsql` esté habilitado en php.ini
- Reiniciar Laragon después de cambios

### Error: "Connection refused"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en .env

### Error: "Class not found"
```powershell
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

## Verificación Final

1. ✅ PHP 8.3 funcionando
2. ✅ Composer instalado
3. ✅ PostgreSQL configurado
4. ✅ Base de datos creada
5. ✅ Laravel funcionando en puerto 8000
6. ✅ APIs respondiendo correctamente

---

**Nota**: Una vez completada la instalación, ejecuta `start-backend.bat` para iniciar automáticamente el servidor.