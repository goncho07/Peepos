<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

Route::get('/', function () {
    return view('dashboard');
});

// Ruta de login requerida por Laravel
Route::get('/login', function () {
    return response()->json([
        'message' => 'Please login via API endpoint /api/auth/login',
        'login_url' => '/api/auth/login'
    ], 401);
})->name('login');
