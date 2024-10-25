<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
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
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function posts()
    {
        return $this->hasMany(UserPost::class);
    }
    public function comments()
    {
        return $this->hasMany(UserComment::class);
    }

    public function likes()
    {
        return $this->hasMany(UserLike::class);
    }
    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    //connection and realation model

    public function sentFriendRequests()
    {
        return $this->hasMany(UserConnection::class, 'user_id');
    }
    
    public function receivedFriendRequests()
    {
        return $this->hasMany(UserConnection::class, 'friend_id');
    }
    
    public function friends()
    {
        return $this->belongsToMany(User::class, 'users_connections', 'user_id', 'friend_id')
            ->wherePivot('is_accepted', true);
    }
    public function userProfile()
    {
        return $this->hasOne(UserProfile::class);
    }



}