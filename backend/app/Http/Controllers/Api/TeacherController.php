<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\HasApiCrud;
use App\Models\Teacher;
use App\Models\ClassModel;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class TeacherController extends Controller
{
    use HasApiCrud;
    /**
     * Display a listing of teachers.
     */
    public function index(Request $request)
    {
        $query = Teacher::with(['user']);
        
        // Apply common filters
        $searchFields = ['employee_code', 'user.first_name', 'user.last_name', 'user.email'];
        $query = $this->applyCommonFilters($query, $request, $searchFields);
        
        // Filter by specialization
        if ($request->has('specialization')) {
            $query->where('specialization', 'like', '%' . $request->specialization . '%');
        }
        
        // Apply date range filter for hire date
        $query = $this->applyDateRangeFilter($query, $request, 'hire_date', 'hire_from', 'hire_to');

        $teachers = $query->paginate($request->get('per_page', 15));

        return $this->successResponse($teachers);
    }

    /**
     * Display the specified teacher.
     */
    public function show($id)
    {
        $teacher = Teacher::with([
            'user',
            'classes.course',
            'classes.enrollments.student.user'
        ])->find($id);

        if (!$teacher) {
            return $this->notFoundResponse('Teacher');
        }

        // Add computed data
        $teacherData = $teacher->toArray();
        $teacherData['active_classes'] = $teacher->getActiveClasses()->count();
        $teacherData['total_students'] = $teacher->getTotalStudents();
        $teacherData['workload'] = $teacher->getWorkload();
        $teacherData['years_at_school'] = $teacher->years_at_school;

        return $this->successResponse($teacherData);
    }

    /**
     * Update the specified teacher.
     */
    public function update(Request $request, $id)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return $this->notFoundResponse('Teacher');
        }

        $validator = Validator::make($request->all(), [
            'hire_date' => 'sometimes|date',
            'specialization' => 'sometimes|string|max:255',
            'qualification' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:100',
            'office_location' => 'nullable|string|max:100',
            'office_hours' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,on_leave',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', Response::HTTP_UNPROCESSABLE_ENTITY, $validator->errors());
        }

        try {
            $teacher->update($request->only([
                'hire_date', 'specialization', 'qualification', 'department',
                'office_location', 'office_hours', 'status'
            ]));

            $teacher->load('user');

            return $this->successResponse($teacher, 'Teacher updated successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update teacher', Response::HTTP_INTERNAL_SERVER_ERROR, $e->getMessage());
        }
    }

    /**
     * Get teacher's classes.
     */
    public function classes($id, Request $request)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return $this->notFoundResponse('Teacher');
        }

        $query = $teacher->classes()->with(['course', 'enrollments.student.user']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by semester/period
        if ($request->has('period')) {
            $query->whereBetween('start_date', [
                $request->period . '-01-01',
                $request->period . '-12-31'
            ]);
        }

        // Filter current classes only
        if ($request->has('current') && $request->current) {
            $query->where('status', 'active')
                  ->where('start_date', '<=', now())
                  ->where('end_date', '>=', now());
        }

        $classes = $query->get();

        // Add enrollment count to each class
        $classes->each(function ($class) {
            $class->enrollment_count = $class->enrollments->count();
            $class->available_spots = $class->available_spots;
        });

        return $this->successResponse($classes);
    }

    /**
     * Assign teacher to a class.
     */
    public function assignClass(Request $request, $id)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return $this->notFoundResponse('Teacher');
        }

        $validator = Validator::make($request->all(), [
            'class_id' => 'required|exists:class_models,id',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', Response::HTTP_UNPROCESSABLE_ENTITY, $validator->errors());
        }

        $class = ClassModel::find($request->class_id);

        // Check if class already has a teacher
        if ($class->teacher_id && $class->teacher_id !== $teacher->id) {
            return $this->errorResponse('Class already has an assigned teacher', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check if teacher can teach this course
        if (!$teacher->canTeachCourse($class->course_id)) {
            return $this->errorResponse('Teacher is not qualified to teach this course', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $class->update(['teacher_id' => $teacher->id]);
            $class->load(['course', 'teacher.user']);

            return $this->successResponse($class, 'Teacher assigned to class successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to assign teacher to class', Response::HTTP_INTERNAL_SERVER_ERROR, $e->getMessage());
        }
    }

    /**
     * Remove teacher from a class.
     */
    public function unassignClass(Request $request, $id)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'class_id' => 'required|exists:classes,id',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', Response::HTTP_UNPROCESSABLE_ENTITY, $validator->errors());
        }

        $class = ClassModel::where('id', $request->class_id)
                          ->where('teacher_id', $teacher->id)
                          ->first();

        if (!$class) {
            return $this->errorResponse('Class not found or not assigned to this teacher', Response::HTTP_NOT_FOUND);
        }

        try {
            $class->update(['teacher_id' => null]);

            return $this->successResponse(null, 'Teacher unassigned from class successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to unassign teacher from class', Response::HTTP_INTERNAL_SERVER_ERROR, $e->getMessage());
        }
    }

    /**
     * Get teacher's schedule.
     */
    public function schedule($id, Request $request)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $classes = $teacher->getActiveClasses();

        $schedule = [];
        $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        foreach ($daysOfWeek as $day) {
            $daySchedule = [];
            
            foreach ($classes as $class) {
                $classSchedule = $class->getScheduleForDay($day);
                if (!empty($classSchedule)) {
                    $daySchedule = array_merge($daySchedule, $classSchedule);
                }
            }
            
            // Sort by start time
            usort($daySchedule, function ($a, $b) {
                return strcmp($a['start_time'], $b['start_time']);
            });
            
            $schedule[$day] = $daySchedule;
        }

        return $this->successResponse([
            'teacher' => $teacher->load('user'),
            'schedule' => $schedule,
            'office_hours' => $teacher->office_hours,
        ]);
    }

    /**
     * Get teacher's students.
     */
    public function students($id, Request $request)
    {
        $teacher = Teacher::find($id);

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $query = $teacher->classes()->with([
            'enrollments.student.user',
            'course'
        ]);

        // Filter by class
        if ($request->has('class_id')) {
            $query->where('id', $request->class_id);
        }

        // Filter current classes only
        if ($request->has('current') && $request->current) {
            $query->where('status', 'active')
                  ->where('start_date', '<=', now())
                  ->where('end_date', '>=', now());
        }

        $classes = $query->get();

        $studentsData = [];
        foreach ($classes as $class) {
            foreach ($class->enrollments as $enrollment) {
                $student = $enrollment->student;
                $studentsData[] = [
                    'student' => $student,
                    'class' => [
                        'id' => $class->id,
                        'name' => $class->full_name,
                        'course' => $class->course,
                    ],
                    'enrollment' => [
                        'id' => $enrollment->id,
                        'status' => $enrollment->status,
                        'enrollment_date' => $enrollment->enrollment_date,
                        'final_grade' => $enrollment->final_grade,
                    ],
                ];
            }
        }

        return $this->successResponse($studentsData);
    }

    /**
     * Get teacher's workload report.
     */
    public function workloadReport($id)
    {
        $teacher = Teacher::with([
            'user',
            'classes.course',
            'classes.enrollments'
        ])->find($id);

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $activeClasses = $teacher->getActiveClasses();
        
        $report = [
            'teacher_info' => [
                'name' => $teacher->full_name,
                'employee_code' => $teacher->employee_code,
                'department' => $teacher->department,
                'specialization' => $teacher->specialization,
                'years_at_school' => $teacher->years_at_school,
            ],
            'workload_summary' => [
                'total_classes' => $activeClasses->count(),
                'total_students' => $teacher->getTotalStudents(),
                'total_hours_per_week' => $teacher->getWorkload(),
            ],
            'classes' => $activeClasses->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->full_name,
                    'course' => $class->course->name,
                    'section' => $class->section,
                    'enrolled_students' => $class->enrollments->count(),
                    'max_capacity' => $class->max_capacity,
                    'schedule' => $class->schedule,
                ];
            }),
        ];

        return $this->successResponse($report);
    }
}