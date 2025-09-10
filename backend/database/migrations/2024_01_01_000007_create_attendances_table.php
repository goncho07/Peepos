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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->date('attendance_date');
            $table->time('class_start_time');
            $table->time('class_end_time');
            $table->enum('status', ['present', 'absent', 'late', 'excused'])->default('absent');
            $table->time('arrival_time')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_excused')->default(false);
            $table->string('excuse_reason')->nullable();
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['enrollment_id', 'attendance_date']);
            
            // Indexes
            $table->index(['class_id', 'attendance_date']);
            $table->index(['enrollment_id', 'status']);
            $table->index(['attendance_date']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
