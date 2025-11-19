<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCollectible extends Model
{
    use HasFactory;

    protected $table = 'user_collectibles';

    protected $fillable = [
        'user_id',
        'card_id',
        'media_id',
        'counters',
    ];

    protected $casts = [
        'counters' => 'array',
        'acquired_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function media()
    {
        return $this->belongsTo(Media::class);
    }
}


