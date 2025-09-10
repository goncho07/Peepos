<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuarios primero
        User::factory()->create([
            'username' => 'admin',
            'first_name' => 'Administrador',
            'last_name' => 'Sistema',
            'email' => 'admin@ricardopalma.edu.pe',
            'password' => bcrypt('123'),
            'role' => 'admin',
        ]);

        User::factory()->create([
            'username' => 'docente',
            'first_name' => 'Docente',
            'last_name' => 'Sistema',
            'email' => 'docente@ricardopalma.edu.pe',
            'password' => bcrypt('123'),
            'role' => 'teacher',
        ]);

        User::factory()->create([
            'username' => 'estudiante',
            'first_name' => 'Estudiante',
            'last_name' => 'Sistema',
            'email' => 'estudiante@ricardopalma.edu.pe',
            'password' => bcrypt('123'),
            'role' => 'student',
        ]);

        User::factory()->create([
            'username' => 'testuser',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Ejecutar seeders de roles y permisos
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
        ]);
    }
}
