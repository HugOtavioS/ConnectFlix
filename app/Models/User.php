<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'password_hash',
        'city',
        'state',
        'country',
        'level',
        'xp',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }
    
    /**
     * Get the password attribute (for compatibility with Laravel's auth)
     */
    public function getPasswordAttribute()
    {
        return $this->password_hash;
    }
    
    /**
     * Set the password attribute (for compatibility with Laravel's auth)
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['password_hash'] = bcrypt($value);
    }
    
    /**
     * Get the name attribute (alias for username)
     */
    public function getNameAttribute()
    {
        return $this->username;
    }
    
    // Relationships
    public function preferences()
    {
        return $this->hasOne(UserPreference::class);
    }
    
    public function collectibles()
    {
        return $this->hasMany(UserCollectible::class);
    }
    
    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }
    
    public function connectionsAsUser1()
    {
        return $this->hasMany(UserConnection::class, 'user_id1');
    }
    
    public function connectionsAsUser2()
    {
        return $this->hasMany(UserConnection::class, 'user_id2');
    }
    
    public function unlockedMedia()
    {
        return $this->belongsToMany(Media::class, 'user_unlocked_media');
    }
    
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
    
    public function watchTime()
    {
        return $this->hasOne(UserWatchTime::class);
    }
}
