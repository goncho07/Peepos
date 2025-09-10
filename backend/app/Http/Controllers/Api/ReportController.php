<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ClassModel;
use App\Models\Enrollment;
use App\Models\Attendance;
use App\Models\Grade;
use App\Models\Communication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'check_status']);
        $this->middleware('role:admin|teacher')->except(['myReport']);
    }

    /**
     * Get dashboard statistics.
     */
    public function dashboard(): JsonResponse
    {
        $user = auth()->user();
        
        if ($user->hasRole('admin')) {
            return $this->adminDashboard();
        } elseif ($user->hasRole('teacher')) {
            return $this->teacherDashboard();
        } elseif ($user->hasRole('student')) {
            return $this->studentDashboard();
        }

        return response()->json([
            'success' => false,
            'message' => 'Rol no reconocido.',
        ], 403);
    }

    /**
     * Admin dashboard statistics.
     */
    private function adminDashboard(): JsonResponse
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
                'by_role' => User::select('roles.name as role', DB::raw('count(*) as count'))
                    ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->where('model_has_roles.model_type', User::class)
                    ->groupBy('roles.name')
                    ->get()
                    ->pluck('count', 'role'),
            ],
            'students' => [
                'total' => Student::count(),
                'active' => Student::whereHas('user', function ($q) {
                    $q->where('is_active', true);
                })->count(),
                'enrolled' => Enrollment::where('status', 'active')->distinct('student_id')->count(),
            ],
            'teachers' => [
                'total' => Teacher::count(),
                'active' => Teacher::whereHas('user', function ($q) {
                    $q->where('is_active', true);
                })->count(),
                'with_classes' => Teacher::whereHas('classes')->count(),
            ],
            'classes' => [
                'total' => ClassModel::count(),
                'active' => ClassModel::where('status', 'active')->count(),
                'with_students' => ClassModel::whereHas('enrollments', function ($q) {
                    $q->where('status', 'active');
                })->count(),
            ],
            'enrollments' => [
                'total' => Enrollment::count(),
                'active' => Enrollment::where('status', 'active')->count(),
                'completed' => Enrollment::where('status', 'completed')->count(),
                'dropped' => Enrollment::where('status', 'dropped')->count(),
            ],
            'attendance' => [
                'total_records' => Attendance::count(),
                'this_month' => Attendance::whereMonth('date', Carbon::now()->month)
                    ->whereYear('date', Carbon::now()->year)
                    ->count(),
                'attendance_rate' => $this->calculateOverallAttendanceRate(),
            ],
            'grades' => [
                'total' => Grade::count(),
                'this_month' => Grade::whereMonth('graded_at', Carbon::now()->month)
                    ->whereYear('graded_at', Carbon::now()->year)
                    ->count(),
                'average_score' => Grade::avg('points_earned'),
            ],
            'communications' => [
                'total' => Communication::count(),
                'this_month' => Communication::whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year)
                    ->count(),
                'unread' => DB::table('communication_recipients')
                    ->where('is_read', false)
                    ->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Teacher dashboard statistics.
     */
    private function teacherDashboard(): JsonResponse
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Perfil de docente no encontrado.',
            ], 404);
        }

        $stats = [
            'classes' => [
                'total' => $teacher->classes()->count(),
                'active' => $teacher->classes()->where('status', 'active')->count(),
                'students_count' => Enrollment::whereHas('class', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id);
                })->where('status', 'active')->count(),
            ],
            'attendance' => [
                'records_this_week' => Attendance::whereHas('enrollment.class', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id);
                })->whereBetween('date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])->count(),
                'attendance_rate' => $this->calculateTeacherAttendanceRate($teacher->id),
            ],
            'grades' => [
                'graded_this_week' => Grade::whereHas('enrollment.class', function ($q) use ($teacher) {
                    $q->where('teacher_id', $teacher->id);
                })->whereBetween('graded_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])->count(),
                'pending_grades' => $this->calculatePendingGrades($teacher->id),
            ],
            'communications' => [
                'sent' => Communication::where('sender_id', $user->id)->count(),
                'unread' => Communication::whereHas('recipients', function ($q) use ($user) {
                    $q->where('user_id', $user->id)->where('is_read', false);
                })->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Student dashboard statistics.
     */
    private function studentDashboard(): JsonResponse
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Perfil de estudiante no encontrado.',
            ], 404);
        }

        $stats = [
            'enrollments' => [
                'active' => $student->enrollments()->where('status', 'active')->count(),
                'completed' => $student->enrollments()->where('status', 'completed')->count(),
                'total_credits' => $student->enrollments()
                    ->where('status', 'active')
                    ->join('classes', 'enrollments.class_id', '=', 'classes.id')
                    ->join('courses', 'classes.course_id', '=', 'courses.id')
                    ->sum('courses.credits'),
            ],
            'attendance' => [
                'this_month' => Attendance::whereHas('enrollment', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                })->whereMonth('date', Carbon::now()->month)
                  ->whereYear('date', Carbon::now()->year)
                  ->count(),
                'attendance_rate' => $this->calculateStudentAttendanceRate($student->id),
            ],
            'grades' => [
                'total' => Grade::whereHas('enrollment', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                })->count(),
                'average_score' => Grade::whereHas('enrollment', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                })->avg('points_earned'),
                'recent_grades' => Grade::whereHas('enrollment', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                })->with(['enrollment.class.course'])
                  ->orderBy('graded_at', 'desc')
                  ->take(5)
                  ->get(),
            ],
            'communications' => [
                'unread' => Communication::whereHas('recipients', function ($q) use ($user) {
                    $q->where('user_id', $user->id)->where('is_read', false);
                })->count(),
                'total' => Communication::whereHas('recipients', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get attendance report.
     */
    public function attendanceReport(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => 'sometimes|exists:class_models,id',
            'student_id' => 'sometimes|exists:students,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'format' => 'sometimes|in:summary,detailed',
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

        // Apply date range
        $query->whereBetween('date', [$request->from_date, $request->to_date]);

        $attendance = $query->orderBy('date', 'desc')->get();

        $format = $request->get('format', 'summary');

        if ($format === 'detailed') {
            $data = $attendance->groupBy('date')->map(function ($dayAttendance, $date) {
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
        } else {
            $totalRecords = $attendance->count();
            $data = [
                'summary' => [
                    'total_records' => $totalRecords,
                    'present' => $attendance->where('status', 'present')->count(),
                    'absent' => $attendance->where('status', 'absent')->count(),
                    'late' => $attendance->where('status', 'late')->count(),
                    'excused' => $attendance->where('status', 'excused')->count(),
                    'attendance_rate' => $totalRecords > 0 ? round(($attendance->where('status', 'present')->count() / $totalRecords) * 100, 2) : 0,
                ],
                'by_class' => $attendance->groupBy('enrollment.class.id')->map(function ($classAttendance) {
                    $first = $classAttendance->first();
                    $total = $classAttendance->count();
                    return [
                        'class_id' => $first->enrollment->class->id,
                        'class_name' => $first->enrollment->class->course->name,
                        'teacher' => $first->enrollment->class->teacher->user->name,
                        'total_records' => $total,
                        'present' => $classAttendance->where('status', 'present')->count(),
                        'absent' => $classAttendance->where('status', 'absent')->count(),
                        'late' => $classAttendance->where('status', 'late')->count(),
                        'excused' => $classAttendance->where('status', 'excused')->count(),
                        'attendance_rate' => $total > 0 ? round(($classAttendance->where('status', 'present')->count() / $total) * 100, 2) : 0,
                    ];
                })->values(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get grades report.
     */
    public function gradesReport(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => 'sometimes|exists:classes,id',
            'student_id' => 'sometimes|exists:students,id',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
            'grade_type' => 'sometimes|in:exam,quiz,assignment,project,participation,final',
            'format' => 'sometimes|in:summary,detailed',
        ]);

        $user = auth()->user();
        $query = Grade::with([
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

        if ($request->has('grade_type')) {
            $query->where('type', $request->grade_type);
        }

        if ($request->has('from_date')) {
            $query->where('graded_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('graded_at', '<=', $request->to_date);
        }

        $grades = $query->orderBy('graded_at', 'desc')->get();

        $format = $request->get('format', 'summary');

        if ($format === 'detailed') {
            $data = $grades->values();
        } else {
            $data = [
                'summary' => [
                    'total_grades' => $grades->count(),
                    'average_score' => $grades->avg('points_earned'),
                    'highest_score' => $grades->max('points_earned'),
                    'lowest_score' => $grades->min('points_earned'),
                ],
                'by_type' => $grades->groupBy('type')->map(function ($typeGrades, $type) {
                    return [
                        'type' => $type,
                        'count' => $typeGrades->count(),
                        'average' => $typeGrades->avg('points_earned'),
                        'highest' => $typeGrades->max('points_earned'),
                        'lowest' => $typeGrades->min('points_earned'),
                    ];
                })->values(),
                'by_class' => $grades->groupBy('enrollment.class.id')->map(function ($classGrades) {
                    $first = $classGrades->first();
                    return [
                        'class_id' => $first->enrollment->class->id,
                        'class_name' => $first->enrollment->class->course->name,
                        'teacher' => $first->enrollment->class->teacher->user->name,
                        'total_grades' => $classGrades->count(),
                        'average_score' => $classGrades->avg('points_earned'),
                        'highest_score' => $classGrades->max('points_earned'),
                        'lowest_score' => $classGrades->min('points_earned'),
                    ];
                })->values(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get enrollment report.
     */
    public function enrollmentReport(Request $request): JsonResponse
    {
        $request->validate([
            'semester' => 'sometimes|string',
            'year' => 'sometimes|integer|min:2020|max:2030',
            'status' => 'sometimes|in:active,completed,dropped,withdrawn',
            'format' => 'sometimes|in:summary,detailed',
        ]);

        $user = auth()->user();
        
        if (!$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado.',
            ], 403);
        }

        $query = Enrollment::with([
            'student.user',
            'class.course',
            'class.teacher.user'
        ]);

        // Apply filters
        if ($request->has('semester')) {
            $query->whereHas('class', function ($q) use ($request) {
                $q->where('semester', $request->semester);
            });
        }

        if ($request->has('year')) {
            $query->whereHas('class', function ($q) use ($request) {
                $q->where('year', $request->year);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $enrollments = $query->orderBy('created_at', 'desc')->get();

        $format = $request->get('format', 'summary');

        if ($format === 'detailed') {
            $data = $enrollments->values();
        } else {
            $data = [
                'summary' => [
                    'total_enrollments' => $enrollments->count(),
                    'active' => $enrollments->where('status', 'active')->count(),
                    'completed' => $enrollments->where('status', 'completed')->count(),
                    'dropped' => $enrollments->where('status', 'dropped')->count(),
                    'withdrawn' => $enrollments->where('status', 'withdrawn')->count(),
                ],
                'by_class' => $enrollments->groupBy('class.id')->map(function ($classEnrollments) {
                    $first = $classEnrollments->first();
                    return [
                        'class_id' => $first->class->id,
                        'class_name' => $first->class->course->name,
                        'teacher' => $first->class->teacher->user->name,
                        'total_enrollments' => $classEnrollments->count(),
                        'active' => $classEnrollments->where('status', 'active')->count(),
                        'completed' => $classEnrollments->where('status', 'completed')->count(),
                        'dropped' => $classEnrollments->where('status', 'dropped')->count(),
                    ];
                })->values(),
                'by_semester' => $enrollments->groupBy('class.semester')->map(function ($semesterEnrollments, $semester) {
                    return [
                        'semester' => $semester,
                        'total_enrollments' => $semesterEnrollments->count(),
                        'active' => $semesterEnrollments->where('status', 'active')->count(),
                        'completed' => $semesterEnrollments->where('status', 'completed')->count(),
                        'dropped' => $semesterEnrollments->where('status', 'dropped')->count(),
                    ];
                })->values(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get my personal report (for students).
     */
    public function myReport(): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->hasRole('student')) {
            return response()->json([
                'success' => false,
                'message' => 'Esta función es solo para estudiantes.',
            ], 403);
        }

        $student = $user->student;
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Perfil de estudiante no encontrado.',
            ], 404);
        }

        $data = [
            'student_info' => [
                'name' => $user->name,
                'email' => $user->email,
                'student_id' => $student->student_id,
                'enrollment_date' => $student->enrollment_date,
            ],
            'enrollments' => $student->enrollments()->with([
                'class.course',
                'class.teacher.user'
            ])->get()->map(function ($enrollment) {
                return [
                    'class' => $enrollment->class->course->name,
                    'teacher' => $enrollment->class->teacher->user->name,
                    'status' => $enrollment->status,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'final_grade' => $enrollment->final_grade,
                ];
            }),
            'grades' => Grade::whereHas('enrollment', function ($q) use ($student) {
                $q->where('student_id', $student->id);
            })->with(['enrollment.class.course'])
              ->orderBy('graded_at', 'desc')
              ->get()
              ->map(function ($grade) {
                  return [
                      'class' => $grade->enrollment->class->course->name,
                      'type' => $grade->type,
                      'name' => $grade->name,
                      'points_earned' => $grade->points_earned,
                      'points_possible' => $grade->points_possible,
                      'percentage' => round(($grade->points_earned / $grade->points_possible) * 100, 2),
                      'graded_at' => $grade->graded_at,
                  ];
              }),
            'attendance' => Attendance::whereHas('enrollment', function ($q) use ($student) {
                $q->where('student_id', $student->id);
            })->with(['enrollment.class.course'])
              ->orderBy('date', 'desc')
              ->get()
              ->map(function ($attendance) {
                  return [
                      'class' => $attendance->enrollment->class->course->name,
                      'date' => $attendance->date,
                      'status' => $attendance->status,
                      'notes' => $attendance->notes,
                  ];
              }),
            'statistics' => [
                'overall_gpa' => $this->calculateStudentGPA($student->id),
                'attendance_rate' => $this->calculateStudentAttendanceRate($student->id),
                'total_credits' => $student->enrollments()
                    ->where('status', 'active')
                    ->join('classes', 'enrollments.class_id', '=', 'classes.id')
                    ->join('courses', 'classes.course_id', '=', 'courses.id')
                    ->sum('courses.credits'),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Calculate overall attendance rate.
     */
    private function calculateOverallAttendanceRate(): float
    {
        $totalRecords = Attendance::count();
        if ($totalRecords === 0) return 0;
        
        $presentRecords = Attendance::where('status', 'present')->count();
        return round(($presentRecords / $totalRecords) * 100, 2);
    }

    /**
     * Calculate teacher attendance rate.
     */
    private function calculateTeacherAttendanceRate(int $teacherId): float
    {
        $totalRecords = Attendance::whereHas('enrollment.class', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })->count();
        
        if ($totalRecords === 0) return 0;
        
        $presentRecords = Attendance::whereHas('enrollment.class', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })->where('status', 'present')->count();
        
        return round(($presentRecords / $totalRecords) * 100, 2);
    }

    /**
     * Calculate student attendance rate.
     */
    private function calculateStudentAttendanceRate(int $studentId): float
    {
        $totalRecords = Attendance::whereHas('enrollment', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->count();
        
        if ($totalRecords === 0) return 0;
        
        $presentRecords = Attendance::whereHas('enrollment', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->where('status', 'present')->count();
        
        return round(($presentRecords / $totalRecords) * 100, 2);
    }

    /**
     * Calculate pending grades for a teacher.
     */
    private function calculatePendingGrades(int $teacherId): int
    {
        // This is a simplified calculation - you might want to implement
        // more sophisticated logic based on your grading requirements
        $activeEnrollments = Enrollment::whereHas('class', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })->where('status', 'active')->count();
        
        $gradedThisWeek = Grade::whereHas('enrollment.class', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })->whereBetween('graded_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ])->count();
        
        return max(0, $activeEnrollments - $gradedThisWeek);
    }

    /**
     * Calculate student GPA.
     */
    private function calculateStudentGPA(int $studentId): float
    {
        $grades = Grade::whereHas('enrollment', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->get();
        
        if ($grades->isEmpty()) return 0;
        
        $totalPoints = 0;
        $totalPossible = 0;
        
        foreach ($grades as $grade) {
            $totalPoints += $grade->points_earned;
            $totalPossible += $grade->points_possible;
        }
        
        if ($totalPossible === 0) return 0;
        
        $percentage = ($totalPoints / $totalPossible) * 100;
        
        // Convert percentage to GPA scale (4.0)
        if ($percentage >= 97) return 4.0;
        if ($percentage >= 93) return 3.7;
        if ($percentage >= 90) return 3.3;
        if ($percentage >= 87) return 3.0;
        if ($percentage >= 83) return 2.7;
        if ($percentage >= 80) return 2.3;
        if ($percentage >= 77) return 2.0;
        if ($percentage >= 73) return 1.7;
        if ($percentage >= 70) return 1.3;
        if ($percentage >= 67) return 1.0;
        if ($percentage >= 65) return 0.7;
        
        return 0.0;
    }
}