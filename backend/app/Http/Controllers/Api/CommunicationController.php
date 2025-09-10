<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Communication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CommunicationController extends Controller
{
    /**
     * Display a listing of communications.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Communication::with(['sender']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter communications for current user
        if ($request->has('for_me') && $request->for_me) {
            $query->forUser($user->id);
        }

        // Filter sent communications
        if ($request->has('sent') && $request->sent) {
            $query->where('sender_id', $user->id);
        }

        // Search by subject or content
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $communications = $query->orderBy('created_at', 'desc')
                               ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $communications,
        ]);
    }

    /**
     * Store a newly created communication.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:announcement,notification,message,alert,reminder',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'integer|exists:users,id',
            'scheduled_at' => 'nullable|date|after:now',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $user = Auth::user();
            
            // Handle file attachments
            $attachments = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('communications', 'public');
                    $attachments[] = [
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ];
                }
            }

            $communication = Communication::create([
                'sender_id' => $user->id,
                'type' => $request->type,
                'subject' => $request->subject,
                'content' => $request->content,
                'priority' => $request->priority,
                'recipients' => $request->recipients,
                'attachments' => $attachments,
                'scheduled_at' => $request->scheduled_at,
                'status' => $request->scheduled_at ? 'scheduled' : 'draft',
            ]);

            // Send immediately if not scheduled
            if (!$request->scheduled_at) {
                $communication->send();
            }

            $communication->load('sender');

            return response()->json([
                'success' => true,
                'message' => $request->scheduled_at ? 'Communication scheduled successfully' : 'Communication sent successfully',
                'data' => $communication,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create communication',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified communication.
     */
    public function show($id)
    {
        $communication = Communication::with(['sender'])->find($id);

        if (!$communication) {
            return response()->json([
                'success' => false,
                'message' => 'Communication not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();
        
        // Check if user has access to this communication
        if ($communication->sender_id !== $user->id && !in_array($user->id, $communication->recipients)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], Response::HTTP_FORBIDDEN);
        }

        // Add computed data
        $communicationData = $communication->toArray();
        $communicationData['is_scheduled'] = $communication->is_scheduled;
        $communicationData['is_sent'] = $communication->is_sent;
        $communicationData['is_draft'] = $communication->is_draft;
        $communicationData['recipient_count'] = $communication->recipient_count;

        return response()->json([
            'success' => true,
            'data' => $communicationData,
        ]);
    }

    /**
     * Update the specified communication.
     */
    public function update(Request $request, $id)
    {
        $communication = Communication::find($id);

        if (!$communication) {
            return response()->json([
                'success' => false,
                'message' => 'Communication not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();
        
        // Only sender can update communication
        if ($communication->sender_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], Response::HTTP_FORBIDDEN);
        }

        // Cannot update sent communications
        if ($communication->status === 'sent') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update sent communications',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:announcement,notification,message,alert,reminder',
            'subject' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'recipients' => 'sometimes|array|min:1',
            'recipients.*' => 'integer|exists:users,id',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $updateData = $request->only([
                'type', 'subject', 'content', 'priority', 'recipients', 'scheduled_at'
            ]);

            // Update status based on scheduled_at
            if ($request->has('scheduled_at')) {
                $updateData['status'] = $request->scheduled_at ? 'scheduled' : 'draft';
            }

            $communication->update($updateData);
            $communication->load('sender');

            return response()->json([
                'success' => true,
                'message' => 'Communication updated successfully',
                'data' => $communication,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update communication',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified communication.
     */
    public function destroy($id)
    {
        $communication = Communication::find($id);

        if (!$communication) {
            return response()->json([
                'success' => false,
                'message' => 'Communication not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();
        
        // Only sender can delete communication
        if ($communication->sender_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            // Delete attachments from storage
            if (!empty($communication->attachments)) {
                foreach ($communication->attachments as $attachment) {
                    if (isset($attachment['path'])) {
                        Storage::disk('public')->delete($attachment['path']);
                    }
                }
            }

            $communication->delete();

            return response()->json([
                'success' => true,
                'message' => 'Communication deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete communication',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Send a draft communication.
     */
    public function send($id)
    {
        $communication = Communication::find($id);

        if (!$communication) {
            return response()->json([
                'success' => false,
                'message' => 'Communication not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();
        
        // Only sender can send communication
        if ($communication->sender_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], Response::HTTP_FORBIDDEN);
        }

        // Can only send draft or scheduled communications
        if (!in_array($communication->status, ['draft', 'scheduled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Communication has already been sent',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $sent = $communication->send();

            if (!$sent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send communication',
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $communication->load('sender');

            return response()->json([
                'success' => true,
                'message' => 'Communication sent successfully',
                'data' => $communication,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send communication',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Broadcast communication to all users with specific role.
     */
    public function broadcast(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:admin,teacher,student',
            'type' => 'required|in:announcement,notification,message,alert,reminder',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $user = Auth::user();
            
            $communication = Communication::broadcast(
                $user->id,
                $request->role,
                $request->type,
                $request->subject,
                $request->content,
                $request->priority
            );

            $communication->load('sender');

            return response()->json([
                'success' => true,
                'message' => 'Broadcast sent successfully',
                'data' => $communication,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send broadcast',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get user's inbox.
     */
    public function inbox(Request $request)
    {
        $user = Auth::user();
        
        $query = Communication::forUser($user->id)
                              ->with(['sender'])
                              ->where('status', 'sent');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter unread only
        if ($request->has('unread') && $request->unread) {
            $query->whereJsonDoesntContain('read_by', $user->id);
        }

        $communications = $query->orderBy('created_at', 'desc')
                               ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $communications,
        ]);
    }

    /**
     * Get user's sent communications.
     */
    public function sent(Request $request)
    {
        $user = Auth::user();
        
        $query = Communication::where('sender_id', $user->id)
                              ->with(['sender']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $communications = $query->orderBy('created_at', 'desc')
                               ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $communications,
        ]);
    }

    /**
     * Mark communication as read.
     */
    public function markAsRead($id)
    {
        $communication = Communication::find($id);

        if (!$communication) {
            return response()->json([
                'success' => false,
                'message' => 'Communication not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();
        
        // Check if user is a recipient
        if (!in_array($user->id, $communication->recipients)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $readBy = $communication->read_by ?? [];
            
            if (!in_array($user->id, $readBy)) {
                $readBy[] = $user->id;
                $communication->update(['read_by' => $readBy]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Communication marked as read',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark communication as read',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Download communication attachment.
     */
    public function downloadAttachment($id, $attachmentIndex)
    {
        $communication = Communication::find($id);

        if (!$communication) {
            return response()->json([
                'success' => false,
                'message' => 'Communication not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();
        
        // Check if user has access to this communication
        if ($communication->sender_id !== $user->id && !in_array($user->id, $communication->recipients)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], Response::HTTP_FORBIDDEN);
        }

        $attachments = $communication->attachments ?? [];
        
        if (!isset($attachments[$attachmentIndex])) {
            return response()->json([
                'success' => false,
                'message' => 'Attachment not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $attachment = $attachments[$attachmentIndex];
        
        if (!Storage::disk('public')->exists($attachment['path'])) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], Response::HTTP_NOT_FOUND);
        }

        return Storage::disk('public')->download($attachment['path'], $attachment['name']);
    }
}