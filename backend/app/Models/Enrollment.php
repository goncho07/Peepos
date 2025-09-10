<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Enrollment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'class_id',
        'enrollment_date',
        'status',
        'final_grade',
        'grade_letter',
        'is_passed',
        'completion_date',
        'notes',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'completion_date' => 'date',
        'final_grade' => 'decimal:2',
        'is_passed' => 'boolean',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'enrolled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePassed($query)
    {
        return $query->where('is_passed', true);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    // Methods
    public function calculateFinalGrade()
    {
        $grades = $this->grades;
        
        if ($grades->isEmpty()) {
            return 0.00;
        }

        $totalWeightedScore = 0;
        $totalWeight = 0;

        foreach ($grades as $grade) {
            $weightedScore = $grade->percentage * $grade->weight;
            $totalWeightedScore += $weightedScore;
            $totalWeight += $grade->weight;
        }

        if ($totalWeight === 0) {
            return 0.00;
        }

        return round($totalWeightedScore / $totalWeight, 2);
    }

    public function updateFinalGrade()
    {
        $finalGrade = $this->calculateFinalGrade();
        $this->final_grade = $finalGrade;
        $this->grade_letter = $this->calculateGradeLetter($finalGrade);
        $this->is_passed = $finalGrade >= 60; // Assuming 60 is passing grade
        $this->save();

        return $this;
    }

    public function calculateGradeLetter($grade)
    {
        if ($grade >= 97) return 'A+';
        if ($grade >= 93) return 'A';
        if ($grade >= 90) return 'A-';
        if ($grade >= 87) return 'B+';
        if ($grade >= 83) return 'B';
        if ($grade >= 80) return 'B-';
        if ($grade >= 77) return 'C+';
        if ($grade >= 73) return 'C';
        if ($grade >= 70) return 'C-';
        if ($grade >= 67) return 'D+';
        if ($grade >= 60) return 'D';
        return 'F';
    }

    public function calculateAttendanceRate()
    {
        $totalAttendances = $this->attendances()->count();
        
        if ($totalAttendances === 0) {
            return 0;
        }

        $presentCount = $this->attendances()
            ->whereIn('status', ['present', 'late'])
            ->count();

        return round(($presentCount / $totalAttendances) * 100, 2);
    }

    public function markAsCompleted()
    {
        $this->status = 'completed';
        $this->completion_date = now();
        $this->updateFinalGrade();
        $this->save();

        // Update student's GPA
        $this->student->updateGPA();

        return $this;
    }

    public function canBeDropped()
    {
        return $this->status === 'enrolled' && 
               $this->enrollment_date->diffInDays(now()) <= 30; // 30-day drop period
    }

    public function drop()
    {
        if (!$this->canBeDropped()) {
            return false;
        }

        $this->status = 'dropped';
        $this->save();

        // Update class enrolled count
        $this->class->decrement('enrolled_students');

        return true;
    }
}