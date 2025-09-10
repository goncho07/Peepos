<?php

namespace App\Http\Controllers\Api;

// Remove duplicate Controller import since it's already imported from Illuminate\Routing
use App\Models\Resource;
use App\Http\Requests\StoreResourceRequest;
use App\Http\Requests\UpdateResourceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Routing\Controller;

class ResourceController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'check_status']);
        $this->middleware(['role:admin|teacher'])->except(['index', 'show', 'download']);
    }

    /**
     * Display a listing of resources.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:document,video,audio,image,other',
            'category' => 'sometimes|string|max:100',
            'class_id' => 'sometimes|exists:classes,id',
            'is_public' => 'sometimes|boolean',
            'sort_by' => 'sometimes|in:name,type,size,created_at,downloads',
            'sort_order' => 'sometimes|in:asc,desc',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $user = $request->user();
        /** @var \Illuminate\Database\Eloquent\Builder $query */
        $query = Resource::with(['uploader', 'class.course']);

        // Apply user role restrictions
        if ($user->hasRole('student')) {
            $query->where(function ($q) use ($user) {
                $q->where('is_public', true)
                    ->orWhereHas('class.enrollments', function ($subQ) use ($user) {
                        $subQ->where('student_id', $user->student->id ?? 0)
                            ->where('status', 'active');
                    });
            });
        } elseif ($user->hasRole('teacher') && !$user->hasRole('admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('is_public', true)
                    ->orWhere('uploader_id', $user->id)
                    ->orWhereHas('class', function ($subQ) use ($user) {
                        $subQ->where('teacher_id', $user->teacher->id ?? 0);
                    });
            });
        }

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhere('category', 'ILIKE', "%{$search}%");
            });
        }

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', 'ILIKE', "%{$request->category}%");
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $resources = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $resources,
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(StoreResourceRequest $request): JsonResponse
    {
        $user = auth()->user();

        // Validate file upload
        if (!$request->hasFile('file')) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo requerido.',
            ], 422);
        }

        $file = $request->file('file');

        // Validate file size (max 50MB)
        if ($file->getSize() > 50 * 1024 * 1024) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo no puede ser mayor a 50MB.',
            ], 422);
        }

        // Generate unique filename
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;

        // Determine file type
        $mimeType = $file->getMimeType();
        $type = $this->determineFileType($mimeType, $extension);

        // Store file
        $path = $file->storeAs('resources', $filename, 'public');

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el archivo.',
            ], 500);
        }

        // Create resource record
        $resource = Resource::create([
            'name' => $request->name ?: pathinfo($originalName, PATHINFO_FILENAME),
            'description' => $request->description,
            'type' => $type,
            'category' => $request->category,
            'file_path' => $path,
            'file_name' => $originalName,
            'file_size' => $file->getSize(),
            'mime_type' => $mimeType,
            'class_id' => $request->class_id,
            'uploader_id' => $user->id,
            'is_public' => $request->boolean('is_public', false),
            'downloads' => 0,
        ]);

        $resource->load(['uploader', 'class.course']);

        return response()->json([
            'success' => true,
            'message' => 'Recurso creado exitosamente.',
            'data' => $resource,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Resource $resource): JsonResponse
    {
        $user = auth()->user();

        // Check access permissions
        if (!$this->canAccessResource($user, $resource)) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para acceder a este recurso.',
            ], 403);
        }

        $resource->load(['uploader', 'class.course']);

        return response()->json([
            'success' => true,
            'data' => $resource,
        ]);
    }

    /**
     * Update the specified resource.
     */
    public function update(UpdateResourceRequest $request, Resource $resource): JsonResponse
    {
        $user = auth()->user();

        // Check if user can edit this resource
        if (!$user->hasRole('admin') && $resource->uploader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para editar este recurso.',
            ], 403);
        }

        $updateData = $request->validated();

        // Handle file replacement if provided
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Validate file size (max 50MB)
            if ($file->getSize() > 50 * 1024 * 1024) {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo no puede ser mayor a 50MB.',
                ], 422);
            }

            // Delete old file
            if ($resource->file_path && Storage::disk('public')->exists($resource->file_path)) {
                Storage::disk('public')->delete($resource->file_path);
            }

            // Store new file
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $filename = Str::uuid() . '.' . $extension;
            $mimeType = $file->getMimeType();
            $type = $this->determineFileType($mimeType, $extension);

            $path = $file->storeAs('resources', $filename, 'public');

            if (!$path) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al subir el archivo.',
                ], 500);
            }

            $updateData['type'] = $type;
            $updateData['file_path'] = $path;
            $updateData['file_name'] = $originalName;
            $updateData['file_size'] = $file->getSize();
            $updateData['mime_type'] = $mimeType;
        }

        $resource->update($updateData);
        $resource->load(['uploader', 'class.course']);

        return response()->json([
            'success' => true,
            'message' => 'Recurso actualizado exitosamente.',
            'data' => $resource,
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Resource $resource): JsonResponse
    {
        $user = auth()->user();

        // Check if user can delete this resource
        if (!$user->hasRole('admin') && $resource->uploader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para eliminar este recurso.',
            ], 403);
        }

        // Delete file from storage
        if ($resource->file_path && Storage::disk('public')->exists($resource->file_path)) {
            Storage::disk('public')->delete($resource->file_path);
        }

        $resource->delete();

        return response()->json([
            'success' => true,
            'message' => 'Recurso eliminado exitosamente.',
        ]);
    }

    /**
     * Download a resource file.
     */
    public function download(Resource $resource): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        $user = auth()->user();

        // Check access permissions
        if (!$this->canAccessResource($user, $resource)) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado para descargar este recurso.',
            ], 403);
        }

        // Check if file exists
        if (!$resource->file_path || !Storage::disk('public')->exists($resource->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Archivo no encontrado.',
            ], 404);
        }

        // Increment download counter
        $resource->increment('downloads');

        // Return file download
        $filePath = Storage::disk('public')->path($resource->file_path);
        return response()->download($filePath, $resource->file_name);
    }

    /**
     * Get resource categories.
     */
    public function categories(): JsonResponse
    {
        $user = auth()->user();
        $query = Resource::select('category')
            ->whereNotNull('category')
            ->where('category', '!=', '');

        // Apply user role restrictions
        if ($user->hasRole('student')) {
            $query->where(function ($q) use ($user) {
                $q->where('is_public', true)
                    ->orWhereHas('class.enrollments', function ($subQ) use ($user) {
                        $subQ->where('student_id', $user->student->id ?? 0)
                            ->where('status', 'active');
                    });
            });
        } elseif ($user->hasRole('teacher') && !$user->hasRole('admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('is_public', true)
                    ->orWhere('uploader_id', $user->id)
                    ->orWhereHas('class', function ($subQ) use ($user) {
                        $subQ->where('teacher_id', $user->teacher->id ?? 0);
                    });
            });
        }

        $categories = $query->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get resource statistics.
     */
    public function stats(): JsonResponse
    {
        $user = auth()->user();

        if (!$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado.',
            ], 403);
        }

        $stats = [
            'total_resources' => Resource::count(),
            'by_type' => Resource::select('type', \DB::raw('count(*) as count'))
                ->groupBy('type')
                ->orderBy('count', 'desc')
                ->get()
                ->pluck('count', 'type'),
            'by_category' => Resource::select('category', \DB::raw('count(*) as count'))
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->groupBy('category')
                ->orderBy('count', 'desc')
                ->take(10)
                ->get()
                ->pluck('count', 'category'),
            'total_size' => Resource::sum('file_size'),
            'total_downloads' => Resource::sum('downloads'),
            'public_resources' => Resource::where('is_public', true)->count(),
            'private_resources' => Resource::where('is_public', false)->count(),
            'most_downloaded' => Resource::with(['uploader', 'class.course'])
                ->orderBy('downloads', 'desc')
                ->take(5)
                ->get(),
            'recent_uploads' => Resource::with(['uploader', 'class.course'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get my uploaded resources.
     */
    public function myResources(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:document,video,audio,image,other',
            'category' => 'sometimes|string|max:100',
            'sort_by' => 'sometimes|in:name,type,size,created_at,downloads',
            'sort_order' => 'sometimes|in:asc,desc',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $user = auth()->user();
        $query = Resource::with(['class.course'])
            ->where('uploader_id', $user->id);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhere('category', 'ILIKE', "%{$search}%");
            });
        }

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', 'ILIKE', "%{$request->category}%");
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $resources = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $resources,
        ]);
    }

    /**
     * Check if user can access a resource.
     */
    private function canAccessResource($user, Resource $resource): bool
    {
        // Admin can access everything
        if ($user->hasRole('admin')) {
            return true;
        }

        // Public resources are accessible to everyone
        if ($resource->is_public) {
            return true;
        }

        // Owner can access their own resources
        if ($resource->uploader_id === $user->id) {
            return true;
        }

        // Teachers can access resources from their classes
        if ($user->hasRole('teacher') && $resource->class_id) {
            $teacherId = $user->teacher->id ?? 0;
            return $resource->class && $resource->class->teacher_id === $teacherId;
        }

        // Students can access resources from classes they're enrolled in
        if ($user->hasRole('student') && $resource->class_id) {
            $studentId = $user->student->id ?? 0;
            return $resource->class &&
                $resource->class->enrollments()
                ->where('student_id', $studentId)
                ->where('status', 'active')
                ->exists();
        }

        return false;
    }

    /**
     * Determine file type based on MIME type and extension.
     */
    private function determineFileType(string $mimeType, string $extension): string
    {
        // Document types
        $documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/rtf',
        ];

        // Video types
        $videoTypes = [
            'video/mp4',
            'video/avi',
            'video/quicktime',
            'video/x-msvideo',
            'video/webm',
        ];

        // Audio types
        $audioTypes = [
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp3',
        ];

        // Image types
        $imageTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/svg+xml',
            'image/webp',
        ];

        if (in_array($mimeType, $documentTypes)) {
            return 'document';
        }

        if (in_array($mimeType, $videoTypes)) {
            return 'video';
        }

        if (in_array($mimeType, $audioTypes)) {
            return 'audio';
        }

        if (in_array($mimeType, $imageTypes)) {
            return 'image';
        }

        return 'other';
    }
}
