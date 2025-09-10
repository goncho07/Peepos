<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear roles con guard 'api'
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $teacherRole = Role::firstOrCreate(['name' => 'teacher', 'guard_name' => 'api']);
        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'api']);

        // Asignar roles a los usuarios
        $adminUser = User::where('email', 'admin@ricardopalma.edu.pe')->first();
        if ($adminUser && !$adminUser->hasRole('admin')) {
            $adminUser->assignRole('admin');
        }

        $teacherUser = User::where('email', 'docente@ricardopalma.edu.pe')->first();
        if ($teacherUser && !$teacherUser->hasRole('teacher')) {
            $teacherUser->assignRole('teacher');
        }

        $studentUser = User::where('email', 'estudiante@ricardopalma.edu.pe')->first();
        if ($studentUser && !$studentUser->hasRole('student')) {
            $studentUser->assignRole('student');
        }

        // Asignar rol admin al usuario de prueba
        $testUser = User::where('email', 'test@example.com')->first();
        if ($testUser && !$testUser->hasRole('admin')) {
            $testUser->assignRole('admin');
        }

        $this->command->info('Roles creados y asignados correctamente.');
    }
}
