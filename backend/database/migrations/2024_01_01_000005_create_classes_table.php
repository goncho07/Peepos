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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('restrict');
            $table->string('class_code', 15)->unique();
            $table->string('section', 5);
            $table->integer('max_students')->default(30);
            $table->integer('enrolled_students')->default(0);
            $table->string('classroom')->nullable();
            $table->json('schedule'); // [{"day": "monday", "start_time": "08:00", "end_time": "10:00"}]
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'inactive', 'completed', 'cancelled'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['class_code', 'status']);
            $table->index(['teacher_id', 'status']);
            $table->index(['course_id']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
