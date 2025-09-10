<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('admin_code', 10)->unique();
            $table->string('position');
            $table->string('department');
            $table->date('hire_date');
            $table->enum('access_level', ['super_admin', 'admin', 'coordinator'])->default('admin');
            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active');
            $table->json('permissions')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['admin_code', 'status']);
            $table->index(['access_level']);
            $table->index(['status']);
            $table->index(['department']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
