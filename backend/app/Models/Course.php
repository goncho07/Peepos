<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'course_code',
        'name',
        'description',
        'credits',
        'hours_per_week',
        'level',
        'status',
        'prerequisites',
    ];

    protected $casts = [
        'credits' => 'integer',
        'hours_per_week' => 'integer',
        'prerequisites' => 'array',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function classes(): HasMany
    {
        return $this->hasMany(ClassModel::class);
    }

    public function prerequisiteCourses()
    {
        if (empty($this->prerequisites)) {
            return collect();
        }

        return Course::whereIn('id', $this->prerequisites)->get();
    }

    public function dependentCourses()
    {
        return Course::whereJsonContains('prerequisites', $this->id)->get();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeByCredits($query, $credits)
    {
        return $query->where('credits', $credits);
    }

    // Methods
    public function getActiveClasses()
    {
        return $this->classes()->where('status', 'active')->get();
    }

    public function getTotalEnrolledStudents()
    {
        return $this->classes()
            ->where('status', 'active')
            ->sum('enrolled_students');
    }

    public function hasPrerequisites()
    {
        return !empty($this->prerequisites);
    }

    public function checkPrerequisites($studentId)
    {
        if (!$this->hasPrerequisites()) {
            return true;
        }

        $student = Student::find($studentId);
        if (!$student) {
            return false;
        }

        $completedCourses = $student->enrollments()
            ->where('status', 'completed')
            ->where('is_passed', true)
            ->with('class.course')
            ->get()
            ->pluck('class.course.id')
            ->toArray();

        return empty(array_diff($this->prerequisites, $completedCourses));
    }

    public function getAverageGrade()
    {
        $enrollments = Enrollment::whereHas('class', function ($query) {
            $query->where('course_id', $this->id);
        })
        ->where('status', 'completed')
        ->whereNotNull('final_grade')
        ->get();

        if ($enrollments->isEmpty()) {
            return null;
        }

        return $enrollments->avg('final_grade');
    }
}