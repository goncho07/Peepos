<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class FixRolesGuard extends Command
{
    protected $signature = 'roles:fix-guard';
    protected $description = 'Fix roles guard to use api instead of web';

    public function handle()
    {
        $this->info('=== FIXING ROLES GUARD ===');
        
        // Delete existing roles and assignments
        $this->info('1. Cleaning existing roles...');
        DB::table('model_has_roles')->truncate();
        DB::table('role_has_permissions')->truncate();
        Role::truncate();
        
        // Create roles with api guard
        $this->info('2. Creating roles with api guard...');
        $adminRole = Role::create(['name' => 'admin', 'guard_name' => 'api']);
        $teacherRole = Role::create(['name' => 'teacher', 'guard_name' => 'api']);
        $studentRole = Role::create(['name' => 'student', 'guard_name' => 'api']);
        
        $this->info('   - admin role created');
        $this->info('   - teacher role created');
        $this->info('   - student role created');
        
        // Assign admin role to test user
        $this->info('3. Assigning admin role to test user...');
        $user = User::where('email', 'test@example.com')->first();
        
        if ($user) {
            $user->assignRole($adminRole);
            $this->info('   - Admin role assigned to test@example.com');
            
            // Verify assignment
            $user->refresh();
            $user->load(['roles', 'permissions']);
            
            $this->info('4. Verification:');
            $this->info("   - User has {$user->roles->count()} roles");
            foreach ($user->roles as $role) {
                $this->info("   - Role: {$role->name} (guard: {$role->guard_name})");
            }
        } else {
            $this->error('   User not found!');
        }
        
        $this->info('\n=== ROLES GUARD FIXED ===');
        return 0;
    }
}