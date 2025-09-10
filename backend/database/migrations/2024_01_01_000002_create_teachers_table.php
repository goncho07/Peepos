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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('teacher_code', 10)->unique();
            $table->date('birth_date');
            $table->enum('gender', ['M', 'F', 'O']);
            $table->string('address')->nullable();
            $table->string('specialization');
            $table->string('degree_level');
            $table->string('university')->nullable();
            $table->date('hire_date');
            $table->enum('employment_type', ['full_time', 'part_time', 'contract']);
            $table->enum('status', ['active', 'inactive', 'on_leave', 'terminated'])->default('active');
            $table->decimal('salary', 10, 2)->nullable();
            $table->integer('years_experience')->default(0);
            $table->text('certifications')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['teacher_code', 'status']);
            $table->index(['hire_date']);
            $table->index(['status']);
            $table->index(['specialization']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
