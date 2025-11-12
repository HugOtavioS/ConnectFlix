<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserConnection extends Model
{
    use HasFactory;

    protected $table = 'user_connections';

    protected $fillable = [
        'user_id1',
        'user_id2',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relationships
    public function user1()
    {
        return $this->belongsTo(User::class, 'user_id1');
    }

    public function user2()
    {
        return $this->belongsTo(User::class, 'user_id2');
    }
}

