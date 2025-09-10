# Credenciales de Prueba

## Usuario Administrador
- **Email:** admin@ricardopalma.edu.pe
- **Contraseña:** 123
- **Rol:** Administrador

## Instrucciones para Probar el Login

1. Abrir el navegador en: http://localhost:3000
2. Usar las credenciales del administrador mostradas arriba
3. El componente AuthDebug (esquina superior derecha) mostrará:
   - Estado de autenticación
   - Información del usuario
   - Token de Zustand
   - Token de localStorage
   - Si los tokens coinciden

## Cambios Implementados

### 1. Corrección en authStore.ts
- Eliminada redundancia en el manejo del token
- Mejorada la sincronización entre Zustand persist y localStorage
- Corregida la función `onRehydrateStorage` para sincronizar correctamente
- Actualizada la función `setToken` para marcar como autenticado

### 2. Mejoras en apiClient.ts
- Mejorado el interceptor de respuesta para manejar errores 401
- Agregada limpieza completa del estado en caso de token inválido
- Prevención de redirecciones infinitas
- Importación dinámica para evitar dependencias circulares

### 3. Componente de Debug
- Agregado `AuthDebug.tsx` para monitorear el estado de autenticación
- Visible en la esquina superior derecha de la aplicación
- Muestra información en tiempo real del estado de autenticación

## Problemas Solucionados

1. **Doble almacenamiento del token** - Eliminado
2. **Conflicto entre persist y localStorage manual** - Resuelto
3. **Interceptor de axios no sincronizado** - Corregido
4. **Pérdida del token al recargar la página** - Solucionado
5. **Manejo incorrecto de errores 401** - Mejorado

El sistema de autenticación ahora debería mantener el token correctamente y manejar la persistencia de sesión de manera confiable.