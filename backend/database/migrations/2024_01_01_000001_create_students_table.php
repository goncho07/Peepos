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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('student_code', 10)->unique();
            $table->date('birth_date');
            $table->enum('gender', ['M', 'F', 'O']);
            $table->string('address')->nullable();
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone', 15);
            $table->string('blood_type', 5)->nullable();
            $table->text('medical_conditions')->nullable();
            $table->date('enrollment_date');
            $table->enum('status', ['active', 'inactive', 'graduated', 'transferred'])->default('active');
            $table->decimal('gpa', 3, 2)->default(0.00);
            $table->integer('total_credits')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['student_code', 'status']);
            $table->index(['enrollment_date']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
