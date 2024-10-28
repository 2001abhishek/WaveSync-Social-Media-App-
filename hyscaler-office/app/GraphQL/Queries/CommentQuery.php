<?php

namespace App\GraphQL\Queries;

use App\Models\UserComment;

class CommentQuery
{
    public function getPostComments($root, array $args)
    {
        // Only get master comments (comments without a parent)
        return UserComment::where('user_post_id', $args['user_post_id'])
            ->whereNull('master_comment_id')  // This ensures we only get top-level comments
            ->with('nestedComments')  // Load the nested comments relationship
            ->orderBy('created_at', 'desc')
            ->get();
    }
}