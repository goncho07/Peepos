<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\ReportController;
// API Controllers
use App\Http\Controllers\Api\UserController as ApiUserController;
use App\Http\Controllers\Api\StudentController as ApiStudentController;
use App\Http\Controllers\Api\TeacherController as ApiTeacherController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\GradeController as ApiGradeController;
use App\Http\Controllers\Api\CommunicationController as ApiCommunicationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RolePermissionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend is running',
        'timestamp' => now()
    ]);
});

// Rutas de autenticación públicas
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/tasks', [DashboardController::class, 'getTasks']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'getAlerts']);
    
    // Admin routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/reports/ugel', [ReportController::class, 'ugelReport']);
        Route::get('/reports/enrollment', [ReportController::class, 'enrollmentReport']);
    });
    
    // Teacher routes
    Route::middleware(['role:teacher|admin'])->group(function () {
        Route::get('/my-sections', [TeacherController::class, 'mySections']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::get('/attendance/{section}', [AttendanceController::class, 'show']);
        Route::post('/grades', [GradeController::class, 'store']);
        Route::get('/grades/{section}', [GradeController::class, 'show']);
    });
    
    // Student routes
    Route::middleware(['role:student|admin'])->group(function () {
        Route::get('/my-grades', [GradeController::class, 'myGrades']);
        Route::get('/my-attendance', [AttendanceController::class, 'myAttendance']);
        Route::get('/my-schedule', [StudentController::class, 'mySchedule']);
    });
    
    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
    });
    
    // Common routes for all authenticated users are now handled in API v1 section
    
    // New API Routes
    Route::prefix('v1')->group(function () {
        // User management API
        Route::prefix('users')->group(function () {
            Route::get('/', [ApiUserController::class, 'index']);
            Route::post('/', [ApiUserController::class, 'store']);
            Route::get('/profile', [ApiUserController::class, 'profile']);
            Route::put('/profile', [ApiUserController::class, 'updateProfile']);
            Route::get('/{id}', [ApiUserController::class, 'show']);
            Route::put('/{id}', [ApiUserController::class, 'update']);
            Route::delete('/{id}', [ApiUserController::class, 'destroy']);
            Route::put('/{id}/password', [ApiUserController::class, 'updatePassword']);
            Route::put('/{id}/status', [ApiUserController::class, 'toggleStatus']);
        });

        // Student management API
        Route::prefix('students')->group(function () {
            Route::get('/', [ApiStudentController::class, 'index']);
            Route::get('/{id}', [ApiStudentController::class, 'show']);
            Route::put('/{id}', [ApiStudentController::class, 'update']);
            Route::get('/{id}/enrollments', [ApiStudentController::class, 'enrollments']);
            Route::post('/{id}/enroll', [ApiStudentController::class, 'enroll']);
            Route::post('/{id}/drop', [ApiStudentController::class, 'drop']);
            Route::get('/{id}/grades', [ApiStudentController::class, 'grades']);
            Route::get('/{id}/attendance', [ApiStudentController::class, 'attendance']);
            Route::get('/{id}/academic-report', [ApiStudentController::class, 'academicReport']);
        });

        // Teacher management API
        Route::prefix('teachers')->group(function () {
            Route::get('/', [ApiTeacherController::class, 'index']);
            Route::get('/{id}', [ApiTeacherController::class, 'show']);
            Route::put('/{id}', [ApiTeacherController::class, 'update']);
            Route::get('/{id}/classes', [ApiTeacherController::class, 'classes']);
            Route::post('/{id}/assign-class', [ApiTeacherController::class, 'assignClass']);
            Route::post('/{id}/unassign-class', [ApiTeacherController::class, 'unassignClass']);
            Route::get('/{id}/schedule', [ApiTeacherController::class, 'schedule']);
            Route::get('/{id}/students', [ApiTeacherController::class, 'students']);
            Route::get('/{id}/workload-report', [ApiTeacherController::class, 'workloadReport']);
        });

        // Class management API
        Route::prefix('classes')->group(function () {
            Route::get('/', [ClassController::class, 'index']);
            Route::post('/', [ClassController::class, 'store']);
            Route::get('/{id}', [ClassController::class, 'show']);
            Route::put('/{id}', [ClassController::class, 'update']);
            Route::delete('/{id}', [ClassController::class, 'destroy']);
            Route::get('/{id}/enrollments', [ClassController::class, 'enrollments']);
            Route::get('/{id}/schedule', [ClassController::class, 'schedule']);
            Route::post('/{id}/attendance', [ClassController::class, 'takeAttendance']);
            Route::get('/{id}/attendance-report', [ClassController::class, 'attendanceReport']);
        });

        // Grade management API
        Route::prefix('grades')->group(function () {
            Route::get('/', [ApiGradeController::class, 'index']);
            Route::post('/', [ApiGradeController::class, 'store']);
            Route::get('/{id}', [ApiGradeController::class, 'show']);
            Route::put('/{id}', [ApiGradeController::class, 'update']);
            Route::delete('/{id}', [ApiGradeController::class, 'destroy']);
            Route::post('/bulk', [ApiGradeController::class, 'bulkStore']);
            Route::get('/class/{classId}/statistics', [ApiGradeController::class, 'classStatistics']);
            Route::get('/student/{studentId}/report', [ApiGradeController::class, 'studentReport']);
        });

        // Communication API
        Route::prefix('communications')->group(function () {
            Route::get('/', [ApiCommunicationController::class, 'index']);
            Route::post('/', [ApiCommunicationController::class, 'store']);
            Route::get('/{id}', [ApiCommunicationController::class, 'show']);
            Route::put('/{id}', [ApiCommunicationController::class, 'update']);
            Route::delete('/{id}', [ApiCommunicationController::class, 'destroy']);
            Route::post('/{id}/send', [ApiCommunicationController::class, 'send']);
            Route::post('/broadcast', [ApiCommunicationController::class, 'broadcast']);
            Route::post('/{id}/mark-read', [ApiCommunicationController::class, 'markAsRead']);
            Route::get('/inbox/messages', [ApiCommunicationController::class, 'inbox']);
            Route::get('/sent/messages', [ApiCommunicationController::class, 'sent']);
            Route::get('/{id}/attachments/{attachmentIndex}', [ApiCommunicationController::class, 'downloadAttachment']);
        });

        // Roles and Permissions API
        Route::prefix('roles-permissions')->group(function () {
            Route::get('/roles', [RolePermissionController::class, 'getRoles']);
            Route::get('/permissions', [RolePermissionController::class, 'getPermissions']);
            Route::get('/user-permissions', [RolePermissionController::class, 'getUserPermissions']);
            Route::post('/check-permission', [RolePermissionController::class, 'checkPermission']);
        });

        // Notification routes in v1
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        });

        // Dashboard API
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', function (Request $request) {
                $user = $request->user();
                $stats = [];
                
                if ($user->role === 'admin') {
                    $stats = [
                        'total_students' => \App\Models\Student::count(),
                        'total_teachers' => \App\Models\Teacher::count(),
                        'total_classes' => \App\Models\ClassModel::count(),
                        'active_classes' => \App\Models\ClassModel::where('status', 'active')->count(),
                    ];
                } elseif ($user->role === 'teacher') {
                    $teacher = $user->teacher;
                    if ($teacher) {
                        $stats = [
                            'my_classes' => $teacher->getActiveClasses()->count(),
                            'total_students' => $teacher->getTotalStudents(),
                            'workload_hours' => $teacher->getWorkload(),
                        ];
                    }
                } elseif ($user->role === 'student') {
                    $student = $user->student;
                    if ($student) {
                        $stats = [
                            'current_enrollments' => $student->enrollments()->where('status', 'enrolled')->count(),
                            'completed_courses' => $student->enrollments()->where('status', 'completed')->count(),
                            'gpa' => $student->gpa,
                            'total_credits' => $student->total_credits,
                        ];
                    }
                }
                
                return response()->json(['success' => true, 'data' => $stats]);
            });
        });
    });
});