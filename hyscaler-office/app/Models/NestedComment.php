<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NestedComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_post_id',
        'master_comment_id',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(UserPost::class, 'user_post_id');
    }

    public function masterComment()
    {
        return $this->belongsTo(UserComment::class, 'master_comment_id');
    }
    public function likes()
{
    return $this->hasMany(UserLike::class, 'nested_comment_id');
}
}