<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'course_id',
        'teacher_id',
        'class_code',
        'section',
        'max_students',
        'enrolled_students',
        'classroom',
        'schedule',
        'start_date',
        'end_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'schedule' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'max_students' => 'integer',
        'enrolled_students' => 'integer',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'class_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'class_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeBySection($query, $section)
    {
        return $query->where('section', $section);
    }

    public function scopeCurrent($query)
    {
        $now = now();
        return $query->where('start_date', '<=', $now)
                    ->where('end_date', '>=', $now)
                    ->where('status', 'active');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->course->name . ' - ' . $this->section;
    }

    public function getAvailableSpotsAttribute()
    {
        return $this->max_students - $this->enrolled_students;
    }

    public function getIsFullAttribute()
    {
        return $this->enrolled_students >= $this->max_students;
    }

    // Methods
    public function canEnrollStudent()
    {
        return $this->status === 'active' && !$this->is_full;
    }

    public function enrollStudent($studentId)
    {
        if (!$this->canEnrollStudent()) {
            return false;
        }

        // Check if student is already enrolled
        if ($this->enrollments()->where('student_id', $studentId)->exists()) {
            return false;
        }

        // Check prerequisites
        if (!$this->course->checkPrerequisites($studentId)) {
            return false;
        }

        $enrollment = Enrollment::create([
            'student_id' => $studentId,
            'class_id' => $this->id,
            'enrollment_date' => now(),
            'status' => 'enrolled',
        ]);

        $this->increment('enrolled_students');

        return $enrollment;
    }

    public function dropStudent($studentId)
    {
        $enrollment = $this->enrollments()
            ->where('student_id', $studentId)
            ->where('status', 'enrolled')
            ->first();

        if (!$enrollment) {
            return false;
        }

        $enrollment->update(['status' => 'dropped']);
        $this->decrement('enrolled_students');

        return true;
    }

    public function getScheduleForDay($day)
    {
        return collect($this->schedule)->where('day', strtolower($day))->first();
    }

    public function getWeeklySchedule()
    {
        return collect($this->schedule)->groupBy('day');
    }

    public function calculateAttendanceRate()
    {
        $totalClasses = $this->attendances()->distinct('attendance_date')->count();
        if ($totalClasses === 0) {
            return 0;
        }

        $presentCount = $this->attendances()->where('status', 'present')->count();
        return round(($presentCount / $totalClasses) * 100, 2);
    }
}