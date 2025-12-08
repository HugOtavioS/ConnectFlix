<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserWatchTime extends Model
{
    use HasFactory;

    protected $table = 'user_watch_time';

    protected $fillable = [
        'user_id',
        'total_seconds',
    ];

    protected $casts = [
        'total_seconds' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Incrementa o tempo total assistido
     */
    public function addSeconds(int $seconds): void
    {
        $this->total_seconds += $seconds;
        $this->save();
    }

    /**
     * Obtém ou cria o registro de tempo assistido para um usuário
     */
    public static function getOrCreateForUser(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            ['total_seconds' => 0]
        );
    }
}

