<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'class_id',
        'attendance_date',
        'class_start_time',
        'class_end_time',
        'status',
        'arrival_time',
        'notes',
        'is_excused',
        'excuse_reason',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'class_start_time' => 'datetime:H:i',
        'class_end_time' => 'datetime:H:i',
        'arrival_time' => 'datetime:H:i',
        'is_excused' => 'boolean',
    ];

    // Relationships
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
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

    // Scopes
    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }

    public function scopeLate($query)
    {
        return $query->where('status', 'late');
    }

    public function scopeExcused($query)
    {
        return $query->where('is_excused', true);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('attendance_date', $date);
    }

    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->whereHas('enrollment', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        });
    }

    // Accessors
    public function getIsLateAttribute()
    {
        return $this->status === 'late' || 
               ($this->arrival_time && $this->arrival_time > $this->class_start_time);
    }

    public function getMinutesLateAttribute()
    {
        if (!$this->arrival_time || $this->arrival_time <= $this->class_start_time) {
            return 0;
        }

        return $this->class_start_time->diffInMinutes($this->arrival_time);
    }

    // Methods
    public function markPresent($arrivalTime = null)
    {
        $this->status = 'present';
        $this->arrival_time = $arrivalTime ?: now();
        
        // Check if late
        if ($this->arrival_time > $this->class_start_time) {
            $this->status = 'late';
        }
        
        $this->save();
        return $this;
    }

    public function markAbsent($reason = null)
    {
        $this->status = 'absent';
        $this->arrival_time = null;
        $this->notes = $reason;
        $this->save();
        return $this;
    }

    public function markExcused($reason)
    {
        $this->status = 'excused';
        $this->is_excused = true;
        $this->excuse_reason = $reason;
        $this->save();
        return $this;
    }

    public function calculateLatenessImpact()
    {
        if ($this->status !== 'late') {
            return 0;
        }

        $minutesLate = $this->minutes_late;
        
        // Deduct points based on lateness
        if ($minutesLate <= 5) return 0.1;
        if ($minutesLate <= 15) return 0.3;
        if ($minutesLate <= 30) return 0.5;
        return 1.0; // Treat as absent if more than 30 minutes late
    }

    public static function createForClass($classId, $date)
    {
        $class = ClassModel::find($classId);
        if (!$class) {
            return false;
        }

        $enrollments = $class->enrollments()->where('status', 'enrolled')->get();
        $attendances = [];

        foreach ($enrollments as $enrollment) {
            $attendances[] = self::create([
                'enrollment_id' => $enrollment->id,
                'class_id' => $classId,
                'attendance_date' => $date,
                'class_start_time' => '08:00', // Default, should be from schedule
                'class_end_time' => '10:00',   // Default, should be from schedule
                'status' => 'absent', // Default to absent
            ]);
        }

        return $attendances;
    }

    public static function getAttendanceReport($classId, $startDate, $endDate)
    {
        return self::where('class_id', $classId)
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->with(['enrollment.student.user'])
            ->get()
            ->groupBy('enrollment.student_id')
            ->map(function ($attendances) {
                $total = $attendances->count();
                $present = $attendances->where('status', 'present')->count();
                $late = $attendances->where('status', 'late')->count();
                $absent = $attendances->where('status', 'absent')->count();
                $excused = $attendances->where('status', 'excused')->count();
                
                return [
                    'student' => $attendances->first()->enrollment->student,
                    'total_classes' => $total,
                    'present' => $present,
                    'late' => $late,
                    'absent' => $absent,
                    'excused' => $excused,
                    'attendance_rate' => $total > 0 ? round((($present + $late) / $total) * 100, 2) : 0,
                ];
            });
    }
}