<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaUnlockRequirement extends Model
{
    use HasFactory;

    protected $table = 'media_unlock_requirements';

    protected $fillable = [
        'target_media_id',
        'required_media_id',
    ];

    // Relationships
    public function targetMedia()
    {
        return $this->belongsTo(Media::class, 'target_media_id');
    }

    public function requiredMedia()
    {
        return $this->belongsTo(Media::class, 'required_media_id');
    }
}

