<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_actors', function (Blueprint $table) {
            $table->timestamps();
            $table->foreignId('media_id')->constrained()->onDelete('cascade');
            $table->foreignId('actor_id')->constrained()->onDelete('cascade');
            $table->primary(['media_id', 'actor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_actors');
    }
};