<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;

class TestApiRoles extends Command
{
    protected $signature = 'test:api-roles';
    protected $description = 'Test API roles loading';

    public function handle()
    {
        $this->info('=== TESTING API ROLES ===');
        
        $user = User::where('email', 'test@example.com')->first();
        
        if (!$user) {
            $this->error('User not found!');
            return 1;
        }
        
        $this->info("User found: {$user->email}");
        
        // Test different ways to load roles
        $this->info('\n1. Direct roles relationship:');
        $directRoles = $user->roles;
        $this->info("   Count: {$directRoles->count()}");
        foreach ($directRoles as $role) {
            $this->info("   - {$role->name} (guard: {$role->guard_name})");
        }
        
        $this->info('\n2. Load roles relationship:');
        $user->load('roles');
        $this->info("   Count: {$user->roles->count()}");
        foreach ($user->roles as $role) {
            $this->info("   - {$role->name} (guard: {$role->guard_name})");
        }
        
        $this->info('\n3. getRoleNames() method:');
        $roleNames = $user->getRoleNames();
        $this->info("   Count: {$roleNames->count()}");
        foreach ($roleNames as $roleName) {
            $this->info("   - {$roleName}");
        }
        
        $this->info('\n4. getRoleNames() with api guard:');
        $apiRoleNames = $user->getRoleNames('api');
        $this->info("   Count: {$apiRoleNames->count()}");
        foreach ($apiRoleNames as $roleName) {
            $this->info("   - {$roleName}");
        }
        
        $this->info('\n5. hasRole() checks:');
        $this->info("   - hasRole('admin'): " . ($user->hasRole('admin') ? 'YES' : 'NO'));
        $this->info("   - hasRole('admin', 'api'): " . ($user->hasRole('admin', 'api') ? 'YES' : 'NO'));
        
        $this->info('\n6. All roles in database:');
        $allRoles = Role::all();
        foreach ($allRoles as $role) {
            $this->info("   - {$role->name} (guard: {$role->guard_name})");
        }
        
        $this->info('\n7. Model has roles table:');
        $modelHasRoles = \DB::table('model_has_roles')->where('model_id', $user->id)->get();
        $this->info("   Count: {$modelHasRoles->count()}");
        foreach ($modelHasRoles as $mhr) {
            $role = Role::find($mhr->role_id);
            $this->info("   - Role ID: {$mhr->role_id}, Name: {$role->name}, Guard: {$role->guard_name}");
        }
        
        return 0;
    }
}