<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Course;
use App\Models\ClassModel;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats(Request $request)
    {
        try {
            $stats = [
                'total_students' => Student::count(),
                'total_teachers' => Teacher::count(),
                'total_courses' => Course::count(),
                'total_classes' => ClassModel::count(),
                'active_users' => User::where('is_active', true)->count(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Estadísticas obtenidas exitosamente',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard tasks
     */
    public function getTasks(Request $request)
    {
        try {
            // Por ahora devolvemos tareas de ejemplo
            $tasks = [
                [
                    'id' => 1,
                    'title' => 'Revisar asistencias pendientes',
                    'description' => 'Verificar las asistencias de la semana actual',
                    'priority' => 'high',
                    'due_date' => now()->addDays(2)->format('Y-m-d'),
                    'completed' => false
                ],
                [
                    'id' => 2,
                    'title' => 'Actualizar calificaciones',
                    'description' => 'Subir las calificaciones del último examen',
                    'priority' => 'medium',
                    'due_date' => now()->addDays(5)->format('Y-m-d'),
                    'completed' => false
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Tareas obtenidas exitosamente',
                'data' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tareas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
