<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id1')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_id2')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['user_id1', 'user_id2'], 'unique_connection');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_connections');
    }
};