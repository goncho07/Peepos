<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Handle user login
     */
    public function login(Request $request)
    {
        try {
            // Aceptar tanto email como username
            $request->validate([
                'email' => 'required_without:username|string',
                'username' => 'required_without:email|string', 
                'password' => 'required|string',
            ]);

            // Determinar el campo de login
            $loginField = $request->has('email') ? $request->email : $request->username;
            
            $user = User::where('username', $loginField)
                       ->orWhere('email', $loginField)
                       ->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Las credenciales proporcionadas son incorrectas.',
                    'errors' => [
                        'email' => ['Las credenciales proporcionadas son incorrectas.']
                    ]
                ], 401);
            }

            // Check if user is active (commented out - column doesn't exist)
            // if (!$user->is_active) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Tu cuenta está desactivada. Contacta al administrador.',
            //         'errors' => [
            //             'username' => ['Tu cuenta está desactivada. Contacta al administrador.']
            //         ]
            //     ], 403);
            // }

            // Delete existing tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('auth-token', [
                'read',
                'write',
                'delete'
            ])->plainTextToken;

            // Load user relationships
            $user->load(['roles', 'permissions']);

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'roles' => $user->roles->map(function($role) {
                            return [
                                'id' => $role->id,
                                'name' => $role->name,
                                'guard_name' => $role->guard_name
                            ];
                        }),
                        'permissions' => $user->permissions->map(function($permission) {
                            return [
                                'id' => $permission->id,
                                'name' => $permission->name,
                                'guard_name' => $permission->guard_name
                            ];
                        })
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => (int) config('sanctum.expiration', 525600) * 60,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        try {
            // Delete current token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();
            
            // Load user relationships
            $user->load(['roles', 'permissions']);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información del usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refresh user token
     */
    public function refresh(Request $request)
    {
        try {
            $user = $request->user();
            
            // Delete current token
            $request->user()->currentAccessToken()->delete();
            
            // Create new token
            $token = $user->createToken('auth-token', [
                'read',
                'write',
                'delete'
            ])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Token renovado exitosamente',
                'data' => [
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => config('sanctum.expiration', 525600) * 60,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al renovar token',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}