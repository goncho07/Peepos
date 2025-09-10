<?php

return [

    /*
    |--------------------------------------------------------------------------
    | API Response Messages
    |--------------------------------------------------------------------------
    |
    | Centralized messages for API responses to ensure consistency
    | across the application and easy internationalization.
    |
    */

    'success' => [
        'general' => 'Operación realizada exitosamente',
        'created' => 'Recurso creado exitosamente',
        'updated' => 'Recurso actualizado exitosamente',
        'deleted' => 'Recurso eliminado exitosamente',
        'retrieved' => 'Datos obtenidos exitosamente',
        'login' => 'Inicio de sesión exitoso',
        'logout' => 'Cierre de sesión exitoso',
        'password_reset' => 'Contraseña restablecida exitosamente',
        'email_verified' => 'Email verificado exitosamente',
        'file_uploaded' => 'Archivo subido exitosamente',
        'email_sent' => 'Email enviado exitosamente',
    ],

    /*
    |--------------------------------------------------------------------------
    | Error Messages
    |--------------------------------------------------------------------------
    |
    | Centralized error messages for consistent error handling.
    |
    */

    'errors' => [
        // General errors
        'general' => 'Ha ocurrido un error inesperado',
        'not_found' => 'Recurso no encontrado',
        'unauthorized' => 'No autorizado para realizar esta acción',
        'forbidden' => 'Acceso denegado',
        'validation_failed' => 'Los datos proporcionados no son válidos',
        'server_error' => 'Error interno del servidor',
        'service_unavailable' => 'Servicio no disponible temporalmente',
        'too_many_requests' => 'Demasiadas solicitudes. Intente más tarde',
        
        // Authentication errors
        'invalid_credentials' => 'Credenciales inválidas',
        'token_expired' => 'Token de acceso expirado',
        'token_invalid' => 'Token de acceso inválido',
        'account_locked' => 'Cuenta bloqueada temporalmente',
        'email_not_verified' => 'Email no verificado',
        'password_incorrect' => 'Contraseña incorrecta',
        
        // Database errors
        'database_connection' => 'Error de conexión a la base de datos',
        'database_query' => 'Error en la consulta de base de datos',
        'duplicate_entry' => 'El registro ya existe',
        'foreign_key_constraint' => 'No se puede eliminar debido a dependencias',
        
        // File errors
        'file_not_found' => 'Archivo no encontrado',
        'file_too_large' => 'El archivo es demasiado grande',
        'invalid_file_type' => 'Tipo de archivo no permitido',
        'upload_failed' => 'Error al subir el archivo',
        'storage_full' => 'Espacio de almacenamiento insuficiente',
        
        // Validation errors
        'required_field' => 'Este campo es obligatorio',
        'invalid_email' => 'Formato de email inválido',
        'invalid_phone' => 'Formato de teléfono inválido',
        'password_too_short' => 'La contraseña debe tener al menos :min caracteres',
        'password_too_weak' => 'La contraseña debe contener mayúsculas, minúsculas y números',
        'invalid_date' => 'Formato de fecha inválido',
        'date_in_past' => 'La fecha no puede ser anterior a hoy',
        'date_in_future' => 'La fecha no puede ser posterior a hoy',
        
        // Business logic errors
        'insufficient_permissions' => 'Permisos insuficientes para esta operación',
        'resource_in_use' => 'El recurso está siendo utilizado y no puede ser eliminado',
        'operation_not_allowed' => 'Operación no permitida en el estado actual',
        'quota_exceeded' => 'Cuota excedida',
        'deadline_passed' => 'La fecha límite ha pasado',
        
        // External service errors
        'external_service_error' => 'Error en servicio externo',
        'payment_failed' => 'Error en el procesamiento del pago',
        'email_service_error' => 'Error en el servicio de email',
        'sms_service_error' => 'Error en el servicio de SMS',
    ],

    /*
    |--------------------------------------------------------------------------
    | HTTP Status Codes
    |--------------------------------------------------------------------------
    |
    | Standard HTTP status codes with their corresponding messages.
    |
    */

    'http_codes' => [
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        204 => 'No Content',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        409 => 'Conflict',
        422 => 'Unprocessable Entity',
        429 => 'Too Many Requests',
        500 => 'Internal Server Error',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        504 => 'Gateway Timeout',
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Messages
    |--------------------------------------------------------------------------
    |
    | Messages for user notifications and alerts.
    |
    */

    'notifications' => [
        'welcome' => 'Bienvenido al Sistema Educativo PEEPOS',
        'profile_updated' => 'Tu perfil ha sido actualizado',
        'password_changed' => 'Tu contraseña ha sido cambiada',
        'new_message' => 'Tienes un nuevo mensaje',
        'assignment_due' => 'Tienes una tarea próxima a vencer',
        'grade_published' => 'Se ha publicado una nueva calificación',
        'class_cancelled' => 'La clase ha sido cancelada',
        'class_rescheduled' => 'La clase ha sido reprogramada',
        'maintenance_scheduled' => 'Mantenimiento programado del sistema',
        'backup_completed' => 'Respaldo completado exitosamente',
    ],

    /*
    |--------------------------------------------------------------------------
    | Log Messages
    |--------------------------------------------------------------------------
    |
    | Messages for system logging and debugging.
    |
    */

    'logs' => [
        'user_login' => 'Usuario :user inició sesión desde :ip',
        'user_logout' => 'Usuario :user cerró sesión',
        'user_created' => 'Usuario :user fue creado por :admin',
        'user_updated' => 'Usuario :user fue actualizado por :admin',
        'user_deleted' => 'Usuario :user fue eliminado por :admin',
        'password_reset_requested' => 'Usuario :user solicitó restablecimiento de contraseña',
        'password_reset_completed' => 'Usuario :user completó restablecimiento de contraseña',
        'failed_login_attempt' => 'Intento de login fallido para :email desde :ip',
        'file_uploaded' => 'Archivo :filename subido por usuario :user',
        'file_deleted' => 'Archivo :filename eliminado por usuario :user',
        'database_backup' => 'Respaldo de base de datos iniciado',
        'system_maintenance' => 'Modo de mantenimiento :action',
        'api_rate_limit_exceeded' => 'Límite de API excedido para IP :ip',
        'security_alert' => 'Alerta de seguridad: :message',
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Templates
    |--------------------------------------------------------------------------
    |
    | Subject lines and content for email templates.
    |
    */

    'emails' => [
        'welcome' => [
            'subject' => 'Bienvenido a PEEPOS',
            'greeting' => 'Hola :name,',
            'content' => 'Tu cuenta ha sido creada exitosamente.',
        ],
        'password_reset' => [
            'subject' => 'Restablecimiento de Contraseña - PEEPOS',
            'greeting' => 'Hola :name,',
            'content' => 'Has solicitado restablecer tu contraseña.',
        ],
        'verification' => [
            'subject' => 'Verificación de Email - PEEPOS',
            'greeting' => 'Hola :name,',
            'content' => 'Por favor verifica tu dirección de email.',
        ],
        'grade_notification' => [
            'subject' => 'Nueva Calificación Disponible - PEEPOS',
            'greeting' => 'Hola :name,',
            'content' => 'Se ha publicado una nueva calificación para :course.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Validation Messages
    |--------------------------------------------------------------------------
    |
    | Custom validation messages for form validation.
    |
    */

    'validation' => [
        'custom' => [
            'email' => [
                'required' => 'El email es obligatorio',
                'email' => 'El email debe tener un formato válido',
                'unique' => 'Este email ya está registrado',
            ],
            'password' => [
                'required' => 'La contraseña es obligatoria',
                'min' => 'La contraseña debe tener al menos :min caracteres',
                'confirmed' => 'La confirmación de contraseña no coincide',
            ],
            'name' => [
                'required' => 'El nombre es obligatorio',
                'string' => 'El nombre debe ser texto',
                'max' => 'El nombre no puede exceder :max caracteres',
            ],
        ],
    ],

];