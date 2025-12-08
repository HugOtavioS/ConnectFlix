<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->string('youtube_id', 50)->nullable()->unique()->after('id');
            $table->index('youtube_id', 'idx_youtube_id');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex('idx_youtube_id');
            $table->dropColumn('youtube_id');
        });
    }
};

