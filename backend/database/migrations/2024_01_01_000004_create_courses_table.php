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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('course_code', 10)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('credits');
            $table->integer('hours_per_week');
            $table->enum('level', ['beginner', 'intermediate', 'advanced']);
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->json('prerequisites')->nullable(); // Array of course IDs
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['course_code', 'status']);
            $table->index(['level']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
