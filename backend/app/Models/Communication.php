<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Communication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sender_id',
        'type',
        'title',
        'content',
        'priority',
        'recipients',
        'status',
        'scheduled_at',
        'is_read_receipt_required',
        'attachments',
    ];

    protected $casts = [
        'recipients' => 'array',
        'attachments' => 'array',
        'scheduled_at' => 'datetime',
        'is_read_receipt_required' => 'boolean',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->whereJsonContains('recipients', $userId)
              ->orWhereJsonContains('recipients', 'all')
              ->orWhereJsonContains('recipients', 'students')
              ->orWhereJsonContains('recipients', 'teachers')
              ->orWhereJsonContains('recipients', 'admins');
        });
    }

    public function scopeUrgent($query)
    {
        return $query->where('priority', 'urgent');
    }

    public function scopeHigh($query)
    {
        return $query->where('priority', 'high');
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getIsScheduledAttribute()
    {
        return $this->status === 'scheduled' && $this->scheduled_at;
    }

    public function getIsSentAttribute()
    {
        return $this->status === 'sent';
    }

    public function getIsDraftAttribute()
    {
        return $this->status === 'draft';
    }

    public function getRecipientCountAttribute()
    {
        if (empty($this->recipients)) {
            return 0;
        }

        $count = 0;
        foreach ($this->recipients as $recipient) {
            if (is_numeric($recipient)) {
                $count++; // Individual user
            } elseif ($recipient === 'all') {
                $count += User::count();
            } elseif ($recipient === 'students') {
                $count += User::role('student')->count();
            } elseif ($recipient === 'teachers') {
                $count += User::role('teacher')->count();
            } elseif ($recipient === 'admins') {
                $count += User::role('admin')->count();
            }
        }

        return $count;
    }

    // Methods
    public function send()
    {
        if ($this->status !== 'draft') {
            return false;
        }

        $this->status = 'sent';
        $this->save();

        // Here you would implement the actual sending logic
        // (email, push notifications, etc.)
        $this->deliverToRecipients();

        return true;
    }

    public function schedule($dateTime)
    {
        $this->status = 'scheduled';
        $this->scheduled_at = $dateTime;
        $this->save();

        return $this;
    }

    public function addRecipient($recipient)
    {
        $recipients = $this->recipients ?? [];
        
        if (!in_array($recipient, $recipients)) {
            $recipients[] = $recipient;
            $this->recipients = $recipients;
            $this->save();
        }

        return $this;
    }

    public function removeRecipient($recipient)
    {
        $recipients = $this->recipients ?? [];
        $this->recipients = array_values(array_diff($recipients, [$recipient]));
        $this->save();

        return $this;
    }

    public function addAttachment($filePath, $originalName = null)
    {
        $attachments = $this->attachments ?? [];
        
        $attachments[] = [
            'path' => $filePath,
            'name' => $originalName ?: basename($filePath),
            'size' => filesize($filePath),
            'uploaded_at' => now()->toISOString(),
        ];

        $this->attachments = $attachments;
        $this->save();

        return $this;
    }

    public function getResolvedRecipients()
    {
        $userIds = [];
        
        foreach ($this->recipients as $recipient) {
            if (is_numeric($recipient)) {
                $userIds[] = $recipient;
            } elseif ($recipient === 'all') {
                $userIds = array_merge($userIds, User::pluck('id')->toArray());
            } elseif ($recipient === 'students') {
                $userIds = array_merge($userIds, User::role('student')->pluck('id')->toArray());
            } elseif ($recipient === 'teachers') {
                $userIds = array_merge($userIds, User::role('teacher')->pluck('id')->toArray());
            } elseif ($recipient === 'admins') {
                $userIds = array_merge($userIds, User::role('admin')->pluck('id')->toArray());
            }
        }

        return array_unique($userIds);
    }

    private function deliverToRecipients()
    {
        $recipientIds = $this->getResolvedRecipients();
        
        foreach ($recipientIds as $userId) {
            // Here you would implement the delivery mechanism
            // For now, we'll just create a notification record
            // This could be expanded to send emails, push notifications, etc.
            
            // Example: Create notification record
            // Notification::create([
            //     'user_id' => $userId,
            //     'communication_id' => $this->id,
            //     'type' => $this->type,
            //     'title' => $this->title,
            //     'content' => $this->content,
            //     'is_read' => false,
            // ]);
        }
    }

    public static function sendToRole($role, $type, $title, $content, $priority = 'medium')
    {
        return self::create([
            'sender_id' => auth()->id(),
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'priority' => $priority,
            'recipients' => [$role],
            'status' => 'sent',
        ]);
    }

    public static function sendToUser($userId, $type, $title, $content, $priority = 'medium')
    {
        return self::create([
            'sender_id' => auth()->id(),
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'priority' => $priority,
            'recipients' => [$userId],
            'status' => 'sent',
        ]);
    }

    public static function broadcast($type, $title, $content, $priority = 'medium')
    {
        return self::create([
            'sender_id' => auth()->id(),
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'priority' => $priority,
            'recipients' => ['all'],
            'status' => 'sent',
        ]);
    }
}