<?php

namespace App\Traits;

trait HasPersonalInfo
{
    /**
     * Get the full name from the related user.
     */
    public function getFullNameAttribute(): string
    {
        return $this->user->first_name . ' ' . $this->user->last_name;
    }

    /**
     * Get the age from birth_date.
     */
    public function getAgeAttribute(): int
    {
        return $this->birth_date?->age ?? 0;
    }

    /**
     * Scope to filter by status.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to filter by specific status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}