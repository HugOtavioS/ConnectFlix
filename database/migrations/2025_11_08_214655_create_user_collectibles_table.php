<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_collectibles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('card_id')->constrained()->onDelete('cascade');
            $table->foreignId('media_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('acquired_at')->useCurrent();
            $table->json('counters')->nullable();
            $table->index(['user_id', 'card_id'], 'idx_user_card');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_collectibles');
    }
};