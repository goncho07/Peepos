<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Enrollment;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{
    /**
     * Display a listing of classes.
     */
    public function index(Request $request)
    {
        $query = ClassModel::with(['course', 'teacher.user']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by course
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        // Filter by teacher
        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        // Filter by section
        if ($request->has('section')) {
            $query->where('section', $request->section);
        }

        // Search by class name or course name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('section', 'like', "%{$search}%")
                  ->orWhereHas('course', function ($courseQuery) use ($search) {
                      $courseQuery->where('name', 'like', "%{$search}%")
                                 ->orWhere('code', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($request->has('start_from')) {
            $query->where('start_date', '>=', $request->start_from);
        }
        if ($request->has('start_to')) {
            $query->where('start_date', '<=', $request->start_to);
        }

        // Filter current classes
        if ($request->has('current') && $request->current) {
            $query->where('status', 'active')
                  ->where('start_date', '<=', now())
                  ->where('end_date', '>=', now());
        }

        $classes = $query->paginate($request->get('per_page', 15));

        // Add enrollment count to each class
        $classes->getCollection()->transform(function ($class) {
            $class->enrollment_count = $class->enrollments()->count();
            $class->available_spots = $class->available_spots;
            return $class;
        });

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    /**
     * Store a newly created class.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'section' => 'required|string|max:10',
            'max_capacity' => 'required|integer|min:1|max:100',
            'classroom' => 'nullable|string|max:50',
            'schedule' => 'required|json',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'sometimes|in:active,inactive,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check if teacher can teach this course
        if ($request->teacher_id) {
            $teacher = Teacher::find($request->teacher_id);
            if (!$teacher->canTeachCourse($request->course_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Teacher is not qualified to teach this course',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        // Check for section conflicts
        $existingClass = ClassModel::where('course_id', $request->course_id)
                                  ->where('section', $request->section)
                                  ->where('start_date', '<=', $request->end_date)
                                  ->where('end_date', '>=', $request->start_date)
                                  ->first();

        if ($existingClass) {
            return response()->json([
                'success' => false,
                'message' => 'A class with this course and section already exists in the specified date range',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $class = ClassModel::create([
                'course_id' => $request->course_id,
                'teacher_id' => $request->teacher_id,
                'section' => $request->section,
                'max_capacity' => $request->max_capacity,
                'classroom' => $request->classroom,
                'schedule' => $request->schedule,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->get('status', 'active'),
            ]);

            $class->load(['course', 'teacher.user']);

            return response()->json([
                'success' => true,
                'message' => 'Class created successfully',
                'data' => $class,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create class',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified class.
     */
    public function show($id)
    {
        $class = ClassModel::with([
            'course',
            'teacher.user',
            'enrollments.student.user',
            'enrollments.grades'
        ])->find($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        // Add computed data
        $classData = $class->toArray();
        $classData['enrollment_count'] = $class->enrollments->count();
        $classData['available_spots'] = $class->available_spots;
        $classData['is_full'] = $class->is_full;
        $classData['attendance_rate'] = $this->calculateClassAttendanceRate($class);

        return response()->json([
            'success' => true,
            'data' => $classData,
        ]);
    }

    /**
     * Update the specified class.
     */
    public function update(Request $request, $id)
    {
        $class = ClassModel::find($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'teacher_id' => 'nullable|exists:teachers,id',
            'section' => 'sometimes|string|max:10',
            'max_capacity' => 'sometimes|integer|min:1|max:100',
            'classroom' => 'nullable|string|max:50',
            'schedule' => 'sometimes|json',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'status' => 'sometimes|in:active,inactive,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check if teacher can teach this course
        if ($request->has('teacher_id') && $request->teacher_id) {
            $teacher = Teacher::find($request->teacher_id);
            if (!$teacher->canTeachCourse($class->course_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Teacher is not qualified to teach this course',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        try {
            $class->update($request->only([
                'teacher_id', 'section', 'max_capacity', 'classroom',
                'schedule', 'start_date', 'end_date', 'status'
            ]));

            $class->load(['course', 'teacher.user']);

            return response()->json([
                'success' => true,
                'message' => 'Class updated successfully',
                'data' => $class,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update class',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified class.
     */
    public function destroy($id)
    {
        $class = ClassModel::find($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        // Check if class has enrollments
        if ($class->enrollments()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete class with existing enrollments',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $class->delete();

            return response()->json([
                'success' => true,
                'message' => 'Class deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete class',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get class enrollments.
     */
    public function enrollments($id, Request $request)
    {
        $class = ClassModel::find($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $query = $class->enrollments()->with(['student.user', 'grades']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $enrollments = $query->get();

        // Add computed data for each enrollment
        $enrollments->each(function ($enrollment) {
            $enrollment->attendance_rate = $enrollment->calculateAttendanceRate();
            $enrollment->grade_letter = $enrollment->grade_letter;
        });

        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

    /**
     * Get class schedule.
     */
    public function schedule($id, Request $request)
    {
        $class = ClassModel::with(['course', 'teacher.user'])->find($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $schedule = [];
        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        foreach ($daysOfWeek as $day) {
            $daySchedule = $class->getScheduleForDay($day);
            if (!empty($daySchedule)) {
                $schedule[$day] = $daySchedule;
            }
        }

        // Get weekly schedule if requested
        if ($request->has('weekly') && $request->weekly) {
            $weeklySchedule = $class->getWeeklySchedule();
            $schedule['weekly_summary'] = $weeklySchedule;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'class' => $class,
                'schedule' => $schedule,
            ],
        ]);
    }

    /**
     * Take attendance for a class.
     */
    public function takeAttendance(Request $request, $id)
    {
        $class = ClassModel::find($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'attendance_date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.enrollment_id' => 'required|exists:enrollments,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.arrival_time' => 'nullable|date_format:H:i:s',
            'attendances.*.notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            DB::beginTransaction();

            $attendanceRecords = [];
            
            foreach ($request->attendances as $attendanceData) {
                // Verify enrollment belongs to this class
                $enrollment = Enrollment::where('id', $attendanceData['enrollment_id'])
                                       ->where('class_id', $class->id)
                                       ->first();
                
                if (!$enrollment) {
                    throw new \Exception("Enrollment {$attendanceData['enrollment_id']} not found in this class");
                }

                // Create or update attendance record
                $attendance = Attendance::updateOrCreate(
                    [
                        'enrollment_id' => $attendanceData['enrollment_id'],
                        'class_id' => $class->id,
                        'attendance_date' => $request->attendance_date,
                    ],
                    [
                        'status' => $attendanceData['status'],
                        'arrival_time' => $attendanceData['arrival_time'] ?? null,
                        'notes' => $attendanceData['notes'] ?? null,
                    ]
                );

                $attendanceRecords[] = $attendance;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attendance recorded successfully',
                'data' => $attendanceRecords,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to record attendance',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get class attendance report.
     */
    public function attendanceReport($id, Request $request)
    {
        $class = ClassModel::with(['course', 'teacher.user'])->find($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $query = $class->attendances()->with(['enrollment.student.user']);

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('attendance_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('attendance_date', '<=', $request->date_to);
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->get();

        // Group by student
        $studentAttendance = $attendances->groupBy('enrollment.student.id');
        
        $report = [];
        foreach ($studentAttendance as $studentId => $studentAttendances) {
            $student = $studentAttendances->first()->enrollment->student;
            $totalClasses = $studentAttendances->count();
            $presentCount = $studentAttendances->whereIn('status', ['present', 'late'])->count();
            
            $report[] = [
                'student' => $student,
                'total_classes' => $totalClasses,
                'present' => $studentAttendances->where('status', 'present')->count(),
                'late' => $studentAttendances->where('status', 'late')->count(),
                'absent' => $studentAttendances->where('status', 'absent')->count(),
                'excused' => $studentAttendances->where('status', 'excused')->count(),
                'attendance_rate' => $totalClasses > 0 ? round(($presentCount / $totalClasses) * 100, 2) : 0,
                'attendances' => $studentAttendances->values(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'class' => $class,
                'report' => $report,
                'summary' => [
                    'total_students' => count($report),
                    'average_attendance_rate' => count($report) > 0 
                        ? round(collect($report)->avg('attendance_rate'), 2) 
                        : 0,
                ],
            ],
        ]);
    }

    /**
     * Calculate class attendance rate.
     */
    private function calculateClassAttendanceRate(ClassModel $class)
    {
        $totalAttendances = $class->attendances()->count();
        
        if ($totalAttendances === 0) {
            return 0;
        }

        $presentCount = $class->attendances()
            ->whereIn('status', ['present', 'late'])
            ->count();

        return round(($presentCount / $totalAttendances) * 100, 2);
    }
}