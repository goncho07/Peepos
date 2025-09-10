<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\HasApiCrud;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    use HasApiCrud;
    /**
     * Display a listing of students.
     */
    public function index(Request $request)
    {
        $query = Student::with(['user']);
        
        // Apply common filters
        $searchFields = ['student_code', 'user.first_name', 'user.last_name', 'user.email'];
        $query = $this->applyCommonFilters($query, $request, $searchFields);
        
        // Apply date range filter for enrollment
        $query = $this->applyDateRangeFilter($query, $request, 'enrollment_date', 'enrollment_from', 'enrollment_to');

        $students = $query->paginate($request->get('per_page', 15));

        return $this->successResponse($students);
    }

    /**
     * Display the specified student.
     */
    public function show($id)
    {
        $student = Student::with([
            'user',
            'enrollments.class.course',
            'enrollments.grades',
            'attendances'
        ])->find($id);

        if (!$student) {
            return $this->notFoundResponse('Student');
        }

        // Add computed data
        $studentData = $student->toArray();
        $studentData['attendance_rate'] = $this->calculateOverallAttendanceRate($student);
        $studentData['current_enrollments'] = $student->enrollments()->where('status', 'enrolled')->count();
        $studentData['completed_courses'] = $student->enrollments()->where('status', 'completed')->count();

        return $this->successResponse($studentData);
    }

    /**
     * Update the specified student.
     */
    // Usar Form Requests en lugar de validación inline
    public function store(StoreStudentRequest $request)
    {
        $student = Student::find($id);

        if (!$student) {
            return $this->notFoundResponse('Student');
        }

        $validator = Validator::make($request->all(), [
            'birth_date' => 'sometimes|date',
            'gender' => 'sometimes|in:M,F,O',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'sometimes|string|max:255',
            'emergency_contact_phone' => 'sometimes|string|max:15',
            'blood_type' => 'nullable|string|max:5',
            'medical_conditions' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,graduated,transferred',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', Response::HTTP_UNPROCESSABLE_ENTITY, $validator->errors());
        }

        try {
            $student->update($request->only([
                'birth_date', 'gender', 'address', 'emergency_contact_name',
                'emergency_contact_phone', 'blood_type', 'medical_conditions', 'status'
            ]));

            $student->load('user');

            return $this->successResponse($student, 'Student updated successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update student', Response::HTTP_INTERNAL_SERVER_ERROR, $e->getMessage());
        }
    }

    /**
     * Get student enrollments.
     */
    public function enrollments($id, Request $request)
    {
        $student = Student::find($id);

        if (!$student) {
            return $this->notFoundResponse('Student');
        }

        $query = $student->enrollments()->with(['class.course', 'class.teacher.user']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by semester/period
        if ($request->has('period')) {
            $query->whereHas('class', function ($q) use ($request) {
                $q->whereBetween('start_date', [
                    $request->period . '-01-01',
                    $request->period . '-12-31'
                ]);
            });
        }

        $enrollments = $query->get();

        return $this->successResponse($enrollments);
    }

    /**
     * Enroll student in a class.
     */
    public function enroll(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return $this->notFoundResponse('Student');
        }

        $validator = Validator::make($request->all(), [
            'class_id' => 'required|exists:class_models,id',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', Response::HTTP_UNPROCESSABLE_ENTITY, $validator->errors());
        }

        $class = ClassModel::find($request->class_id);

        try {
            $enrollment = $class->enrollStudent($student->id);

            if (!$enrollment) {
                return $this->errorResponse('Failed to enroll student. Class may be full or student already enrolled.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $enrollment->load(['class.course', 'class.teacher.user']);

            return $this->successResponse($enrollment, 'Student enrolled successfully', Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to enroll student', Response::HTTP_INTERNAL_SERVER_ERROR, $e->getMessage());
        }
    }

    /**
     * Drop student from a class.
     */
    public function drop(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return $this->notFoundResponse('Student');
        }

        $validator = Validator::make($request->all(), [
            'enrollment_id' => 'required|exists:enrollments,id',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', Response::HTTP_UNPROCESSABLE_ENTITY, $validator->errors());
        }

        $enrollment = Enrollment::where('id', $request->enrollment_id)
                                ->where('student_id', $student->id)
                                ->first();

        if (!$enrollment) {
            return $this->notFoundResponse('Enrollment');
        }

        try {
            $dropped = $enrollment->drop();

            if (!$dropped) {
                return $this->errorResponse('Cannot drop from this class. Drop period may have expired.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return $this->successResponse(null, 'Student dropped from class successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to drop student from class', Response::HTTP_INTERNAL_SERVER_ERROR, $e->getMessage());
        }
    }

    /**
     * Get student grades.
     */
    public function grades($id, Request $request)
    {
        $student = Student::find($id);

        if (!$student) {
            return $this->notFoundResponse('Student');
        }

        $query = $student->enrollments()->with([
            'grades' => function ($q) {
                $q->orderBy('assessment_date', 'desc');
            },
            'class.course'
        ]);

        // Filter by class
        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $enrollments = $query->get();

        $gradesData = $enrollments->map(function ($enrollment) {
            return [
                'enrollment_id' => $enrollment->id,
                'class' => $enrollment->class,
                'final_grade' => $enrollment->final_grade,
                'grade_letter' => $enrollment->grade_letter,
                'is_passed' => $enrollment->is_passed,
                'grades' => $enrollment->grades,
            ];
        });

        return $this->successResponse($gradesData);
    }

    /**
     * Get student attendance.
     */
    public function attendance($id, Request $request)
    {
        $student = Student::find($id);

        if (!$student) {
            return $this->notFoundResponse('Student');
        }

        $query = $student->attendances()->with(['class.course']);

        // Filter by class
        if ($request->has('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('attendance_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('attendance_date', '<=', $request->date_to);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->get();

        // Calculate summary
        $summary = [
            'total_classes' => $attendances->count(),
            'present' => $attendances->where('status', 'present')->count(),
            'late' => $attendances->where('status', 'late')->count(),
            'absent' => $attendances->where('status', 'absent')->count(),
            'excused' => $attendances->where('status', 'excused')->count(),
        ];
        $summary['attendance_rate'] = $summary['total_classes'] > 0 
            ? round((($summary['present'] + $summary['late']) / $summary['total_classes']) * 100, 2)
            : 0;

        return $this->successResponse([
            'attendances' => $attendances,
            'summary' => $summary,
        ]);
    }

    /**
     * Get student academic report.
     */
    public function academicReport($id)
    {
        $student = Student::with([
            'user',
            'enrollments.class.course',
            'enrollments.grades'
        ])->find($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $report = [
            'student_info' => [
                'name' => $student->full_name,
                'student_code' => $student->student_code,
                'enrollment_date' => $student->enrollment_date,
                'status' => $student->status,
                'gpa' => $student->gpa,
                'total_credits' => $student->total_credits,
            ],
            'current_enrollments' => $student->enrollments()->where('status', 'enrolled')->with(['class.course', 'grades'])->get(),
            'completed_courses' => $student->enrollments()->where('status', 'completed')->with(['class.course'])->get(),
            'overall_attendance_rate' => $this->calculateOverallAttendanceRate($student),
        ];

        return $this->successResponse($report);
    }

    /**
     * Calculate overall attendance rate for student.
     */
    private function calculateOverallAttendanceRate(Student $student)
    {
        $totalAttendances = $student->attendances()->count();
        
        if ($totalAttendances === 0) {
            return 0;
        }

        $presentCount = $student->attendances()
            ->whereIn('status', ['present', 'late'])
            ->count();

        return round(($presentCount / $totalAttendances) * 100, 2);
    }
}