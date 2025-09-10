<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grade extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'enrollment_id',
        'assessment_type',
        'assessment_name',
        'score',
        'max_score',
        'percentage',
        'weight',
        'assessment_date',
        'comments',
        'is_extra_credit',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'weight' => 'decimal:2',
        'assessment_date' => 'date',
        'is_extra_credit' => 'boolean',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function student()
    {
        return $this->hasOneThrough(
            Student::class,
            Enrollment::class,
            'id',
            'id',
            'enrollment_id',
            'student_id'
        );
    }

    public function class()
    {
        return $this->hasOneThrough(
            ClassModel::class,
            Enrollment::class,
            'id',
            'id',
            'enrollment_id',
            'class_id'
        );
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('assessment_type', $type);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->whereHas('enrollment', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        });
    }

    public function scopeByClass($query, $classId)
    {
        return $query->whereHas('enrollment', function ($q) use ($classId) {
            $q->where('class_id', $classId);
        });
    }

    public function scopeExtraCredit($query)
    {
        return $query->where('is_extra_credit', true);
    }

    public function scopeRegular($query)
    {
        return $query->where('is_extra_credit', false);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('assessment_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getGradeLetterAttribute()
    {
        return $this->calculateGradeLetter($this->percentage);
    }

    public function getIsPassingAttribute()
    {
        return $this->percentage >= 60; // Assuming 60 is passing
    }

    // Methods
    public function calculatePercentage()
    {
        if ($this->max_score == 0) {
            return 0;
        }

        return round(($this->score / $this->max_score) * 100, 2);
    }

    public function updatePercentage()
    {
        $this->percentage = $this->calculatePercentage();
        $this->save();
        return $this;
    }

    public function calculateGradeLetter($percentage)
    {
        if ($percentage >= 97) return 'A+';
        if ($percentage >= 93) return 'A';
        if ($percentage >= 90) return 'A-';
        if ($percentage >= 87) return 'B+';
        if ($percentage >= 83) return 'B';
        if ($percentage >= 80) return 'B-';
        if ($percentage >= 77) return 'C+';
        if ($percentage >= 73) return 'C';
        if ($percentage >= 70) return 'C-';
        if ($percentage >= 67) return 'D+';
        if ($percentage >= 60) return 'D';
        return 'F';
    }

    public function getWeightedScore()
    {
        return $this->percentage * $this->weight;
    }

    public static function getGradeDistribution($classId, $assessmentType = null)
    {
        $query = self::byClass($classId);
        
        if ($assessmentType) {
            $query->byType($assessmentType);
        }

        $grades = $query->get();
        
        $distribution = [
            'A+' => 0, 'A' => 0, 'A-' => 0,
            'B+' => 0, 'B' => 0, 'B-' => 0,
            'C+' => 0, 'C' => 0, 'C-' => 0,
            'D+' => 0, 'D' => 0, 'F' => 0
        ];

        foreach ($grades as $grade) {
            $letter = $grade->grade_letter;
            if (isset($distribution[$letter])) {
                $distribution[$letter]++;
            }
        }

        return $distribution;
    }

    public static function getClassAverage($classId, $assessmentType = null)
    {
        $query = self::byClass($classId)->regular();
        
        if ($assessmentType) {
            $query->byType($assessmentType);
        }

        return $query->avg('percentage');
    }

    public static function getStudentGrades($studentId, $classId = null)
    {
        $query = self::byStudent($studentId);
        
        if ($classId) {
            $query->byClass($classId);
        }

        return $query->with(['enrollment.class.course'])
                    ->orderBy('assessment_date', 'desc')
                    ->get()
                    ->groupBy('enrollment.class.course.name');
    }

    // Event handlers
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($grade) {
            // Auto-calculate percentage when saving
            $grade->percentage = $grade->calculatePercentage();
        });

        static::saved(function ($grade) {
            // Update enrollment's final grade when a grade is saved
            $grade->enrollment->updateFinalGrade();
        });
    }
}