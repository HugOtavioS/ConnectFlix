<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_unlock_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('target_media_id')->constrained('media')->onDelete('cascade');
            $table->json('watched_requirement_ids')->nullable();
            $table->integer('progress_percentage')->default(0);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('last_activity_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['user_id', 'target_media_id'], 'user_media_progress_unique');
            $table->index('user_id', 'unlock_progress_user_idx');
            $table->index('target_media_id', 'unlock_progress_media_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_unlock_progress');
    }
};
