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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
            $table->string('assessment_type'); // 'exam', 'quiz', 'assignment', 'project', 'participation'
            $table->string('assessment_name');
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2);
            $table->decimal('percentage', 5, 2); // score/max_score * 100
            $table->decimal('weight', 5, 2)->default(1.00); // Weight in final grade calculation
            $table->date('assessment_date');
            $table->text('comments')->nullable();
            $table->boolean('is_extra_credit')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['enrollment_id', 'assessment_type']);
            $table->index(['assessment_date']);
            $table->index(['assessment_type']);
            $table->index(['percentage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
