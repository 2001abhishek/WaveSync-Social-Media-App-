<?php

namespace App\GraphQL\Queries;

use App\Models\UserPost;

class UserPostQuery
{
    public function getAllPosts($rootValue, array $args, $context)
    {
        $limit = $args['limit'] ?? 10;
        $offset = $args['offset'] ?? 0;

        return UserPost::with([
            'user',
            'likes.user',
            'comments' => function($query) {
                $query->with([
                    'user.userProfile',
                    'nestedComments' => function($nestedQuery) {
                        $nestedQuery->with('user.userProfile')
                                  ->orderBy('created_at', 'asc');
                    }
                ]);
            }
        ])
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->offset($offset)
        ->get();
    }

    public function getUserPosts($rootValue, array $args, $context)
    {
        $userId = $args['user_id'];
        
        return UserPost::with([
            'user',
            'likes.user',
            'comments' => function($query) {
                $query->with([
                    'user.userProfile',
                    'nestedComments' => function($nestedQuery) {
                        $nestedQuery->with('user.userProfile')
                                  ->orderBy('created_at', 'asc');
                    }
                ]);
            }
        ])
        ->where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();
    }
}
