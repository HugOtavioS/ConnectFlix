<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'description',
        'year',
        'duration',
        'rating',
        'poster_url',
    ];

    protected $casts = [
        'year' => 'integer',
        'duration' => 'integer',
        'rating' => 'decimal:1',
    ];

    // Relationships
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'media_categories');
    }

    public function actors()
    {
        return $this->belongsToMany(Actor::class, 'media_actors');
    }

    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }

    public function collectibles()
    {
        return $this->hasMany(UserCollectible::class);
    }

    public function unlockedBy()
    {
        return $this->belongsToMany(User::class, 'user_unlocked_media');
    }
}


