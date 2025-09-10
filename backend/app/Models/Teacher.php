<?php

namespace App\Models;

use App\Traits\HasPersonalInfo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes, HasPersonalInfo;

    protected $fillable = [
        'user_id',
        'teacher_code',
        'birth_date',
        'gender',
        'address',
        'specialization',
        'degree_level',
        'university',
        'hire_date',
        'employment_type',
        'status',
        'salary',
        'years_experience',
        'certifications',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'years_experience' => 'integer',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(ClassModel::class);
    }

    // Scopes are now provided by HasPersonalInfo trait

    public function scopeBySpecialization($query, $specialization)
    {
        return $query->where('specialization', 'like', '%' . $specialization . '%');
    }

    // Basic accessors are now provided by HasPersonalInfo trait

    public function getYearsAtSchoolAttribute()
    {
        return $this->hire_date->diffInYears(now());
    }

    // Methods
    public function getActiveClasses()
    {
        return $this->classes()->where('status', 'active')->get();
    }

    public function getTotalStudents()
    {
        return $this->classes()
            ->where('status', 'active')
            ->sum('enrolled_students');
    }

    public function getWorkload()
    {
        return $this->classes()
            ->where('status', 'active')
            ->with('course')
            ->get()
            ->sum('course.hours_per_week');
    }

    public function canTeachCourse($courseId)
    {
        // Logic to check if teacher can teach a specific course
        // based on specialization, certifications, etc.
        return true; // Simplified for now
    }
}