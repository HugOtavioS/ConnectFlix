<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_unlock_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('target_media_id')->constrained('media')->onDelete('cascade');
            $table->foreignId('required_media_id')->constrained('media')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['target_media_id', 'required_media_id'], 'unlock_req_unique');
            $table->index('target_media_id', 'unlock_req_target_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_unlock_requirements');
    }
};

