<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Definir todos los permisos del sistema
        $permissions = [
            // Dashboard
            'dashboard.view',
            'dashboard.admin',
            'dashboard.teacher',
            'dashboard.student',

            // Gestión de Usuarios
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.manage',
            'users.import',
            'users.export',

            // Gestión de Estudiantes
            'students.view',
            'students.create',
            'students.edit',
            'students.delete',
            'students.manage',
            'students.grades',
            'students.attendance',
            'students.reports',

            // Gestión de Docentes
            'teachers.view',
            'teachers.create',
            'teachers.edit',
            'teachers.delete',
            'teachers.manage',
            'teachers.assign',

            // Gestión de Cursos
            'courses.view',
            'courses.create',
            'courses.edit',
            'courses.delete',
            'courses.manage',
            'courses.assign',

            // Gestión de Clases
            'classes.view',
            'classes.create',
            'classes.edit',
            'classes.delete',
            'classes.manage',
            'classes.schedule',

            // Gestión de Calificaciones
            'grades.view',
            'grades.create',
            'grades.edit',
            'grades.delete',
            'grades.manage',
            'grades.reports',

            // Gestión de Asistencia
            'attendance.view',
            'attendance.create',
            'attendance.edit',
            'attendance.delete',
            'attendance.manage',
            'attendance.reports',

            // Gestión de Matrículas
            'enrollments.view',
            'enrollments.create',
            'enrollments.edit',
            'enrollments.delete',
            'enrollments.manage',
            'enrollment.view',
            'enrollment.review',

            // Comunicaciones
            'communications.view',
            'communications.create',
            'communications.edit',
            'communications.delete',
            'communications.manage',
            'communications.send',
            'communication.access',

            // Gestión Académica
            'academic.view',

            // Reportes
            'reports.view',
            'reports.generate',
            'reports.export',
            'reports.academic',
            'reports.attendance',
            'reports.grades',
            'reports.financial',

            // Configuración del Sistema
            'settings.view',
            'settings.edit',
            'settings.system',
            'settings.academic',
            'settings.notifications',

            // Gestión de Roles y Permisos
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'roles.manage',
            'permissions.view',
            'permissions.assign',
            'permissions.manage',

            // Gestión de Documentos
            'documents.view',
            'documents.create',
            'documents.edit',
            'documents.delete',
            'documents.manage',
            'documents.upload',
            'documents.download',

            // Gestión Financiera
            'finance.view',
            'finance.create',
            'finance.edit',
            'finance.delete',
            'finance.manage',
            'finance.payments',
            'finance.reports',

            // Gestión de Horarios
            'schedules.view',
            'schedules.create',
            'schedules.edit',
            'schedules.delete',
            'schedules.manage',

            // Gestión de Eventos
            'events.view',
            'events.create',
            'events.edit',
            'events.delete',
            'events.manage',

            // Gestión de Biblioteca
            'library.view',
            'library.create',
            'library.edit',
            'library.delete',
            'library.manage',
            'library.borrow',
            'library.return',

            // Gestión de Inventario
            'inventory.view',
            'inventory.create',
            'inventory.edit',
            'inventory.delete',
            'inventory.manage',

            // Auditoría y Logs
            'audit.view',
            'audit.manage',
            'logs.view',
            'logs.manage',

            // Backup y Mantenimiento
            'backup.create',
            'backup.restore',
            'backup.manage',
            'maintenance.view',
            'maintenance.manage',
        ];

        // Crear permisos con guard 'api'
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'api'
            ]);
        }

        // Obtener el rol de administrador
        $adminRole = Role::where('name', 'admin')
                        ->where('guard_name', 'api')
                        ->first();

        if ($adminRole) {
            // Asignar TODOS los permisos al rol de administrador
            $adminRole->syncPermissions($permissions);
            $this->command->info('Todos los permisos asignados al rol de administrador.');
        } else {
            $this->command->error('Rol de administrador no encontrado.');
        }

        // Configurar permisos básicos para el rol de docente
        $teacherRole = Role::where('name', 'teacher')
                          ->where('guard_name', 'api')
                          ->first();

        if ($teacherRole) {
            $teacherPermissions = [
                'dashboard.view',
                'dashboard.teacher',
                'students.view',
                'students.grades',
                'students.attendance',
                'courses.view',
                'classes.view',
                'classes.manage',
                'grades.view',
                'grades.create',
                'grades.edit',
                'attendance.view',
                'attendance.create',
                'attendance.edit',
                'communications.view',
                'communications.create',
                'reports.view',
                'reports.academic',
                'reports.attendance',
                'reports.grades',
                'documents.view',
                'documents.upload',
                'schedules.view',
                'events.view',
                'library.view',
            ];
            
            $teacherRole->syncPermissions($teacherPermissions);
            $this->command->info('Permisos básicos asignados al rol de docente.');
        }

        // Configurar permisos básicos para el rol de estudiante
        $studentRole = Role::where('name', 'student')
                          ->where('guard_name', 'api')
                          ->first();

        if ($studentRole) {
            $studentPermissions = [
                'dashboard.view',
                'dashboard.student',
                'grades.view',
                'attendance.view',
                'courses.view',
                'classes.view',
                'communications.view',
                'documents.view',
                'schedules.view',
                'events.view',
                'library.view',
                'library.borrow',
                'library.return',
            ];
            
            $studentRole->syncPermissions($studentPermissions);
            $this->command->info('Permisos básicos asignados al rol de estudiante.');
        }

        $this->command->info('PermissionSeeder ejecutado correctamente. Total de permisos creados: ' . count($permissions));
    }
}