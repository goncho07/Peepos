<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get notifications for a user
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('userId');
        $user = $request->user();
        
        // Verificar que el usuario autenticado puede acceder a estas notificaciones
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no autenticado'
            ], 401);
        }
        
        // Si es admin, puede ver todas las notificaciones
        // Si no es admin, solo puede ver sus propias notificaciones
        if ($user->role !== 'admin' && $user->id != $userId) {
            return response()->json([
                'error' => 'No tienes permisos para ver estas notificaciones'
            ], 403);
        }
        
        // Por ahora devolvemos notificaciones de ejemplo
        // En el futuro esto se conectará con la base de datos
        $notifications = [
            [
                'id' => '1',
                'type' => 'academic',
                'title' => 'Nueva calificación disponible',
                'message' => 'Se ha registrado una nueva calificación en Matemáticas',
                'timestamp' => now()->subHours(2)->toISOString(),
                'read' => false,
                'priority' => 'medium',
                'actionUrl' => '/grades'
            ],
            [
                'id' => '2',
                'type' => 'administrative',
                'title' => 'Recordatorio de reunión',
                'message' => 'Reunión de padres de familia programada para mañana',
                'timestamp' => now()->subHours(5)->toISOString(),
                'read' => false,
                'priority' => 'high',
                'actionUrl' => '/meetings'
            ],
            [
                'id' => '3',
                'type' => 'system',
                'title' => 'Actualización del sistema',
                'message' => 'El sistema se actualizará el próximo fin de semana',
                'timestamp' => now()->subDay()->toISOString(),
                'read' => true,
                'priority' => 'low',
                'actionUrl' => null
            ]
        ];
        
        return response()->json([
            'notifications' => $notifications,
            'total' => count($notifications),
            'unread' => count(array_filter($notifications, fn($n) => !$n['read']))
        ]);
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no autenticado'
            ], 401);
        }
        
        // Por ahora solo devolvemos éxito
        // En el futuro esto actualizará la base de datos
        return response()->json([
            'message' => 'Notificación marcada como leída',
            'notification_id' => $id
        ]);
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no autenticado'
            ], 401);
        }
        
        // Por ahora solo devolvemos éxito
        // En el futuro esto actualizará la base de datos
        return response()->json([
            'message' => 'Todas las notificaciones marcadas como leídas'
        ]);
    }
}