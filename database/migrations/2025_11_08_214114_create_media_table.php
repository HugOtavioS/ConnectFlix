<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->enum('type', ['movie', 'series']);
            $table->text('description')->nullable();
            $table->integer('year')->nullable();
            $table->integer('duration')->nullable();
            $table->decimal('rating', 3, 1)->nullable();
            $table->string('poster_url', 255)->nullable();
            $table->index('title', 'idx_title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};