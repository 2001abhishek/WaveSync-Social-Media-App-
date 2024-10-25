<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'avatar_path',
        'banner_path',
        'location',
        'about_user',
    ];

    protected static function boot()
    {
        parent::boot();
        
        // Ensure only one profile per user
        static::saving(function ($profile) {
            if (static::where('user_id', $profile->user_id)
                ->where('id', '!=', $profile->id ?? 0)
                ->exists()) {
                throw new \Exception('User profile already exists');
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}