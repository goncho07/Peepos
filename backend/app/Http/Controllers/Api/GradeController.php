<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Enrollment;
use App\Models\ClassModel;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    /**
     * Display a listing of grades.
     */
    public function index(Request $request)
    {
        $query = Grade::with(['enrollment.student.user', 'enrollment.class.course']);

        // Filter by enrollment
        if ($request->has('enrollment_id')) {
            $query->where('enrollment_id', $request->enrollment_id);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->whereHas('enrollment', function ($q) use ($request) {
                $q->where('student_id', $request->student_id);
            });
        }

        // Filter by class
        if ($request->has('class_id')) {
            $query->whereHas('enrollment', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        // Filter by grade type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('assessment_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('assessment_date', '<=', $request->date_to);
        }

        $grades = $query->orderBy('assessment_date', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $grades,
        ]);
    }

    /**
     * Store a newly created grade.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'enrollment_id' => 'required|exists:enrollments,id',
            'type' => 'required|in:exam,quiz,assignment,project,participation,final,midterm',
            'name' => 'required|string|max:255',
            'points_earned' => 'required|numeric|min:0',
            'points_possible' => 'required|numeric|min:0.01',
            'weight' => 'required|numeric|min:0|max:100',
            'assessment_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Validate enrollment exists and is active
        $enrollment = Enrollment::find($request->enrollment_id);
        if (!$enrollment || $enrollment->status !== 'enrolled') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or inactive enrollment',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Validate points earned doesn't exceed points possible
        if ($request->points_earned > $request->points_possible) {
            return response()->json([
                'success' => false,
                'message' => 'Points earned cannot exceed points possible',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $grade = Grade::create([
                'enrollment_id' => $request->enrollment_id,
                'type' => $request->type,
                'name' => $request->name,
                'points_earned' => $request->points_earned,
                'points_possible' => $request->points_possible,
                'weight' => $request->weight,
                'assessment_date' => $request->assessment_date,
                'notes' => $request->notes,
            ]);

            $grade->load(['enrollment.student.user', 'enrollment.class.course']);

            return response()->json([
                'success' => true,
                'message' => 'Grade created successfully',
                'data' => $grade,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create grade',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified grade.
     */
    public function show($id)
    {
        $grade = Grade::with([
            'enrollment.student.user',
            'enrollment.class.course',
            'enrollment.class.teacher.user'
        ])->find($id);

        if (!$grade) {
            return response()->json([
                'success' => false,
                'message' => 'Grade not found',
            ], Response::HTTP_NOT_FOUND);
        }

        // Add computed data
        $gradeData = $grade->toArray();
        $gradeData['percentage'] = $grade->percentage;
        $gradeData['grade_letter'] = $grade->grade_letter;
        $gradeData['is_passing'] = $grade->is_passing;

        return response()->json([
            'success' => true,
            'data' => $gradeData,
        ]);
    }

    /**
     * Update the specified grade.
     */
    public function update(Request $request, $id)
    {
        $grade = Grade::find($id);

        if (!$grade) {
            return response()->json([
                'success' => false,
                'message' => 'Grade not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:exam,quiz,assignment,project,participation,final,midterm',
            'name' => 'sometimes|string|max:255',
            'points_earned' => 'sometimes|numeric|min:0',
            'points_possible' => 'sometimes|numeric|min:0.01',
            'weight' => 'sometimes|numeric|min:0|max:100',
            'assessment_date' => 'sometimes|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Validate points earned doesn't exceed points possible
        $pointsEarned = $request->get('points_earned', $grade->points_earned);
        $pointsPossible = $request->get('points_possible', $grade->points_possible);
        
        if ($pointsEarned > $pointsPossible) {
            return response()->json([
                'success' => false,
                'message' => 'Points earned cannot exceed points possible',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $grade->update($request->only([
                'type', 'name', 'points_earned', 'points_possible',
                'weight', 'assessment_date', 'notes'
            ]));

            $grade->load(['enrollment.student.user', 'enrollment.class.course']);

            return response()->json([
                'success' => true,
                'message' => 'Grade updated successfully',
                'data' => $grade,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update grade',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified grade.
     */
    public function destroy($id)
    {
        $grade = Grade::find($id);

        if (!$grade) {
            return response()->json([
                'success' => false,
                'message' => 'Grade not found',
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $enrollmentId = $grade->enrollment_id;
            $grade->delete();

            // Update enrollment's final grade after deletion
            $enrollment = Enrollment::find($enrollmentId);
            if ($enrollment) {
                $enrollment->updateFinalGrade();
            }

            return response()->json([
                'success' => true,
                'message' => 'Grade deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete grade',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Bulk create grades for multiple students.
     */
    public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'class_id' => 'required|exists:class_models,id',
            'type' => 'required|in:exam,quiz,assignment,project,participation,final,midterm',
            'name' => 'required|string|max:255',
            'points_possible' => 'required|numeric|min:0.01',
            'weight' => 'required|numeric|min:0|max:100',
            'assessment_date' => 'required|date',
            'grades' => 'required|array|min:1',
            'grades.*.enrollment_id' => 'required|exists:enrollments,id',
            'grades.*.points_earned' => 'required|numeric|min:0',
            'grades.*.notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Validate all enrollments belong to the specified class
        $class = ClassModel::find($request->class_id);
        $enrollmentIds = collect($request->grades)->pluck('enrollment_id');
        $validEnrollments = $class->enrollments()->whereIn('id', $enrollmentIds)->pluck('id');
        
        if ($validEnrollments->count() !== $enrollmentIds->count()) {
            return response()->json([
                'success' => false,
                'message' => 'Some enrollments do not belong to the specified class',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            DB::beginTransaction();

            $createdGrades = [];
            
            foreach ($request->grades as $gradeData) {
                // Validate points earned doesn't exceed points possible
                if ($gradeData['points_earned'] > $request->points_possible) {
                    throw new \Exception("Points earned ({$gradeData['points_earned']}) cannot exceed points possible ({$request->points_possible}) for enrollment {$gradeData['enrollment_id']}");
                }

                $grade = Grade::create([
                    'enrollment_id' => $gradeData['enrollment_id'],
                    'type' => $request->type,
                    'name' => $request->name,
                    'points_earned' => $gradeData['points_earned'],
                    'points_possible' => $request->points_possible,
                    'weight' => $request->weight,
                    'assessment_date' => $request->assessment_date,
                    'notes' => $gradeData['notes'] ?? null,
                ]);

                $createdGrades[] = $grade;
            }

            DB::commit();

            // Load relationships for response
            $grades = Grade::with(['enrollment.student.user', 'enrollment.class.course'])
                          ->whereIn('id', collect($createdGrades)->pluck('id'))
                          ->get();

            return response()->json([
                'success' => true,
                'message' => 'Grades created successfully',
                'data' => $grades,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create grades',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get grade statistics for a class.
     */
    public function classStatistics($classId, Request $request)
    {
        $class = ClassModel::with(['course', 'teacher.user'])->find($classId);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $query = Grade::whereHas('enrollment', function ($q) use ($classId) {
            $q->where('class_id', $classId);
        });

        // Filter by grade type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $grades = $query->get();

        if ($grades->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'class' => $class,
                    'statistics' => [
                        'total_grades' => 0,
                        'average_percentage' => 0,
                        'highest_percentage' => 0,
                        'lowest_percentage' => 0,
                        'grade_distribution' => [],
                    ],
                ],
            ]);
        }

        $percentages = $grades->map(function ($grade) {
            return $grade->percentage;
        });

        $gradeDistribution = $grades->groupBy('grade_letter')
                                   ->map(function ($group) {
                                       return $group->count();
                                   });

        $statistics = [
            'total_grades' => $grades->count(),
            'average_percentage' => round($percentages->avg(), 2),
            'highest_percentage' => $percentages->max(),
            'lowest_percentage' => $percentages->min(),
            'grade_distribution' => $gradeDistribution,
            'passing_rate' => round(($grades->where('is_passing', true)->count() / $grades->count()) * 100, 2),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'class' => $class,
                'statistics' => $statistics,
            ],
        ]);
    }

    /**
     * Get student grade report.
     */
    public function studentReport($studentId, Request $request)
    {
        $student = Student::with(['user'])->find($studentId);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $query = $student->enrollments()->with([
            'class.course',
            'grades' => function ($q) {
                $q->orderBy('assessment_date', 'desc');
            }
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

        $report = [
            'student' => $student,
            'enrollments' => $enrollments->map(function ($enrollment) {
                return [
                    'enrollment' => $enrollment,
                    'class' => $enrollment->class,
                    'final_grade' => $enrollment->final_grade,
                    'grade_letter' => $enrollment->grade_letter,
                    'is_passed' => $enrollment->is_passed,
                    'grades_by_type' => $enrollment->grades->groupBy('type'),
                    'grade_summary' => [
                        'total_grades' => $enrollment->grades->count(),
                        'average_percentage' => $enrollment->grades->avg('percentage'),
                        'highest_grade' => $enrollment->grades->max('percentage'),
                        'lowest_grade' => $enrollment->grades->min('percentage'),
                    ],
                ];
            }),
            'overall_gpa' => $student->gpa,
        ];

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }
}