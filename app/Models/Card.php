<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'related_id',
        'description',
        'rarity',
        'points_value',
        'image_url',
    ];

    // Relationships
    public function collectibles()
    {
        return $this->hasMany(UserCollectible::class);
    }
}


