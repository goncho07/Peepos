# Configuración de VS Code para Proyecto PHP Laravel

## Extensiones Instaladas

### Extensiones PHP Principales
- **PHPActor**: Analizador principal de PHP con autocompletado inteligente
- **PHP Intelisense**: Alternativa gratuita a Intelephense con funcionalidades básicas
- **PHP Debug**: Depuración con Xdebug para encontrar errores
- **PHP CS Fixer**: Mantiene el código limpio y consistente según PSR-12
- **PHP DocBlocker**: Documentación automática de clases y funciones
- **Laravel Blade Snippets**: Autocompletado para plantillas Blade
- **PHP Namespace Resolver**: Importación automática de namespaces y clases

### Extensiones Frontend
- **Tailwind CSS IntelliSense**: Autocompletado para clases de Tailwind
- **Prettier**: Formateo automático de código
- **ESLint**: Linting para JavaScript/TypeScript
- **Auto Rename Tag**: Renombrado automático de etiquetas HTML
- **Path Intellisense**: Autocompletado de rutas de archivos

## Configuraciones Aplicadas

### Optimización para Proyectos Grandes
- Exclusión de carpetas pesadas del indexado (`vendor`, `node_modules`, `storage`, etc.)
- Configuración de búsqueda optimizada
- Cache de PHP CS Fixer habilitado

### PHP CS Fixer
- Configurado para usar estándar PSR-12
- Formateo automático al guardar archivos
- Archivo de configuración: `.php-cs-fixer.php`

### Xdebug
- Puerto configurado: 9003
- Modo debug habilitado
- Configuraciones de launch para diferentes escenarios
- Path mappings configurados para Docker

## Uso de las Extensiones

### Depuración con Xdebug
1. Coloca breakpoints en tu código PHP
2. Ve a la pestaña "Run and Debug" (Ctrl+Shift+D)
3. Selecciona "Listen for Xdebug" y presiona F5
4. Ejecuta tu aplicación y los breakpoints se activarán

### PHP CS Fixer
- Se ejecuta automáticamente al guardar archivos PHP
- Para ejecutar manualmente: `Ctrl+Shift+P` → "PHP CS Fixer: fix this file"

### PHP DocBlocker
- Escribe `/**` encima de una función/clase y presiona Enter
- Se generará automáticamente la documentación

### Namespace Resolver
- `Ctrl+Shift+P` → "Import Class" para importar clases
- `Ctrl+Shift+P" → "Sort Imports" para ordenar imports

## Comandos Útiles

### Atajos de Teclado
- `F12`: Ir a definición
- `Shift+F12`: Buscar todas las referencias
- `Ctrl+Shift+O`: Buscar símbolos en archivo
- `Ctrl+T`: Buscar símbolos en workspace
- `F2`: Renombrar símbolo

### Comandos de Paleta
- `Ctrl+Shift+P` → "PHP: Restart Language Server"
- `Ctrl+Shift+P` → "PHPActor: Index workspace"
- `Ctrl+Shift+P` → "PHP CS Fixer: fix this file"

## Estructura de Archivos de Configuración

```
.vscode/
├── extensions.json     # Extensiones recomendadas
├── settings.json       # Configuraciones del workspace
├── launch.json         # Configuraciones de depuración
└── README.md          # Este archivo
```

## Notas Importantes

1. **Rendimiento**: Las exclusiones de archivos están configuradas para mejorar el rendimiento en proyectos grandes
2. **Xdebug**: Solo se activa cuando es necesario para no afectar el rendimiento
3. **PHP CS Fixer**: Mantiene el código consistente automáticamente
4. **Autocompletado**: Funciona mejor cuando el proyecto tiene autoloading configurado correctamente con Composer

## Solución de Problemas

### Si el autocompletado no funciona:
1. Reinicia el Language Server: `Ctrl+Shift+P` → "PHP: Restart Language Server"
2. Reindexar workspace: `Ctrl+Shift+P` → "PHPActor: Index workspace"
3. Verifica que Composer autoload esté actualizado: `composer dump-autoload`

### Si Xdebug no conecta:
1. Verifica que el puerto 9003 esté libre
2. Revisa la configuración en `php.ini`
3. Reinicia el servidor PHP

## Extensiones Eliminadas (De Pago)

### ❌ Intelephense Premium
- **Razón**: Requiere licencia de $25 USD
- **Reemplazado por**: PHPActor

### ❌ PHP Tools
- **Razón**: Requiere suscripción anual
- **Reemplazado por**: PHPActor + extensiones gratuitas

### ❌ DevSense Extensions
- **Razón**: Extensiones premium de pago
- **Reemplazado por**: Alternativas open source

## Instalación Automática

Para instalar todas las extensiones recomendadas:

1. Abre VS Code en este proyecto
2. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
3. Escribe "Extensions: Show Recommended Extensions"
4. Instala las extensiones recomendadas

## Configuración Manual de PHPActor

Si PHPActor no funciona automáticamente:

### Windows (con WSL recomendado)
```bash
# En WSL o Git Bash
curl -Lo phpactor.phar https://github.com/phpactor/phpactor/releases/latest/download/phpactor.phar
chmod +x phpactor.phar
sudo mv phpactor.phar /usr/local/bin/phpactor
```

### Linux/macOS
```bash
curl -Lo phpactor.phar https://github.com/phpactor/phpactor/releases/latest/download/phpactor.phar
chmod +x phpactor.phar
sudo mv phpactor.phar /usr/local/bin/phpactor
```

### Configuración en VS Code
```json
{
  "phpactor.path": "/usr/local/bin/phpactor",
  "phpactor.enable": true
}
```

## Características Disponibles

### ✅ Gratuitas con PHPActor
- Autocompletado de código
- Navegación (Go to Definition)
- Búsqueda de referencias
- Hover information
- Refactoring básico
- Análisis de código

### ✅ Características Adicionales
- Formateo con PHP CS Fixer
- Análisis estático con Psalm
- Soporte para Laravel/Blade
- Integración con Composer

## Troubleshooting

### PHPActor no funciona
1. Verificar que PHP esté instalado
2. Verificar la ruta en `phpactor.path`
3. Reiniciar VS Code
4. Verificar logs en Output > PHPActor

### Problemas en Windows
- Usar WSL para mejor compatibilidad
- Alternativamente, usar Docker con Remote-Containers

## Beneficios de las Alternativas Gratuitas

1. **Costo**: $0 vs $25+ USD anuales
2. **Open Source**: Código abierto y transparente
3. **Comunidad**: Soporte activo de la comunidad
4. **Flexibilidad**: Personalizable y extensible
5. **Sin Restricciones**: Todas las características disponibles