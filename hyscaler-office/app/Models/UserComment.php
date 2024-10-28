<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class UserComment extends Model
{
    use HasFactory;

    protected $table = 'user_comments';

    protected $fillable = [
        'user_id',
        'user_post_id',
        'master_comment_id',
        'content',
    ];

    protected $with = ['nestedComments', 'user.userProfile']; // Load user and userProfile by default

    public function scopeMasterCommentsOnly(Builder $query): Builder
    {
        return $query->whereNull('master_comment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(UserPost::class, 'user_post_id');
    }

    public function nestedComments()
    {
        return $this->hasMany(UserComment::class, 'master_comment_id')
            ->orderBy('created_at', 'asc');
    }

    public function likes()
    {
        return $this->hasMany(UserLike::class, 'master_comment_id');
    }

    // Add userProfile relationship
    public function userProfile()
    {
        return $this->hasOneThrough(UserProfile::class, User::class, 'id', 'user_id', 'user_id', 'id');
    }
}
