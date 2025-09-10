<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admin extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'admin_code',
        'position',
        'department',
        'hire_date',
        'access_level',
        'status',
        'permissions',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'permissions' => 'array',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByAccessLevel($query, $level)
    {
        return $query->where('access_level', $level);
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->user->first_name . ' ' . $this->user->last_name;
    }

    public function getYearsAtSchoolAttribute()
    {
        return $this->hire_date->diffInYears(now());
    }

    // Methods
    public function hasPermission($permission)
    {
        if ($this->access_level === 'super_admin') {
            return true;
        }

        return in_array($permission, $this->permissions ?? []);
    }

    public function grantPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
            $this->save();
        }
    }

    public function revokePermission($permission)
    {
        $permissions = $this->permissions ?? [];
        $this->permissions = array_values(array_diff($permissions, [$permission]));
        $this->save();
    }

    public function isSuperAdmin()
    {
        return $this->access_level === 'super_admin';
    }

    public function canManageUsers()
    {
        return $this->hasPermission('manage_users') || $this->isSuperAdmin();
    }

    public function canManageAcademics()
    {
        return $this->hasPermission('manage_academics') || $this->isSuperAdmin();
    }

    public function canViewReports()
    {
        return $this->hasPermission('view_reports') || $this->isSuperAdmin();
    }
}