<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAttendanceRequest;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\ClassModel;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'check_status']);
        $this->middleware('role:admin|teacher')->except(['index', 'show']);
    }

    /**
     * Display a listing of attendance records.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = Attendance::with([
            'enrollment.student.user',
            'enrollment.class.course',
            'enrollment.class.teacher.user'
        ]);

        // If user is a teacher, only show attendance for their classes
        if ($user->hasRole('teacher') && !$user->hasRole('admin')) {
            $query->whereHas('enrollment.class', function ($q) use ($user) {
                $q->where('teacher_id', $user->teacher->id);
            });
        }

        // If user is a student, only show their own attendance
        if ($user->hasRole('student') && !$user->hasRole('admin')) {
            $query->whereHas('enrollment', function ($q) use ($user) {
                $q->where('student_id', $user->student->id);
            });
        }

        // Filter by class
        if ($request->has('class_id')) {
            $query->whereHas('enrollment', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->whereHas('enrollment', function ($q) use ($request) {
                $q->where('student_id', $request->student_id);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('date', '<=', $request->to_date);
        }

        // Filter by current week
        if ($request->has('current_week') && $request->current_week) {
            $startOfWeek = Carbon::now()->startOfWeek();
            $endOfWeek = Carbon::now()->endOfWeek();
            $query->whereBetween('date', [$startOfWeek, $endOfWeek]);
        }

        // Filter by current month
        if ($request->has('current_month') && $request->current_month) {
            $query->whereMonth('date', Carbon::now()->month)
                  ->whereYear('date', Carbon::now()->year);
        }

        // Search by student name
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('enrollment.student.user', function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $attendance = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    /**
     * Store a newly created attendance record.
     */
    public function store(StoreAttendanceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = auth()->user();

        // Verify teacher has permission to take attendance for this enrollment
        $enrollment = Enrollment::with('class')->findOrFail($data['enrollment_id']);
        
        if (!$user->hasRole('admin') && $enrollment->class->teacher_id !== $user->teacher?->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para tomar asistencia en esta clase.',
            ], 403);
        }

        // Check if attendance already exists for this date
        $existingAttendance = Attendance::where('enrollment_id', $data['enrollment_id'])
            ->where('date', $data['date'])
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe un registro de asistencia para esta fecha.',
            ], 422);
        }

        // Create the attendance record
        $attendance = Attendance::create([
            'enrollment_id' => $data['enrollment_id'],
            'date' => $data['date'],
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
            'recorded_by' => $user->id,
            'recorded_at' => now(),
        ]);

        $attendance->load([
            'enrollment.student.user',
            'enrollment.class.course',
            'enrollment.class.teacher.user'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Asistencia registrada exitosamente.',
            'data' => $attendance,
        ], 201);
    }

    /**
     * Display the specified attendance record.
     */
    public function show(Attendance $attendance): JsonResponse
    {
        $user = auth()->user();
        
        // Check permissions
        if (!$user->hasRole('admin')) {
            // Teachers can only see attendance for their classes
            if ($user->hasRole('teacher') && $attendance->enrollment->class->teacher_id !== $user->teacher?->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado.',
                ], 403);
            }
            
            // Students can only see their own attendance
            if ($user->hasRole('student') && $attendance->enrollment->student_id !== $user->student?->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado.',
                ], 403);
            }
        }

        $attendance->load([
            'enrollment.student.user',
            'enrollment.class.course',
            'enrollment.class.teacher.user'
        ]);

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    /**
     * Update the specified attendance record.
     */
    public function update(Request $request, Attendance $attendance): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|in:present,absent,late,excused',
            'notes' => 'sometimes|nullable|string|max:500',
        ]);

        $user = auth()->user();
        
        // Check permissions
        if (!$user->hasRole('admin') && $attendance->enrollment->class->teacher_id !== $user->teacher?->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para modificar este registro de asistencia.',
            ], 403);
        }

        $attendance->update($request->only(['status', 'notes']));

        $attendance->load([
            'enrollment.student.user',
            'enrollment.class.course',
            'enrollment.class.teacher.user'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registro de asistencia actualizado exitosamente.',
            'data' => $attendance,
        ]);
    }

    /**
     * Remove the specified attendance record from storage.
     */
    public function destroy(Attendance $attendance): JsonResponse
    {
        $user = auth()->user();
        
        // Check permissions
        if (!$user->hasRole('admin') && $attendance->enrollment->class->teacher_id !== $user->teacher?->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para eliminar este registro de asistencia.',
            ], 403);
        }

        $attendance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registro de asistencia eliminado exitosamente.',
        ]);
    }

    /**
     * Take attendance for an entire class.
     */
    public function takeClassAttendance(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => 'required|exists:class_models,id',
            'date' => 'required|date',
            'attendance' => 'required|array|min:1',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status' => 'required|in:present,absent,late,excused',
            'attendance.*.notes' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $class = ClassModel::findOrFail($request->class_id);
        
        // Check permissions
        if (!$user->hasRole('admin') && $class->teacher_id !== $user->teacher?->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para tomar asistencia en esta clase.',
            ], 403);
        }

        $createdRecords = [];
        $updatedRecords = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($request->attendance as $index => $attendanceData) {
                // Find enrollment
                $enrollment = Enrollment::where('student_id', $attendanceData['student_id'])
                    ->where('class_id', $request->class_id)
                    ->where('status', 'active')
                    ->first();

                if (!$enrollment) {
                    $errors[] = "Estudiante ID {$attendanceData['student_id']} no está matriculado en esta clase.";
                    continue;
                }

                // Check if attendance already exists
                $existingAttendance = Attendance::where('enrollment_id', $enrollment->id)
                    ->where('date', $request->date)
                    ->first();

                if ($existingAttendance) {
                    // Update existing record
                    $existingAttendance->update([
                        'status' => $attendanceData['status'],
                        'notes' => $attendanceData['notes'] ?? null,
                        'recorded_by' => $user->id,
                        'recorded_at' => now(),
                    ]);
                    $updatedRecords[] = $existingAttendance;
                } else {
                    // Create new record
                    $attendance = Attendance::create([
                        'enrollment_id' => $enrollment->id,
                        'date' => $request->date,
                        'status' => $attendanceData['status'],
                        'notes' => $attendanceData['notes'] ?? null,
                        'recorded_by' => $user->id,
                        'recorded_at' => now(),
                    ]);
                    $createdRecords[] = $attendance;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Asistencia registrada exitosamente.',
                'data' => [
                    'created_count' => count($createdRecords),
                    'updated_count' => count($updatedRecords),
                    'errors' => $errors,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar asistencia.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attendance statistics for a class.
     */
    public function classStats(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => 'required|exists:class_models,id',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
        ]);

        $user = auth()->user();
        $class = ClassModel::findOrFail($request->class_id);
        
        // Check permissions
        if (!$user->hasRole('admin') && $class->teacher_id !== $user->teacher?->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado.',
            ], 403);
        }

        $query = Attendance::whereHas('enrollment', function ($q) use ($request) {
            $q->where('class_id', $request->class_id);
        });

        // Apply date filters
        if ($request->has('from_date')) {
            $query->where('date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('date', '<=', $request->to_date);
        }

        $attendance = $query->get();
        $totalRecords = $attendance->count();

        $stats = [
            'total_records' => $totalRecords,
            'attendance_by_status' => $attendance->groupBy('status')->map(function ($statusRecords, $status) use ($totalRecords) {
                $count = $statusRecords->count();
                return [
                    'status' => $status,
                    'count' => $count,
                    'percentage' => $totalRecords > 0 ? round(($count / $totalRecords) * 100, 2) : 0,
                ];
            })->values(),
            'attendance_rate' => $totalRecords > 0 ? round(($attendance->where('status', 'present')->count() / $totalRecords) * 100, 2) : 0,
            'tardiness_rate' => $totalRecords > 0 ? round(($attendance->where('status', 'late')->count() / $totalRecords) * 100, 2) : 0,
            'absence_rate' => $totalRecords > 0 ? round(($attendance->where('status', 'absent')->count() / $totalRecords) * 100, 2) : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get attendance statistics for a student.
     */
    public function studentStats(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'class_id' => 'sometimes|exists:class_models,id',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
        ]);

        $user = auth()->user();
        
        // Check permissions
        if (!$user->hasRole('admin')) {
            if ($user->hasRole('student') && $user->student?->id !== (int)$request->student_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado.',
                ], 403);
            }
        }

        $query = Attendance::whereHas('enrollment', function ($q) use ($request) {
            $q->where('student_id', $request->student_id);
            
            if ($request->has('class_id')) {
                $q->where('class_id', $request->class_id);
            }
        });

        // Apply date filters
        if ($request->has('from_date')) {
            $query->where('date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('date', '<=', $request->to_date);
        }

        $attendance = $query->get();
        $totalRecords = $attendance->count();

        $stats = [
            'total_records' => $totalRecords,
            'attendance_by_status' => $attendance->groupBy('status')->map(function ($statusRecords, $status) use ($totalRecords) {
                $count = $statusRecords->count();
                return [
                    'status' => $status,
                    'count' => $count,
                    'percentage' => $totalRecords > 0 ? round(($count / $totalRecords) * 100, 2) : 0,
                ];
            })->values(),
            'attendance_rate' => $totalRecords > 0 ? round(($attendance->where('status', 'present')->count() / $totalRecords) * 100, 2) : 0,
            'tardiness_rate' => $totalRecords > 0 ? round(($attendance->where('status', 'late')->count() / $totalRecords) * 100, 2) : 0,
            'absence_rate' => $totalRecords > 0 ? round(($attendance->where('status', 'absent')->count() / $totalRecords) * 100, 2) : 0,
            'recent_attendance' => $attendance->sortByDesc('date')->take(10)->values(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get attendance report for a date range.
     */
    public function attendanceReport(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => 'sometimes|exists:class_models,id',
            'student_id' => 'sometimes|exists:students,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'status' => 'sometimes|in:present,absent,late,excused',
        ]);

        $user = auth()->user();
        $query = Attendance::with([
            'enrollment.student.user',
            'enrollment.class.course',
            'enrollment.class.teacher.user'
        ]);

        // Apply user role restrictions
        if ($user->hasRole('teacher') && !$user->hasRole('admin')) {
            $query->whereHas('enrollment.class', function ($q) use ($user) {
                $q->where('teacher_id', $user->teacher->id);
            });
        }

        if ($user->hasRole('student') && !$user->hasRole('admin')) {
            $query->whereHas('enrollment', function ($q) use ($user) {
                $q->where('student_id', $user->student->id);
            });
        }

        // Apply filters
        if ($request->has('class_id')) {
            $query->whereHas('enrollment', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        if ($request->has('student_id')) {
            $query->whereHas('enrollment', function ($q) use ($request) {
                $q->where('student_id', $request->student_id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Apply date range
        $query->whereBetween('date', [$request->from_date, $request->to_date]);

        $attendance = $query->orderBy('date', 'desc')->get();

        // Group by date for better organization
        $groupedAttendance = $attendance->groupBy('date')->map(function ($dayAttendance, $date) {
            return [
                'date' => $date,
                'records' => $dayAttendance->values(),
                'summary' => [
                    'total' => $dayAttendance->count(),
                    'present' => $dayAttendance->where('status', 'present')->count(),
                    'absent' => $dayAttendance->where('status', 'absent')->count(),
                    'late' => $dayAttendance->where('status', 'late')->count(),
                    'excused' => $dayAttendance->where('status', 'excused')->count(),
                ],
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'attendance_by_date' => $groupedAttendance,
                'overall_summary' => [
                    'total_records' => $attendance->count(),
                    'present' => $attendance->where('status', 'present')->count(),
                    'absent' => $attendance->where('status', 'absent')->count(),
                    'late' => $attendance->where('status', 'late')->count(),
                    'excused' => $attendance->where('status', 'excused')->count(),
                ],
            ],
        ]);
    }
}