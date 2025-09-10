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
        Schema::create('communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['announcement', 'message', 'notification', 'alert']);
            $table->string('title');
            $table->text('content');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->json('recipients'); // Array of user IDs or roles
            $table->enum('status', ['draft', 'sent', 'scheduled'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->boolean('is_read_receipt_required')->default(false);
            $table->json('attachments')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['sender_id', 'type']);
            $table->index(['type', 'status']);
            $table->index(['priority']);
            $table->index(['scheduled_at']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};
