<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserUnlockProgress extends Model
{
    use HasFactory;

    protected $table = 'user_unlock_progress';

    protected $fillable = [
        'user_id',
        'target_media_id',
        'watched_requirement_ids',
        'progress_percentage',
        'started_at',
        'last_activity_at',
    ];

    protected $casts = [
        'watched_requirement_ids' => 'array',
        'progress_percentage' => 'integer',
        'started_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function targetMedia()
    {
        return $this->belongsTo(Media::class, 'target_media_id');
    }
}
