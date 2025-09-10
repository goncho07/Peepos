<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class DebugRoles extends Command
{
    protected $signature = 'roles:debug';
    protected $description = 'Debug roles and permissions';

    public function handle()
    {
        $this->info('=== DEBUGGING ROLES AND PERMISSIONS ===');
        
        // Check if tables exist
        $this->info('\n1. Checking tables:');
        $tables = ['roles', 'permissions', 'model_has_roles', 'model_has_permissions', 'role_has_permissions'];
        foreach ($tables as $table) {
            try {
                $count = DB::table($table)->count();
                $this->info("   {$table}: {$count} records");
            } catch (\Exception $e) {
                $this->error("   {$table}: ERROR - {$e->getMessage()}");
            }
        }
        
        // Check roles
        $this->info('\n2. All roles:');
        $roles = Role::all();
        foreach ($roles as $role) {
            $this->info("   ID: {$role->id}, Name: {$role->name}, Guard: {$role->guard_name}");
        }
        
        // Check user
        $this->info('\n3. User details:');
        $user = User::where('email', 'test@example.com')->first();
        if ($user) {
            $this->info("   User ID: {$user->id}");
            $this->info("   Email: {$user->email}");
            $this->info("   Role field: {$user->role}");
            
            // Check direct role assignments
            $this->info('\n4. Direct role assignments in model_has_roles:');
            $assignments = DB::table('model_has_roles')
                ->where('model_type', 'App\\Models\\User')
                ->where('model_id', $user->id)
                ->get();
            
            foreach ($assignments as $assignment) {
                $role = Role::find($assignment->role_id);
                $this->info("   Role ID: {$assignment->role_id}, Role Name: {$role->name}");
            }
            
            // Load roles using Spatie
            $this->info('\n5. Roles loaded via Spatie:');
            $user->load(['roles', 'permissions']);
            $this->info("   Roles count: {$user->roles->count()}");
            foreach ($user->roles as $role) {
                $this->info("   - {$role->name}");
            }
            
        } else {
            $this->error('   User not found!');
        }
        
        return 0;
    }
}