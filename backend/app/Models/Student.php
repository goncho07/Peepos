<?php

namespace App\Models;

use App\Traits\HasPersonalInfo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes, HasPersonalInfo;

    protected $fillable = [
        'user_id',
        'student_code',
        'birth_date',
        'gender',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'blood_type',
        'medical_conditions',
        'enrollment_date',
        'status',
        'gpa',
        'total_credits',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'enrollment_date' => 'date',
        'gpa' => 'decimal:2',
        'total_credits' => 'integer',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'enrollment_date' => 'date',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    // Scopes and Accessors are now provided by HasPersonalInfo trait

    // Methods
    public function calculateGPA()
    {
        $completedEnrollments = $this->enrollments()
            ->where('status', 'completed')
            ->whereNotNull('final_grade')
            ->get();

        if ($completedEnrollments->isEmpty()) {
            return 0.00;
        }

        $totalPoints = $completedEnrollments->sum('final_grade');
        $totalCourses = $completedEnrollments->count();

        return round($totalPoints / $totalCourses, 2);
    }

    public function updateGPA()
    {
        $this->gpa = $this->calculateGPA();
        $this->save();
    }

    public function getTotalCredits()
    {
        return $this->enrollments()
            ->where('status', 'completed')
            ->where('is_passed', true)
            ->with('class.course')
            ->get()
            ->sum('class.course.credits');
    }
}