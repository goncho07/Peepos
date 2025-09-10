<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'username' => 'admin',
            'email' => 'admin@ricardopalma.edu.pe',
            'password' => Hash::make('123'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin',
        ]);
    }
}
