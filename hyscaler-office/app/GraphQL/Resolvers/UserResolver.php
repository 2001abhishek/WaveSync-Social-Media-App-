<?php

namespace App\GraphQL\Resolvers;

class UserResolver
{
    public function friends($root, $args, $context)
    {
        return $root->friends;
    }
}