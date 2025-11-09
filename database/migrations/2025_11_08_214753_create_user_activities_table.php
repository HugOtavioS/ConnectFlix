<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('media_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('activity_type', ['watch', 'stay']);
            $table->integer('duration_seconds');
            $table->timestamp('timestamp')->useCurrent();
            $table->index(['user_id', 'activity_type'], 'idx_user_activity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};