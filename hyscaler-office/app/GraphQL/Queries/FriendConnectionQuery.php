<?php

namespace App\GraphQL\Queries;

use GraphQL\Error\Error;

class FriendConnectionQuery
{
    public function pendingRequests($rootValue, array $args, $context)
    {
        $user = $context->user();
        
        if (!$user) {
            throw new Error('Unauthenticated');
        }

        return $user->receivedFriendRequests()->where('accepted', false)->get();
    }

    public function friends($rootValue, array $args, $context)
    {
        $user = $context->user();
        
        if (!$user) {
            throw new Error('Unauthenticated');
        }

        return $user->friends;
    }
}