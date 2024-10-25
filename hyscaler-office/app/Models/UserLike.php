<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLike extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_post_id',
        'master_comment_id',
        'nested_comment_id',
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

    public function nestedComment()
    {
        return $this->belongsTo(NestedComment::class, 'nested_comment_id');
    }
}