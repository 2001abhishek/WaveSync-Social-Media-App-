<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class UserPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'image_paths', // Change this to match the new column name
    ];

    protected $casts = [
        'image_paths' => 'array', // Cast the image_paths to an array
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(UserComment::class);
    }

    public function likes()
    {
        return $this->hasMany(UserLike::class, 'user_post_id');
    }

    public function likedBy()
    {
        return $this->belongsToMany(User::class, 'user_likes', 'user_post_id', 'user_id');
    }

    public function getLikedAttribute()
    {
        $user = Auth::user();
        if (!$user) {
            return false;
        }
        return $this->likes()->where('user_id', $user->id)->exists();
    }
}
