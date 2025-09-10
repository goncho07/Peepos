<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreUserRequest;
use App\Http\Requests\Api\UpdateUserRequest;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'check_status']);
        $this->middleware('role:admin')->except(['show', 'update']);
        $this->middleware('can:view,user')->only(['show']);
        $this->middleware('can:update,user')->only(['update']);
    }
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::with(['student', 'teacher', 'admin']);

        // Filter by role
        if ($request->has('role')) {
            $query->role($request->role);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'dni' => 'nullable|string|max:8|unique:users',
            'phone' => 'nullable|string|max:15',
            'role' => 'required|in:admin,teacher,student',
            'profile_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'dni' => $request->dni,
                'phone' => $request->phone,
                'is_active' => true,
            ]);

            // Assign role
            $user->assignRole($request->role);

            // Create profile based on role
            $this->createUserProfile($user, $request->role, $request->profile_data ?? []);

            $user->load(['student', 'teacher', 'admin', 'roles']);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user,
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::with(['student', 'teacher', 'admin', 'roles'])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'dni' => ['nullable', 'string', 'max:8', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:15',
            'is_active' => 'sometimes|boolean',
            'profile_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $user->update($request->only([
                'username', 'email', 'first_name', 'last_name', 
                'dni', 'phone', 'is_active'
            ]));

            // Update profile data if provided
            if ($request->has('profile_data')) {
                $this->updateUserProfile($user, $request->profile_data);
            }

            $user->load(['student', 'teacher', 'admin', 'roles']);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required_if:check_current,true|string',
            'password' => 'required|string|min:8|confirmed',
            'check_current' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Check current password if required
        if ($request->boolean('check_current', true)) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        try {
            $user->update([
                'password' => Hash::make($request->password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $user->update([
                'is_active' => !$user->is_active,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User status updated successfully',
                'data' => $user,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user status',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create user profile based on role.
     */
    private function createUserProfile(User $user, string $role, array $profileData)
    {
        switch ($role) {
            case 'student':
                Student::create(array_merge([
                    'user_id' => $user->id,
                    'student_code' => $this->generateStudentCode(),
                    'enrollment_date' => now(),
                    'status' => 'active',
                ], $profileData));
                break;

            case 'teacher':
                Teacher::create(array_merge([
                    'user_id' => $user->id,
                    'teacher_code' => $this->generateTeacherCode(),
                    'hire_date' => now(),
                    'status' => 'active',
                ], $profileData));
                break;

            case 'admin':
                Admin::create(array_merge([
                    'user_id' => $user->id,
                    'admin_code' => $this->generateAdminCode(),
                    'hire_date' => now(),
                    'status' => 'active',
                    'access_level' => 'admin',
                ], $profileData));
                break;
        }
    }

    /**
     * Update user profile.
     */
    private function updateUserProfile(User $user, array $profileData)
    {
        if ($user->student) {
            $user->student->update($profileData);
        } elseif ($user->teacher) {
            $user->teacher->update($profileData);
        } elseif ($user->admin) {
            $user->admin->update($profileData);
        }
    }

    /**
     * Generate unique student code.
     */
    private function generateStudentCode()
    {
        do {
            $code = 'STU' . str_pad(rand(1, 9999999), 7, '0', STR_PAD_LEFT);
        } while (Student::where('student_code', $code)->exists());

        return $code;
    }

    /**
     * Generate unique teacher code.
     */
    private function generateTeacherCode()
    {
        do {
            $code = 'TEA' . str_pad(rand(1, 9999999), 7, '0', STR_PAD_LEFT);
        } while (Teacher::where('teacher_code', $code)->exists());

        return $code;
    }

    /**
     * Generate unique admin code.
     */
    private function generateAdminCode()
    {
        do {
            $code = 'ADM' . str_pad(rand(1, 9999999), 7, '0', STR_PAD_LEFT);
        } while (Admin::where('admin_code', $code)->exists());

        return $code;
    }
}