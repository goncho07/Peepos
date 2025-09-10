<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class CheckRoles extends Command
{
    protected $signature = 'roles:check';
    protected $description = 'Check and assign roles to users';

    public function handle()
    {
        // Create roles if they don't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);
        $studentRole = Role::firstOrCreate(['name' => 'student']);

        $this->info('Roles created/verified: admin, teacher, student');

        // Find user and assign admin role
        $user = User::where('email', 'test@example.com')->first();
        
        if ($user) {
            // Remove all existing roles first
            $user->syncRoles([]);
            
            // Assign admin role
            $user->assignRole('admin');
            
            $this->info('User roles assigned successfully');
            
            // Verify assignment
            $user->refresh();
            $user->load(['roles', 'permissions']);
            
            $this->info('User has ' . $user->roles->count() . ' roles:');
            foreach ($user->roles as $role) {
                $this->info('- ' . $role->name);
            }
        } else {
            $this->error('User not found');
        }

        return 0;
    }
}